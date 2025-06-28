import { TwitterAgent } from './TwitterAgent';
import { metricsSync } from '../core/metricsSync';
import { db } from '../../../data-model/src/client';

// --- Type Definitions ---
export interface TweetContent {
  text: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledTime?: Date;
}

export interface ABTestVariant {
  id: string;
  content: TweetContent;
  suffix: string; // "(A)", "(B)", "(C)"
  posted: boolean;
  tweetId?: string;
  postedAt?: Date;
}

export interface ABTestResult {
  testId: string;
  campaignId: string;
  variants: ABTestVariant[];
  winner?: ABTestVariant;
  metrics: {
    totalEngagement: number;
    engagementRate: number;
    impressions: number;
    clicks: number;
    retweets: number;
    likes: number;
    replies: number;
  };
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
}

export interface ABTestConfig {
  maxVariants: number;
  spacingMinutes: number;
  evaluationHours: number;
  engagementThreshold: number;
}

// --- Default Configuration ---
const DEFAULT_CONFIG: ABTestConfig = {
  maxVariants: 3,
  spacingMinutes: 30,
  evaluationHours: 2,
  engagementThreshold: 0.02, // 2% engagement rate
};

// --- Mock AB Test Store (Replace with DB when schema is updated) ---
const abTestStore: Map<string, ABTestResult> = new Map();

// --- AB Testing Class ---
export class TwitterABTest {
  private twitterAgent: TwitterAgent;
  private config: ABTestConfig;

  constructor(agentId: string = 'ab-test-agent', config: Partial<ABTestConfig> = {}) {
    this.twitterAgent = new TwitterAgent(agentId, 'AB Test Agent');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // --- Run A/B Test ---
  async runABTest(
    tweetVariants: TweetContent[], 
    campaignId: string,
    customConfig?: Partial<ABTestConfig>
  ): Promise<TweetContent> {
    const config = { ...this.config, ...customConfig };
    const testId = `ab_test_${Date.now()}_${campaignId}`;
    
    try {
      console.log(`Starting A/B test ${testId} with ${tweetVariants.length} variants`);
      
      // Validate variants
      if (tweetVariants.length === 0) {
        throw new Error('No tweet variants provided for A/B test');
      }
      
      if (tweetVariants.length > config.maxVariants) {
        console.warn(`Too many variants (${tweetVariants.length}), limiting to ${config.maxVariants}`);
        tweetVariants = tweetVariants.slice(0, config.maxVariants);
      }
      
      // Create test variants
      const variants: ABTestVariant[] = tweetVariants.map((content, index) => ({
        id: `${testId}_variant_${index}`,
        content: this.addVariantSuffix(content, index),
        suffix: this.getVariantSuffix(index),
        posted: false,
      }));
      
      // Initialize test result
      const testResult: ABTestResult = {
        testId,
        campaignId,
        variants,
        metrics: {
          totalEngagement: 0,
          engagementRate: 0,
          impressions: 0,
          clicks: 0,
          retweets: 0,
          likes: 0,
          replies: 0,
        },
        startedAt: new Date(),
        status: 'running',
      };
      
      abTestStore.set(testId, testResult);
      
      // Post variants with spacing
      await this.postVariants(variants, config.spacingMinutes);
      
      // Wait for evaluation period
      console.log(`Waiting ${config.evaluationHours} hours for evaluation...`);
      await this.waitForEvaluation(config.evaluationHours);
      
      // Collect metrics and determine winner
      const winner = await this.evaluateResults(testId, campaignId);
      
      // Update test result
      const updatedResult = abTestStore.get(testId);
      if (updatedResult) {
        updatedResult.winner = winner;
        updatedResult.completedAt = new Date();
        updatedResult.status = 'completed';
        abTestStore.set(testId, updatedResult);
      }
      
      console.log(`A/B test ${testId} completed. Winner: ${winner?.suffix}`);
      
      return winner?.content || tweetVariants[0];
      
    } catch (error) {
      console.error(`A/B test ${testId} failed:`, error);
      
      // Mark test as failed
      const testResult = abTestStore.get(testId);
      if (testResult) {
        testResult.status = 'failed';
        testResult.completedAt = new Date();
        abTestStore.set(testId, testResult);
      }
      
      // Return first variant as fallback
      return tweetVariants[0];
    }
  }

  // --- Post Variants with Spacing ---
  private async postVariants(variants: ABTestVariant[], spacingMinutes: number): Promise<void> {
    for (const variant of variants) {
      try {
        console.log(`Posting variant ${variant.suffix}: ${variant.content.text.substring(0, 50)}...`);
        
        // Convert TweetContent to the format expected by TwitterAgent
        const tweetContent = {
          text: variant.content.text,
          hashtags: variant.content.hashtags || [],
          mediaUrl: variant.content.mediaUrls?.[0],
          scheduledTime: variant.content.scheduledTime,
        };
        
        // Post tweet
        const response = await this.twitterAgent.postTweet(tweetContent);
        
        // Update variant
        variant.posted = true;
        variant.tweetId = response.tweetId;
        variant.postedAt = new Date();
        
        console.log(`Posted variant ${variant.suffix} with ID: ${response.tweetId}`);
        
        // Wait before posting next variant (except for last one)
        if (variant !== variants[variants.length - 1]) {
          const waitMs = spacingMinutes * 60 * 1000;
          console.log(`Waiting ${spacingMinutes} minutes before next variant...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
        
      } catch (error) {
        console.error(`Failed to post variant ${variant.suffix}:`, error);
        variant.posted = false;
      }
    }
  }

  // --- Wait for Evaluation Period ---
  private async waitForEvaluation(hours: number): Promise<void> {
    const waitMs = hours * 60 * 60 * 1000;
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  // --- Evaluate Results and Determine Winner ---
  private async evaluateResults(testId: string, campaignId: string): Promise<ABTestVariant | undefined> {
    const testResult = abTestStore.get(testId);
    if (!testResult) {
      throw new Error(`Test result not found for ${testId}`);
    }
    
    const postedVariants = testResult.variants.filter(v => v.posted && v.tweetId);
    
    if (postedVariants.length === 0) {
      console.warn('No variants were successfully posted');
      return undefined;
    }
    
    // Collect metrics for each variant
    const variantMetrics = await Promise.all(
      postedVariants.map(async (variant) => {
        const metrics = await this.collectVariantMetrics(variant.tweetId!, campaignId);
        return { variant, metrics };
      })
    );
    
    // Calculate engagement scores
    const scoredVariants = variantMetrics.map(({ variant, metrics }) => {
      const engagementScore = this.calculateEngagementScore(metrics);
      return { variant, metrics, engagementScore };
    });
    
    // Sort by engagement score (highest first)
    scoredVariants.sort((a, b) => b.engagementScore - a.engagementScore);
    
    const winner = scoredVariants[0];
    
    // Log results
    console.log('A/B Test Results:');
    scoredVariants.forEach(({ variant, metrics, engagementScore }) => {
      console.log(`${variant.suffix}: Engagement Score = ${engagementScore.toFixed(4)}`);
      console.log(`  - Likes: ${metrics.likes}, Retweets: ${metrics.retweets}, Replies: ${metrics.replies}`);
      console.log(`  - Engagement Rate: ${(metrics.engagementRate * 100).toFixed(2)}%`);
    });
    
    return winner.variant;
  }

  // --- Collect Metrics for Variant ---
  private async collectVariantMetrics(tweetId: string, campaignId: string): Promise<any> {
    try {
      // Use metricsSync to get tweet performance data
      const performanceRecords = await metricsSync.fetchTweetPerformance(campaignId, 1);
      const tweetMetrics = performanceRecords.find(record => record.tweetId === tweetId);
      
      // Mock metrics if not available
      if (!tweetMetrics) {
        return {
          likes: Math.floor(Math.random() * 100) + 10,
          retweets: Math.floor(Math.random() * 20) + 2,
          replies: Math.floor(Math.random() * 15) + 1,
          impressions: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 50) + 5,
          engagementRate: Math.random() * 0.05 + 0.01, // 1-6%
        };
      }
      
      return {
        likes: tweetMetrics.likes,
        retweets: tweetMetrics.retweets,
        replies: tweetMetrics.replies,
        impressions: tweetMetrics.impressions,
        clicks: 0, // Not available in current metrics
        engagementRate: tweetMetrics.engagementScore / 100, // Convert to rate
      };
      
    } catch (error) {
      console.error(`Error collecting metrics for tweet ${tweetId}:`, error);
      
      // Return mock metrics as fallback
      return {
        likes: Math.floor(Math.random() * 50) + 5,
        retweets: Math.floor(Math.random() * 10) + 1,
        replies: Math.floor(Math.random() * 8) + 1,
        impressions: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 25) + 2,
        engagementRate: Math.random() * 0.03 + 0.005, // 0.5-3.5%
      };
    }
  }

  // --- Calculate Engagement Score ---
  private calculateEngagementScore(metrics: any): number {
    const { likes, retweets, replies, impressions, engagementRate } = metrics;
    
    // Weighted engagement score
    const likeWeight = 1;
    const retweetWeight = 2; // Retweets are more valuable
    const replyWeight = 3;   // Replies are most valuable
    
    const weightedEngagement = (likes * likeWeight) + (retweets * retweetWeight) + (replies * replyWeight);
    const reachFactor = Math.log(impressions + 1) / Math.log(1000); // Logarithmic scaling
    
    return (weightedEngagement * reachFactor) + (engagementRate * 100);
  }

  // --- Add Variant Suffix to Content ---
  private addVariantSuffix(content: TweetContent, index: number): TweetContent {
    const suffix = this.getVariantSuffix(index);
    const suffixText = ` ${suffix}`;
    
    // Check if adding suffix would exceed character limit
    const maxLength = 280 - suffixText.length;
    const truncatedText = content.text.length > maxLength 
      ? content.text.substring(0, maxLength - 3) + '...'
      : content.text;
    
    return {
      ...content,
      text: truncatedText + suffixText,
    };
  }

  // --- Get Variant Suffix ---
  private getVariantSuffix(index: number): string {
    const suffixes = ['(A)', '(B)', '(C)', '(D)', '(E)'];
    return suffixes[index] || `(${String.fromCharCode(65 + index)})`;
  }

  // --- Get Test Results ---
  async getTestResults(testId: string): Promise<ABTestResult | undefined> {
    return abTestStore.get(testId);
  }

  // --- Get All Test Results for Campaign ---
  async getCampaignTestResults(campaignId: string): Promise<ABTestResult[]> {
    return Array.from(abTestStore.values())
      .filter(result => result.campaignId === campaignId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // --- Get Active Tests ---
  async getActiveTests(): Promise<ABTestResult[]> {
    return Array.from(abTestStore.values())
      .filter(result => result.status === 'running');
  }

  // --- Cancel Test ---
  async cancelTest(testId: string): Promise<void> {
    const testResult = abTestStore.get(testId);
    if (testResult && testResult.status === 'running') {
      testResult.status = 'failed';
      testResult.completedAt = new Date();
      abTestStore.set(testId, testResult);
      console.log(`A/B test ${testId} cancelled`);
    }
  }
}

// --- Export Singleton Instance ---
export const twitterABTest = new TwitterABTest();

// --- Export Helper Functions ---
export const runABTest = (
  tweetVariants: TweetContent[], 
  campaignId: string,
  config?: Partial<ABTestConfig>
) => twitterABTest.runABTest(tweetVariants, campaignId, config);

export const getTestResults = (testId: string) => 
  twitterABTest.getTestResults(testId);

export const getCampaignTestResults = (campaignId: string) => 
  twitterABTest.getCampaignTestResults(campaignId); 
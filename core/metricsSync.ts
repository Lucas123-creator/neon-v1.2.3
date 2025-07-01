import { OpenAI } from 'openai';
// import { prisma } from '../../data-model/client'; // Placeholder for future DB client
// import { vectorStore } from '../../utils/vectorStore'; // Placeholder for future vector DB

// --- Type Definitions ---
export interface TweetPerformanceRecord {
  tweetId: string;
  campaignId: string;
  tweetText: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  engagementScore: number;
  postedAt: Date;
  hashtags: string[];
}

export interface TweetMetric {
  id: string;
  tweetId: string;
  campaignId: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  engagementScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VectorizedTweet {
  id: string;
  tweetId: string;
  campaignId: string;
  vector: number[];
  metadata: {
    text: string;
    engagementScore: number;
    hashtags: string[];
    postedAt: Date;
  };
}

export interface OptimizationInsights {
  topPerformers: TweetPerformanceRecord[];
  lowPerformers: TweetPerformanceRecord[];
  commonPatterns: string[];
  recommendedHashtags: string[];
  optimalLength: number;
  bestPostingTimes: string[];
}

export interface ModelImprovementLog {
  id: string;
  timestamp: Date;
  metric: 'BLEU' | 'ROUGE' | 'engagement_improvement';
  score: number;
  baseline: number;
  improvement: number;
  modelVersion: string;
}

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VECTOR_DIMENSION = 1536; // OpenAI embedding dimension
const SIMILARITY_THRESHOLD = 0.8;
const TOP_K_RESULTS = 10;

// --- OpenAI Client ---
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// --- Main Metrics Sync Class ---
export class MetricsSync {
  private improvementHistory: ModelImprovementLog[] = [];

  // --- Fetch Twitter Analytics ---
  async fetchTweetPerformance(campaignId: string, daysBack: number = 30): Promise<TweetPerformanceRecord[]> {
    try {
      // TODO: Replace with actual Twitter Analytics API call
      // const analytics = await twitterAPI.getAnalytics(campaignId, daysBack);
      
      // Mock data for now
      const mockTweets = this.generateMockTweetData(campaignId, daysBack);
      
      const performanceRecords: TweetPerformanceRecord[] = [];
      
      for (const tweet of mockTweets) {
        const record: TweetPerformanceRecord = {
          tweetId: tweet.id,
          campaignId,
          tweetText: tweet.text,
          likes: tweet.likes,
          retweets: tweet.retweets,
          replies: tweet.replies,
          impressions: tweet.impressions,
          engagementScore: this.calculateEngagementScore(tweet),
          postedAt: tweet.postedAt,
          hashtags: tweet.hashtags,
        };
        
        performanceRecords.push(record);
        
        // Store in DB
        await this.storeTweetMetric(record);
      }
      
      return performanceRecords;
      
    } catch (error) {
      console.error('Error fetching tweet performance:', error);
      return [];
    }
  }

  // --- Calculate Engagement Score ---
  calculateEngagementScore(record: Omit<TweetPerformanceRecord, 'engagementScore'>): number {
    const { likes, retweets, replies, impressions } = record;
    
    if (impressions === 0) return 0;
    
    // Weighted formula: likes (1x), retweets (2x), replies (3x)
    const weightedEngagement = (likes * 1) + (retweets * 2) + (replies * 3);
    const engagementRate = weightedEngagement / impressions;
    
    // Normalize to 0-100 scale
    return Math.min(engagementRate * 1000, 100);
  }

  // --- Vectorize Tweet Performance ---
  async vectorizeTweetPerformance(record: TweetPerformanceRecord): Promise<VectorizedTweet> {
    try {
      // Create text representation for embedding
      const textForEmbedding = this.createEmbeddingText(record);
      
      // Get OpenAI embedding
      const embedding = await this.getEmbedding(textForEmbedding);
      
      const vectorizedTweet: VectorizedTweet = {
        id: `vec_${record.tweetId}`,
        tweetId: record.tweetId,
        campaignId: record.campaignId,
        vector: embedding,
        metadata: {
          text: record.tweetText,
          engagementScore: record.engagementScore,
          hashtags: record.hashtags,
          postedAt: record.postedAt,
        },
      };
      
      // Store in vector DB
      await this.storeVector(vectorizedTweet);
      
      return vectorizedTweet;
      
    } catch (error) {
      console.error('Error vectorizing tweet performance:', error);
      throw error;
    }
  }

  // --- Create Text for Embedding ---
  private createEmbeddingText(record: TweetPerformanceRecord): string {
    return `
      Tweet: ${record.tweetText}
      Engagement Score: ${record.engagementScore}
      Hashtags: ${record.hashtags.join(', ')}
      Performance: ${record.likes} likes, ${record.retweets} retweets, ${record.replies} replies, ${record.impressions} impressions
    `.trim();
  }

  // --- Get OpenAI Embedding ---
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      
      return response.data[0].embedding;
      
    } catch (error) {
      console.error('Error getting embedding:', error);
      // Return mock embedding for fallback
      return Array.from({ length: VECTOR_DIMENSION }, () => Math.random());
    }
  }

  // --- Store Tweet Metric in DB ---
  private async storeTweetMetric(record: TweetPerformanceRecord): Promise<void> {
    // TODO: Replace with actual Prisma insert
    // await prisma.tweetMetric.create({
    //   data: {
    //     tweetId: record.tweetId,
    //     campaignId: record.campaignId,
    //     likes: record.likes,
    //     retweets: record.retweets,
    //     replies: record.replies,
    //     impressions: record.impressions,
    //     engagementScore: record.engagementScore,
    //   },
    // });
    
    // For now, log to console
    console.log('Storing tweet metric:', {
      tweetId: record.tweetId,
      engagementScore: record.engagementScore,
    });
  }

  // --- Store Vector in Vector DB ---
  private async storeVector(vectorizedTweet: VectorizedTweet): Promise<void> {
    // TODO: Replace with actual vector DB insert
    // await vectorStore.upsert(vectorizedTweet);
    
    // For now, log to console
    console.log('Storing vector:', {
      id: vectorizedTweet.id,
      vectorLength: vectorizedTweet.vector.length,
    });
  }

  // --- Get Optimization Insights ---
  async getOptimizationInsights(campaignId: string, tweetText: string): Promise<OptimizationInsights> {
    try {
      // Get embedding for current tweet
      const currentEmbedding = await this.getEmbedding(tweetText);
      
      // Find similar tweets in vector DB
      const similarTweets = await this.findSimilarTweets(currentEmbedding, campaignId);
      
      // Separate top and low performers
      const topPerformers = similarTweets.filter(t => t.metadata.engagementScore >= 70);
      const lowPerformers = similarTweets.filter(t => t.metadata.engagementScore < 30);
      
      // Extract insights
      const insights: OptimizationInsights = {
        topPerformers: topPerformers.map(t => ({
          tweetId: t.tweetId,
          campaignId: t.campaignId,
          tweetText: t.metadata.text,
          likes: 0, // Would be fetched from DB
          retweets: 0,
          replies: 0,
          impressions: 0,
          engagementScore: t.metadata.engagementScore,
          postedAt: t.metadata.postedAt,
          hashtags: t.metadata.hashtags,
        })),
        lowPerformers: lowPerformers.map(t => ({
          tweetId: t.tweetId,
          campaignId: t.campaignId,
          tweetText: t.metadata.text,
          likes: 0,
          retweets: 0,
          replies: 0,
          impressions: 0,
          engagementScore: t.metadata.engagementScore,
          postedAt: t.metadata.postedAt,
          hashtags: t.metadata.hashtags,
        })),
        commonPatterns: this.extractCommonPatterns(topPerformers),
        recommendedHashtags: this.extractRecommendedHashtags(topPerformers),
        optimalLength: this.calculateOptimalLength(topPerformers),
        bestPostingTimes: this.extractBestPostingTimes(topPerformers),
      };
      
      return insights;
      
    } catch (error) {
      console.error('Error getting optimization insights:', error);
      return this.getDefaultInsights();
    }
  }

  // --- Find Similar Tweets ---
  private async findSimilarTweets(embedding: number[], campaignId: string): Promise<VectorizedTweet[]> {
    // TODO: Replace with actual vector similarity search
    // return await vectorStore.similaritySearch(embedding, TOP_K_RESULTS, { campaignId });
    
    // Mock implementation
    const mockTweets = this.generateMockVectorizedTweets(campaignId);
    return mockTweets.slice(0, TOP_K_RESULTS);
  }

  // --- Extract Common Patterns ---
  private extractCommonPatterns(topPerformers: VectorizedTweet[]): string[] {
    const patterns: string[] = [];
    
    // Analyze text patterns
    const texts = topPerformers.map(t => t.metadata.text.toLowerCase());
    
    // Check for common phrases
    if (texts.some(t => t.includes('exclusive'))) patterns.push('Use "exclusive" for urgency');
    if (texts.some(t => t.includes('limited time'))) patterns.push('Include time constraints');
    if (texts.some(t => t.includes('?'))) patterns.push('Ask questions to engage');
    if (texts.some(t => t.includes('✨'))) patterns.push('Use sparkle emoji for visual appeal');
    
    return patterns;
  }

  // --- Extract Recommended Hashtags ---
  private extractRecommendedHashtags(topPerformers: VectorizedTweet[]): string[] {
    const hashtagCounts = new Map<string, number>();
    
    for (const tweet of topPerformers) {
      for (const hashtag of tweet.metadata.hashtags) {
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + 1);
      }
    }
    
    // Return top 5 hashtags
    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hashtag]) => hashtag);
  }

  // --- Calculate Optimal Length ---
  private calculateOptimalLength(topPerformers: VectorizedTweet[]): number {
    const lengths = topPerformers.map(t => t.metadata.text.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    return Math.round(avgLength);
  }

  // --- Extract Best Posting Times ---
  private extractBestPostingTimes(topPerformers: VectorizedTweet[]): string[] {
    const times = topPerformers.map(t => t.metadata.postedAt.getHours());
    const timeCounts = new Map<number, number>();
    
    for (const hour of times) {
      timeCounts.set(hour, (timeCounts.get(hour) || 0) + 1);
    }
    
    // Return top 3 posting hours
    return Array.from(timeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);
  }

  // --- Get Default Insights ---
  private getDefaultInsights(): OptimizationInsights {
    return {
      topPerformers: [],
      lowPerformers: [],
      commonPatterns: ['Keep tweets under 280 characters', 'Include relevant hashtags'],
      recommendedHashtags: ['#NeonSigns', '#SmallBusiness'],
      optimalLength: 200,
      bestPostingTimes: ['9:00', '12:00', '18:00'],
    };
  }

  // --- Log Model Improvement ---
  async logModelImprovement(metric: string, score: number, baseline: number): Promise<void> {
    const improvement = score - baseline;
    
    const logEntry: ModelImprovementLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      metric: metric as 'BLEU' | 'ROUGE' | 'engagement_improvement',
      score,
      baseline,
      improvement,
      modelVersion: '1.0.0',
    };
    
    this.improvementHistory.push(logEntry);
    
    // TODO: Store in DB
    // await prisma.modelImprovementLog.create({ data: logEntry });
    
    console.log('Model improvement logged:', logEntry);
  }

  // --- Generate Mock Data ---
  private generateMockTweetData(campaignId: string, daysBack: number): any[] {
    const tweets = [];
    const hashtags = ['#NeonSigns', '#SmallBusiness', '#RestaurantMarketing', '#CustomLighting'];
    
    for (let i = 0; i < 20; i++) {
      const postedAt = new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
      
      tweets.push({
        id: `tweet_${i}`,
        text: `Illuminate your business with stunning neon signage! ✨ Perfect for small business owners. #${hashtags[Math.floor(Math.random() * hashtags.length)]}`,
        likes: Math.floor(Math.random() * 100),
        retweets: Math.floor(Math.random() * 50),
        replies: Math.floor(Math.random() * 20),
        impressions: Math.floor(Math.random() * 1000) + 100,
        postedAt,
        hashtags: [hashtags[Math.floor(Math.random() * hashtags.length)]],
      });
    }
    
    return tweets;
  }

  // --- Generate Mock Vectorized Tweets ---
  private generateMockVectorizedTweets(campaignId: string): VectorizedTweet[] {
    const tweets = [];
    
    for (let i = 0; i < 10; i++) {
      tweets.push({
        id: `vec_${i}`,
        tweetId: `tweet_${i}`,
        campaignId,
        vector: Array.from({ length: VECTOR_DIMENSION }, () => Math.random()),
        metadata: {
          text: `Sample tweet ${i} with neon signage content`,
          engagementScore: Math.random() * 100,
          hashtags: ['#NeonSigns'],
          postedAt: new Date(),
        },
      });
    }
    
    return tweets;
  }

  // --- Get Improvement History ---
  getImprovementHistory(): ModelImprovementLog[] {
    return this.improvementHistory;
  }
}

// --- Export Singleton Instance ---
export const metricsSync = new MetricsSync(); 
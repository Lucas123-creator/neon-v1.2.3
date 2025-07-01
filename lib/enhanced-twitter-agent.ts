import { AbstractAgent, AgentPayload, AgentResult } from '../base-agent';
import { logger } from '@neon/utils';
import * as fs from 'fs/promises';
import * as path from 'path';
import { metricsSync, type OptimizationInsights } from '../core/metricsSync';
import { brandSafetyFilter, type BrandSafetyResult } from '../utils/filters';
import { contextManager, type CampaignContext } from './contextManager';
import { throwIfPaused } from '../utils/agentControl';

/**
 * Twitter-specific content interface
 */
export interface TweetContent {
  text: string;
  mediaUrl?: string;
  hashtags: string[];
  scheduledTime?: Date;
  campaignId?: string;
  metadata?: Record<string, any>;
}

/**
 * Twitter API response interface
 */
export interface TweetResponse {
  tweetId: string;
  success: boolean;
  error?: string;
  url?: string;
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
    views?: number;
  };
  publishedAt?: Date;
}

/**
 * Twitter trend analysis interface
 */
export interface TrendInsight {
  topic: string;
  volume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  hashtag?: string;
  relatedTopics?: string[];
  growthRate?: number;
  region?: string;
  detectedAt: Date;
}

/**
 * Content optimization result interface
 */
export interface ImprovedTweet {
  original: TweetContent;
  optimized: TweetContent;
  rationale: string;
  improvements: string[];
  confidence: number;
  estimatedEngagement?: number;
}

/**
 * Twitter mention interface
 */
export interface TwitterMention {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  requiresResponse: boolean;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Twitter Agent Configuration
 */
export interface TwitterAgentConfig {
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  maxTweetLength: number;
  enableAutoResponses: boolean;
  enableTrendScanning: boolean;
  enableContentOptimization: boolean;
  rateLimitDelay: number;
}

/**
 * TwitterAgent - Specialized agent for Twitter automation and engagement
 * 
 * Handles tweet generation, posting, trend analysis, mention responses,
 * and content optimization for Twitter platform.
 */
export class TwitterAgent extends AbstractAgent {
  private config: TwitterAgentConfig;
  private connectedAccounts: Map<string, any> = new Map();
  private trendCache: Map<string, TrendInsight[]> = new Map();
  private responseTemplates: Map<string, string[]> = new Map();

  constructor(id: string, name: string, config?: Partial<any>) {
    super(id, name, 'twitter', [
      'generate_tweet',
      'post_tweet',
      'respond_to_mention',
      'scan_trends',
      'optimize_content',
      'analyze_performance',
      'manage_accounts',
      'schedule_tweets',
      'track_mentions',
      'generate_thread'
    ]);

    this.config = {
      maxTweetLength: 280,
      enableAutoResponses: true,
      enableTrendScanning: true,
      enableContentOptimization: true,
      rateLimitDelay: 1000,
      ...config
    };

    this.initializeResponseTemplates();
  }

  /**
   * Execute Twitter agent tasks
   */
  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const { task, context } = payload;
      
      switch (task) {
        case 'generate_tweet':
          return await this.generateTweet(context?.campaignId || context?.topic || 'default-campaign');
        case 'post_tweet':
          if (!context?.content) {
            throw new Error('Content is required for posting tweet');
          }
          return await this.postTweet(context.content);
        case 'respond_to_mention':
          if (!context?.mentionId || !context?.context) {
            throw new Error('Mention ID and context are required for responding to mention');
          }
          return await this.respondToMention(context.mentionId, context.context);
        case 'scan_trends':
          return await this.scanTrends();
        case 'optimize_content':
          return await this.optimizeContent(context?.previousResults || []);
        case 'analyze_performance':
          return await this.analyzePerformance(context?.tweetIds || []);
        case 'manage_accounts':
          return await this.manageAccounts(context?.action || 'list', context?.accountData);
        case 'schedule_tweets':
          return await this.scheduleTweets(context?.tweets || []);
        case 'track_mentions':
          return await this.trackMentions(context?.keywords || []);
        case 'generate_thread':
          if (!context?.topic) {
            throw new Error('Topic is required for generating thread');
          }
          return await this.generateThread(context.topic, context?.points || []);
        default:
          throw new Error(`Unknown Twitter agent task: ${task}`);
      }
    });
  }

  /**
   * Generate tweet content for a campaign or topic
   */
  async generateTweet(campaignId: string): Promise<TweetContent> {
    // Check if agent is paused
    await throwIfPaused('TwitterAgent');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'generate_tweet',
      campaignId,
      status: 'processing'
    };

    try {
      // Get campaign context with persona
      const campaignContext = await contextManager.getCampaignContext(campaignId);
      
      // Generate tweet content using AI with persona context
      const tweetText = await this.generateTweetTextWithPersona(campaignContext);
      
      // Generate relevant hashtags based on persona
      const hashtags = await this.generateHashtagsWithPersona(campaignContext);
      
      // Optimize content length
      const optimizedText = this.optimizeTextLength(tweetText, hashtags);
      
      // Check brand safety
      const safetyResult = await brandSafetyFilter.checkBrandSafety(optimizedText, campaignId);
      
      let finalText = optimizedText;
      if (!safetyResult.isSafe) {
        if (safetyResult.revision) {
          finalText = safetyResult.revision;
          logger.info('Tweet revised for brand safety', { 
            original: optimizedText, 
            revised: finalText,
            flaggedTerms: safetyResult.flaggedTerms 
          }, 'TwitterAgent');
        } else {
          throw new Error(`Tweet rejected for brand safety: ${safetyResult.auditLog.reason}`);
        }
      }
      
      const tweetContent: TweetContent = {
        text: finalText,
        hashtags,
        campaignId,
        metadata: {
          generatedAt: new Date().toISOString(),
          brandSafetyChecked: true,
          safetyResult: {
            isSafe: safetyResult.isSafe,
            confidence: safetyResult.confidence,
            flaggedTerms: safetyResult.flaggedTerms,
          },
          persona: {
            id: campaignContext.persona.id,
            name: campaignContext.persona.name,
            tone: campaignContext.tone,
          },
          campaignContext: {
            goal: campaignContext.goal,
            product: campaignContext.product,
            audience: campaignContext.audience,
          },
        },
      };

      // Log generation success
      await this.logTwitterEvent({
        ...logEntry,
        status: 'success',
        safetyChecked: true,
        confidence: safetyResult.confidence,
        persona: campaignContext.persona.name,
      });

      return tweetContent;

    } catch (error) {
      await this.logTwitterEvent({
        ...logEntry,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Post tweet to Twitter
   */
  async postTweet(content: TweetContent): Promise<TweetResponse> {
    // Check if agent is paused
    await throwIfPaused('TwitterAgent');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'post_tweet',
      campaignId: content.campaignId,
      status: 'processing'
    };

    try {
      // Validate tweet content
      this.validateTweetContent(content);
      
      // Final brand safety check before posting
      const safetyResult = await brandSafetyFilter.checkBrandSafety(content.text, content.campaignId);
      
      if (!safetyResult.isSafe) {
        throw new Error(`Tweet blocked for brand safety: ${safetyResult.auditLog.reason}`);
      }
      
      // Check rate limits
      await this.checkRateLimits();
      
      // Post to Twitter API
      const response = await this.postToTwitterAPI(content);
      
      // Log successful post
      await this.logTwitterEvent({
        ...logEntry,
        status: 'success',
        tweetId: response.tweetId,
        url: response.url,
      });
      
      return response;

    } catch (error) {
      await this.logTwitterEvent({
        ...logEntry,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Respond to Twitter mention
   */
  async respondToMention(id: string, context: string): Promise<void> {
    // Check if agent is paused
    await throwIfPaused('TwitterAgent');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'respond_to_mention',
      mentionId: id,
      status: 'processing'
    };

    try {
      // Get mention details
      const mention = await this.getMentionDetails(id);
      
      // Generate appropriate response
      const response = await this.generateMentionResponse(mention, context);
      
      // Post response
      await this.postTweet({
        text: response,
        hashtags: [],
        metadata: { isReply: true, originalMentionId: id }
      });
      
      logEntry.status = 'success';
      await this.logTwitterEvent({
        ...logEntry,
        result: { responseLength: response.length }
      });

    } catch (error) {
      logEntry.status = 'failed';
      await this.logTwitterEvent({
        ...logEntry,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Scan Twitter trends
   */
  async scanTrends(): Promise<TrendInsight[]> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'scan_trends',
      status: 'processing'
    };

    try {
      // Check cache first
      const cacheKey = `trends_${new Date().toISOString().split('T')[0]}`;
      const cached = this.trendCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached[0]?.detectedAt)) {
        logEntry.status = 'cached';
        await this.logTwitterEvent({
          ...logEntry,
          result: { trendCount: cached.length, source: 'cache' }
        });
        return cached;
      }

      // Fetch trends from Twitter API
      const trends = await this.fetchTrendingTopics();
      
      // Analyze sentiment for each trend
      const insights = await Promise.all(
        trends.map(trend => this.analyzeTrendSentiment(trend))
      );

      // Cache results
      this.trendCache.set(cacheKey, insights);
      
      logEntry.status = 'success';
      await this.logTwitterEvent({
        ...logEntry,
        result: { trendCount: insights.length, source: 'api' }
      });

      return insights;

    } catch (error) {
      logEntry.status = 'failed';
      await this.logTwitterEvent({
        ...logEntry,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Optimize tweet content based on previous performance and metrics
   */
  async optimizeContent(previousResults: TweetContent[]): Promise<ImprovedTweet> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'optimize_content',
      previousResultsCount: previousResults.length,
      status: 'processing'
    };

    try {
      // Get the most recent tweet for optimization
      const originalTweet = previousResults[previousResults.length - 1];
      if (!originalTweet) {
        throw new Error('No previous tweet content provided for optimization');
      }

      // Get optimization insights from metrics sync
      const insights = await metricsSync.getOptimizationInsights(
        originalTweet.campaignId || 'default-campaign',
        originalTweet.text
      );

      // Apply insights to optimize content
      const optimizedTweet = await this.applyOptimizationInsights(originalTweet, insights);

      // Generate optimization rationale
      const rationale = this.generateOptimizationRationale(insights);

      // Calculate confidence based on insights quality
      const confidence = this.calculateOptimizationConfidence(insights);

      // Estimate engagement improvement
      const estimatedEngagement = this.estimateEngagement(optimizedTweet);

      const improvedTweet: ImprovedTweet = {
        original: originalTweet,
        optimized: optimizedTweet,
        rationale,
        improvements: this.extractImprovements(insights),
        confidence,
        estimatedEngagement,
      };

      // Log optimization success
      await this.logTwitterEvent({
        ...logEntry,
        status: 'success',
        confidence,
        estimatedEngagement,
      });

      return improvedTweet;

    } catch (error) {
      await this.logTwitterEvent({
        ...logEntry,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Apply optimization insights to tweet content
   */
  private async applyOptimizationInsights(
    originalTweet: TweetContent,
    insights: OptimizationInsights
  ): Promise<TweetContent> {
    let optimizedText = originalTweet.text;
    let optimizedHashtags = [...originalTweet.hashtags];

    // Apply common patterns from top performers
    if (insights.commonPatterns.length > 0) {
      optimizedText = this.applyCommonPatterns(optimizedText, insights.commonPatterns);
    }

    // Add recommended hashtags (if not already present)
    for (const hashtag of insights.recommendedHashtags) {
      if (!optimizedHashtags.includes(hashtag)) {
        optimizedHashtags.push(hashtag);
      }
    }

    // Optimize text length if needed
    if (optimizedText.length > insights.optimalLength) {
      optimizedText = this.truncateToOptimalLength(optimizedText, insights.optimalLength);
    }

    // Ensure we don't exceed Twitter's character limit
    const finalText = this.optimizeTextLength(optimizedText, optimizedHashtags);

    return {
      ...originalTweet,
      text: finalText,
      hashtags: optimizedHashtags,
      metadata: {
        ...originalTweet.metadata,
        optimizationApplied: true,
        insightsUsed: insights.commonPatterns,
        optimalLength: insights.optimalLength,
      },
    };
  }

  /**
   * Apply common patterns from top-performing tweets
   */
  private applyCommonPatterns(text: string, patterns: string[]): string {
    let optimizedText = text;

    for (const pattern of patterns) {
      if (pattern.includes('exclusive') && !optimizedText.toLowerCase().includes('exclusive')) {
        optimizedText = `Exclusive: ${optimizedText}`;
      }
      if (pattern.includes('limited time') && !optimizedText.toLowerCase().includes('limited')) {
        optimizedText = `${optimizedText} Limited time offer!`;
      }
      if (pattern.includes('questions') && !optimizedText.includes('?')) {
        optimizedText = `${optimizedText} What do you think?`;
      }
      if (pattern.includes('sparkle emoji') && !optimizedText.includes('✨')) {
        optimizedText = `${optimizedText} ✨`;
      }
    }

    return optimizedText;
  }

  /**
   * Truncate text to optimal length while preserving meaning
   */
  private truncateToOptimalLength(text: string, optimalLength: number): string {
    if (text.length <= optimalLength) return text;

    // Try to truncate at word boundaries
    const words = text.split(' ');
    let truncated = '';
    
    for (const word of words) {
      if ((truncated + ' ' + word).length <= optimalLength) {
        truncated += (truncated ? ' ' : '') + word;
      } else {
        break;
      }
    }

    return truncated || text.substring(0, optimalLength);
  }

  /**
   * Generate optimization rationale based on insights
   */
  private generateOptimizationRationale(insights: OptimizationInsights): string {
    const rationales: string[] = [];

    if (insights.topPerformers.length > 0) {
      rationales.push(`Applied patterns from ${insights.topPerformers.length} top-performing tweets`);
    }

    if (insights.commonPatterns.length > 0) {
      rationales.push(`Incorporated ${insights.commonPatterns.length} successful content patterns`);
    }

    if (insights.recommendedHashtags.length > 0) {
      rationales.push(`Added ${insights.recommendedHashtags.length} high-performing hashtags`);
    }

    if (insights.optimalLength > 0) {
      rationales.push(`Optimized length to ${insights.optimalLength} characters for better engagement`);
    }

    return rationales.join('. ') || 'Applied general optimization best practices';
  }

  /**
   * Extract specific improvements from insights
   */
  private extractImprovements(insights: OptimizationInsights): string[] {
    const improvements: string[] = [];

    // Add pattern improvements
    insights.commonPatterns.forEach(pattern => {
      improvements.push(`Applied: ${pattern}`);
    });

    // Add hashtag improvements
    if (insights.recommendedHashtags.length > 0) {
      improvements.push(`Enhanced hashtags: ${insights.recommendedHashtags.join(', ')}`);
    }

    // Add length optimization
    if (insights.optimalLength > 0) {
      improvements.push(`Optimized content length to ${insights.optimalLength} characters`);
    }

    // Add timing insights
    if (insights.bestPostingTimes.length > 0) {
      improvements.push(`Recommended posting times: ${insights.bestPostingTimes.join(', ')}`);
    }

    return improvements;
  }

  /**
   * Calculate optimization confidence based on insights quality
   */
  private calculateOptimizationConfidence(insights: OptimizationInsights): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence with more top performers
    if (insights.topPerformers.length >= 5) confidence += 0.2;
    else if (insights.topPerformers.length >= 2) confidence += 0.1;

    // Higher confidence with more patterns
    if (insights.commonPatterns.length >= 3) confidence += 0.15;
    else if (insights.commonPatterns.length >= 1) confidence += 0.05;

    // Higher confidence with recommended hashtags
    if (insights.recommendedHashtags.length >= 2) confidence += 0.1;

    // Higher confidence with optimal length data
    if (insights.optimalLength > 0) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate a tweet thread
   */
  async generateThread(topic: string, points: string[]): Promise<TweetContent[]> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: 'generate_thread',
      topic,
      pointsCount: points.length,
      status: 'processing'
    };

    try {
      const thread: TweetContent[] = [];
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const isFirst = i === 0;
        const isLast = i === points.length - 1;
        
        const tweetText = await this.generateThreadTweet(topic, point, i + 1, points.length, isFirst, isLast);
        const hashtags = isLast ? await this.generateHashtagsWithPersona({
          campaignId: 'default-campaign',
          goal: 'Educate audience',
          product: 'Neon Signs',
          audience: 'Business owners',
          persona: await contextManager.getPersonaProfile('neon-enthusiast'),
          hashtags: [],
          tone: 'bold',
        }) : [];
        
        thread.push({
          text: tweetText,
          hashtags,
          campaignId: 'default-campaign',
          metadata: {
            threadPosition: i + 1,
            totalThread: points.length,
            topic,
          },
        });
      }
      
      await this.logTwitterEvent({
        ...logEntry,
        status: 'success',
        threadLength: thread.length,
      });
      
      return thread;
      
    } catch (error) {
      await this.logTwitterEvent({
        ...logEntry,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Private helper methods

  /**
   * Generate tweet text with persona context
   */
  private async generateTweetTextWithPersona(context: CampaignContext): Promise<string> {
    const { persona, product, audience, goal, tone } = context;
    const guidelines = contextManager.getBrandVoiceGuidelines(persona);
    
    // Build persona-aware prompt
    const prompt = `You are the Twitter voice for a ${product} company with a ${persona.name} persona.

Persona Details:
- Tone: ${persona.tone}
- Emoji Style: ${persona.emojiStyle}
- Typical Phrases: ${persona.typicalPhrases.join(', ')}
- Visual Style: ${persona.visualStyle}

Campaign Context:
- Goal: ${goal}
- Target Audience: ${audience}
- Desired Tone: ${tone}

Brand Voice Guidelines:
DO: ${guidelines.do.join(', ')}
DON'T: ${guidelines.dont.join(', ')}

Generate one compelling tweet that matches this persona and campaign context. Keep it under 280 characters.`;

    // For now, return a mock response based on persona
    const mockTweets = persona.typicalPhrases.map(phrase => 
      `${phrase} ${product} for ${audience}. ${goal}!`
    );
    
    return mockTweets[Math.floor(Math.random() * mockTweets.length)] || 
           `Illuminate your ${audience} with stunning ${product}! ✨ ${goal}.`;
  }

  /**
   * Generate hashtags with persona context
   */
  private async generateHashtagsWithPersona(context: CampaignContext): Promise<string[]> {
    const { persona, hashtags: campaignHashtags } = context;
    const strategy = contextManager.getHashtagStrategy(persona);
    
    // Combine campaign hashtags with persona strategy
    const allHashtags = [...campaignHashtags, ...strategy];
    
    // Limit to 3-5 hashtags based on persona style
    const maxHashtags = persona.hashtagStyle === 'minimal' ? 3 : 5;
    
    return allHashtags.slice(0, maxHashtags);
  }

  private optimizeTextLength(text: string, hashtags: string[]): string {
    const hashtagText = hashtags.join(' ');
    const maxContentLength = this.config.maxTweetLength - hashtagText.length - 1;
    
    if (text.length <= maxContentLength) {
      return `${text} ${hashtagText}`;
    }
    
    return `${text.substring(0, maxContentLength - 3)}... ${hashtagText}`;
  }

  private validateTweetContent(content: TweetContent): void {
    if (!content.text || content.text.trim().length === 0) {
      throw new Error('Tweet text cannot be empty');
    }
    
    if (content.text.length > this.config.maxTweetLength) {
      throw new Error(`Tweet exceeds maximum length of ${this.config.maxTweetLength} characters`);
    }
  }

  private async checkRateLimits(): Promise<void> {
    // Mock rate limit check - in production, implement actual Twitter API rate limiting
    await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay));
  }

  private async postToTwitterAPI(_content: TweetContent): Promise<TweetResponse> {
    const tweetId = `mock_tweet_${Date.now()}`;
    
    return {
      tweetId,
      success: true,
      url: `https://twitter.com/user/status/${tweetId}`,
      engagement: {
        likes: Math.floor(Math.random() * 100),
        retweets: Math.floor(Math.random() * 50),
        replies: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 1000)
      },
      publishedAt: new Date()
    };
  }

  private async getCampaignContext(campaignId: string): Promise<any> {
    // Mock campaign data - in production, fetch from database
    return {
      id: campaignId,
      name: 'Sample Campaign',
      topic: 'AI Marketing',
      targetAudience: 'Business owners',
      goals: ['engagement', 'awareness']
    };
  }

  private async getMentionDetails(id: string): Promise<TwitterMention> {
    // Mock mention data - in production, fetch from Twitter API
    return {
      id,
      authorId: 'mock_author',
      authorUsername: '@mockuser',
      content: 'Great content!',
      createdAt: new Date(),
      sentiment: 'positive',
      requiresResponse: true,
      priority: 'medium'
    };
  }

  private async generateMentionResponse(mention: any, _context: string): Promise<string> {
    const templates = [
      `Thanks ${mention.authorUsername}! 🙏`,
      `Appreciate the kind words ${mention.authorUsername}! ✨`,
      `Glad you liked it ${mention.authorUsername}! 🚀`
    ];
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex] || templates[0] || `Thanks ${mention.authorUsername}!`;
  }

  private async fetchTrendingTopics(): Promise<any[]> {
    // Mock trending topics - in production, fetch from Twitter API
    return [
      { topic: 'AI Marketing', volume: 10000 },
      { topic: 'Digital Transformation', volume: 8000 },
      { topic: 'Social Media Strategy', volume: 6000 }
    ];
  }

  private async analyzeTrendSentiment(trend: any): Promise<TrendInsight> {
    const sentiments: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];
    const randomIndex = Math.floor(Math.random() * sentiments.length);
    const selectedSentiment = sentiments[randomIndex] || 'neutral';
    
    return {
      topic: trend.topic,
      volume: trend.volume,
      sentiment: selectedSentiment,
      hashtag: `#${trend.topic.replace(/\s+/g, '')}`,
      relatedTopics: [trend.topic],
      growthRate: Math.random() * 0.5,
      region: 'Global',
      detectedAt: new Date()
    };
  }

  private async analyzePreviousPerformance(results: TweetContent[]): Promise<any> {
    // Mock performance analysis - in production, analyze actual engagement data
    return {
      avgEngagement: Math.random() * 0.1,
      bestPerforming: results[0],
      worstPerforming: results[results.length - 1],
      commonElements: ['hashtags', 'questions', 'emojis']
    };
  }

  private generateOptimizationSuggestions(_performance: any): any[] {
    return [
      { type: 'hashtag', description: 'Add more relevant hashtags', impact: 'high' },
      { type: 'length', description: 'Optimize tweet length for better engagement', impact: 'medium' },
      { type: 'tone', description: 'Adjust tone for target audience', impact: 'medium' }
    ];
  }

  private async applyOptimizations(content: TweetContent, suggestions: any[]): Promise<TweetContent> {
    let optimized = { ...content };
    
    for (const suggestion of suggestions) {
      switch (suggestion.type) {
        case 'hashtag':
          optimized.hashtags = [...optimized.hashtags, '#optimized', '#improved'];
          break;
        case 'length':
          optimized.text = optimized.text.length > 200 ? 
            optimized.text.substring(0, 200) + '...' : optimized.text;
          break;
        case 'tone':
          optimized.text = optimized.text.replace(/🚀/g, '✨');
          break;
      }
    }
    
    return optimized;
  }

  private estimateEngagement(content: TweetContent): number {
    const baseEngagement = Math.random() * 100;
    const hashtagBonus = content.hashtags.length * 5;
    const lengthBonus = content.text.length > 100 ? 10 : 0;
    
    return Math.floor(baseEngagement + hashtagBonus + lengthBonus);
  }

  private async generateThreadTweet(
    topic: string,
    point: string,
    position: number,
    total: number,
    isFirst: boolean,
    isLast: boolean
  ): Promise<string> {
    if (isFirst) {
      return `🧵 ${total}/${total}: ${topic}\n\n${point}`;
    } else if (isLast) {
      return `${position}/${total}: ${point}\n\nWhat do you think? 👇`;
    } else {
      return `${position}/${total}: ${point}`;
    }
  }

  private isCacheValid(detectedAt?: Date): boolean {
    if (!detectedAt) return false;
    const cacheAge = Date.now() - detectedAt.getTime();
    return cacheAge < 3600000; // 1 hour cache
  }

  private initializeResponseTemplates(): void {
    this.responseTemplates.set('positive', [
      'Thanks {username}! 🙏',
      'Appreciate the kind words {username}! ✨',
      'Glad you liked it {username}! 🚀'
    ]);
    
    this.responseTemplates.set('neutral', [
      'Thanks for engaging {username}! 💭',
      'Appreciate your input {username}! 🤔',
      'Thanks for the feedback {username}! 📝'
    ]);
    
    this.responseTemplates.set('negative', [
      'Thanks for your perspective {username}. We\'re always learning! 📚',
      'Appreciate the feedback {username}. We\'ll take it into consideration! 💡',
      'Thanks for sharing your thoughts {username}. Every opinion matters! 🤝'
    ]);
  }

  private async logTwitterEvent(event: any): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logsDir, { recursive: true });
      
      const logFile = path.join(logsDir, 'twitter-agent.log');
      const logLine = JSON.stringify(event) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      logger.error('Failed to write Twitter agent log', { error }, 'TwitterAgent');
    }
  }

  // Additional methods for completeness
  private async analyzePerformance(tweetIds: string[]): Promise<any> {
    // Mock performance analysis
    return {
      totalTweets: tweetIds.length,
      avgEngagement: Math.random() * 0.15,
      topPerformer: tweetIds[0],
      recommendations: ['Post more during peak hours', 'Use trending hashtags']
    };
  }

  private async manageAccounts(action: string, _accountData: any): Promise<any> {
    return {
      success: true,
      action,
      accountsCount: this.connectedAccounts.size
    };
  }

  private async scheduleTweets(tweets: TweetContent[]): Promise<any> {
    // Mock tweet scheduling
    return {
      success: true,
      scheduledCount: tweets.length,
      scheduledTweets: tweets.map(t => ({ ...t, scheduledId: `sched_${Date.now()}` }))
    };
  }

  private async trackMentions(keywords: string[]): Promise<TwitterMention[]> {
    // Mock mention tracking
    return keywords.map(keyword => ({
      id: `mention_${Date.now()}`,
      authorId: 'mock_author',
      authorUsername: '@mockuser',
      content: `Mentioning ${keyword}`,
      createdAt: new Date(),
      sentiment: 'positive',
      requiresResponse: true,
      priority: 'medium'
    }));
  }

  /**
   * Get agent type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }
} 
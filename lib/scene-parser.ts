/**
 * Scene Parser Module for Twitter Agent
 * 
 * Enhanced scene parsing capabilities integrated from ContentCreator-0.1
 * Extracts structured content metadata for Twitter content generation
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { logger } from '../logger';

// Scene parsing schemas
const SceneSchema = z.object({
  id: z.number(),
  title: z.string().max(100),
  characters: z.array(z.string()).default([]),
  setting: z.string().max(200),
  summary: z.string().max(500),
  tone: z.string().max(50),
  hashtags: z.array(z.string()).default([]),
  callToAction: z.string().optional(),
  targetAudience: z.string().optional(),
  engagementStrategy: z.string().optional()
});

const SceneParseResultSchema = z.object({
  scenes: z.array(SceneSchema),
  success: z.boolean(),
  errorMessage: z.string().optional(),
  metadata: z.object({
    totalScenes: z.number(),
    estimatedTweets: z.number(),
    contentThemes: z.array(z.string()),
    recommendedTiming: z.array(z.string())
  }).optional()
});

export type Scene = z.infer<typeof SceneSchema>;
export type SceneParseResult = z.infer<typeof SceneParseResultSchema>;

export class SceneParser {
  private openai: OpenAI;
  private cache: Map<string, SceneParseResult> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Parse content into structured scenes for Twitter content generation
   */
  async parseScenes(inputContent: string, options: {
    maxScenes?: number;
    targetPlatform?: 'twitter' | 'linkedin' | 'instagram';
    contentType?: 'story' | 'article' | 'campaign';
    brandVoice?: string;
  } = {}): Promise<SceneParseResult> {
    const {
      maxScenes = 10,
      targetPlatform = 'twitter',
      contentType = 'story',
      brandVoice = 'professional'
    } = options;

    // Check cache first
    const cacheKey = this.generateCacheKey(inputContent, options);
    if (this.cache.has(cacheKey)) {
      logger.info('Returning cached scene parse result');
      return this.cache.get(cacheKey)!;
    }

    try {
      const prompt = this.buildParsePrompt(inputContent, {
        maxScenes,
        targetPlatform,
        contentType,
        brandVoice
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content strategist specializing in social media content planning. Parse content into engaging, tweetable scenes with proper hashtags and engagement strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response content from OpenAI');
      }

      // Parse JSON response
      const parsedData = JSON.parse(responseContent);
      const result = SceneParseResultSchema.parse(parsedData);

      // Add metadata
      result.metadata = {
        totalScenes: result.scenes.length,
        estimatedTweets: this.estimateTweetCount(result.scenes),
        contentThemes: this.extractThemes(result.scenes),
        recommendedTiming: this.generateTimingRecommendations(result.scenes)
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      logger.info(`Successfully parsed ${result.scenes.length} scenes`);
      return result;

    } catch (error) {
      logger.error('Scene parsing failed:', error);
      return {
        scenes: [],
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build comprehensive parsing prompt
   */
  private buildParsePrompt(content: string, options: {
    maxScenes: number;
    targetPlatform: string;
    contentType: string;
    brandVoice: string;
  }): string {
    return `
Parse the following content into ${options.maxScenes} engaging scenes optimized for ${options.targetPlatform}.

Content Type: ${options.contentType}
Brand Voice: ${options.brandVoice}
Target Platform: ${options.targetPlatform}

For each scene, provide:
- id: scene number (1-${options.maxScenes})
- title: catchy, tweetable title (max 100 chars)
- characters: relevant people/entities mentioned
- setting: context and environment
- summary: 1-2 line engaging summary (max 500 chars)
- tone: emotional tone (professional, casual, humorous, etc.)
- hashtags: 3-5 relevant hashtags for ${options.targetPlatform}
- callToAction: optional engagement prompt
- targetAudience: who this scene appeals to
- engagementStrategy: how to maximize engagement

Return ONLY valid JSON in this format:
{
  "scenes": [
    {
      "id": 1,
      "title": "Scene Title",
      "characters": ["Character1", "Character2"],
      "setting": "Location/context description",
      "summary": "Brief engaging summary",
      "tone": "emotional_tone",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "callToAction": "Optional CTA",
      "targetAudience": "Target audience",
      "engagementStrategy": "Engagement strategy"
    }
  ],
  "success": true
}

Content to parse:
${content}
`;
  }

  /**
   * Generate cache key for content and options
   */
  private generateCacheKey(content: string, options: Record<string, unknown>): string {
    const contentHash = Buffer.from(content).toString('base64').slice(0, 20);
    const optionsHash = Buffer.from(JSON.stringify(options)).toString('base64').slice(0, 10);
    return `${contentHash}_${optionsHash}`;
  }

  /**
   * Estimate number of tweets needed for scenes
   */
  private estimateTweetCount(scenes: Scene[]): number {
    return scenes.reduce((total, scene) => {
      // Base tweet for scene
      let count = 1;
      
      // Additional tweets for hashtags if many
      if (scene.hashtags.length > 3) count += 1;
      
      // Additional tweet for call to action
      if (scene.callToAction) count += 1;
      
      return total + count;
    }, 0);
  }

  /**
   * Extract common themes from scenes
   */
  private extractThemes(scenes: Scene[]): string[] {
    const themes = new Set<string>();
    
    scenes.forEach(scene => {
      // Extract themes from title and summary
      const text = `${scene.title} ${scene.summary}`.toLowerCase();
      
      if (text.includes('innovation') || text.includes('technology')) themes.add('Innovation');
      if (text.includes('success') || text.includes('achievement')) themes.add('Success');
      if (text.includes('learning') || text.includes('education')) themes.add('Learning');
      if (text.includes('community') || text.includes('collaboration')) themes.add('Community');
      if (text.includes('future') || text.includes('trend')) themes.add('Future Trends');
    });
    
    return Array.from(themes);
  }

  /**
   * Generate timing recommendations for scenes
   */
  private generateTimingRecommendations(scenes: Scene[]): string[] {
    const recommendations: string[] = [];
    
    if (scenes.length > 5) {
      recommendations.push('Spread content over 2-3 days for better engagement');
    }
    
    if (scenes.some(s => s.tone.includes('professional'))) {
      recommendations.push('Post professional content during business hours (9 AM - 5 PM)');
    }
    
    if (scenes.some(s => s.tone.includes('casual') || s.tone.includes('humorous'))) {
      recommendations.push('Post casual content during evening hours (6 PM - 9 PM)');
    }
    
    return recommendations;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Scene parser cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
} 
/**
 * Content Pipeline
 * 
 * Orchestrates the complete content creation workflow:
 * 1. Parse content into scenes
 * 2. Generate media for scenes
 * 3. Post to social media platforms
 * 4. Track analytics and performance
 */

import { SceneParser } from './scene-parser';
import { MediaGenerator } from './media-generator';
import { TwitterAgent } from './enhanced-twitter-agent';

export interface PipelineConfig {
  openaiKey: string;
  falKey?: string;
  twitterAgent: TwitterAgent;
}

export interface PipelineOptions {
  mediaType?: 'image' | 'video' | 'both';
  postToTwitter?: boolean;
  schedule?: boolean;
  maxScenes?: number;
  targetPlatform?: 'twitter' | 'linkedin' | 'instagram';
  contentType?: 'story' | 'article' | 'post';
  brandVoice?: 'professional' | 'friendly' | 'casual' | 'formal';
}

export interface PipelineResult {
  scenes: any[];
  media: {
    images?: any[];
    videos?: any[];
  };
  posts: any[];
  analytics: any;
}

export class ContentPipeline {
  private sceneParser: SceneParser;
  private mediaGenerator: MediaGenerator;
  private twitterAgent: TwitterAgent;

  constructor(config: PipelineConfig) {
    this.sceneParser = new SceneParser(config.openaiKey);
    this.mediaGenerator = new MediaGenerator(config.openaiKey, config.falKey);
    this.twitterAgent = config.twitterAgent;
  }

  /**
   * Run the complete content pipeline
   */
  async run(content: string, options: PipelineOptions = {}): Promise<PipelineResult> {
    try {
      console.log('🚀 Starting content pipeline...');

      // Step 1: Parse content into scenes
      console.log('📝 Parsing content into scenes...');
      const scenes = await this.sceneParser.parseScenes(content, {
        maxScenes: options.maxScenes || 10,
        targetPlatform: options.targetPlatform || 'twitter',
        contentType: options.contentType || 'story',
        brandVoice: options.brandVoice || 'professional'
      });

      console.log(`✅ Parsed ${scenes.length} scenes`);

      // Step 2: Generate media for scenes
      let media = { images: [], videos: [] };
      if (options.mediaType && options.mediaType !== 'none') {
        console.log('🎨 Generating media for scenes...');
        media = await this.mediaGenerator.generateBatchMedia(scenes, options.mediaType, {
          quality: 'standard',
          aspectRatio: '16:9',
          style: 'cinematic'
        });
        console.log(`✅ Generated ${media.images?.length || 0} images and ${media.videos?.length || 0} videos`);
      }

      // Step 3: Post to Twitter if requested
      let posts = [];
      if (options.postToTwitter) {
        console.log('🐦 Posting content to Twitter...');
        posts = await this.postScenesToTwitter(scenes, media);
        console.log(`✅ Posted ${posts.length} tweets`);
      }

      // Step 4: Generate analytics
      console.log('📊 Generating analytics...');
      const analytics = await this.generateAnalytics(scenes, posts);

      console.log('🎉 Content pipeline completed successfully!');

      return {
        scenes,
        media,
        posts,
        analytics
      };

    } catch (error) {
      console.error('❌ Content pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Post scenes to Twitter
   */
  private async postScenesToTwitter(scenes: any[], media: any): Promise<any[]> {
    const posts = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneMedia = this.getMediaForScene(media, i);
      
      try {
        const post = await this.twitterAgent.createTweet({
          text: scene.content,
          hashtags: scene.hashtags,
          media: sceneMedia,
          scheduledTime: this.calculateScheduledTime(i)
        });
        
        posts.push(post);
        
        // Add delay between posts to avoid rate limiting
        if (i < scenes.length - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        console.error(`Failed to post scene ${i + 1}:`, error);
      }
    }
    
    return posts;
  }

  /**
   * Get media for a specific scene
   */
  private getMediaForScene(media: any, sceneIndex: number): any[] {
    const sceneMedia = [];
    
    if (media.images && media.images[sceneIndex]) {
      sceneMedia.push(media.images[sceneIndex]);
    }
    
    if (media.videos && media.videos[sceneIndex]) {
      sceneMedia.push(media.videos[sceneIndex]);
    }
    
    return sceneMedia;
  }

  /**
   * Calculate scheduled time for posts
   */
  private calculateScheduledTime(sceneIndex: number): Date | null {
    // Schedule posts with 2-hour intervals
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + (sceneIndex * 2));
    return scheduledTime;
  }

  /**
   * Generate analytics for the pipeline
   */
  private async generateAnalytics(scenes: any[], posts: any[]): Promise<any> {
    const analytics = {
      totalScenes: scenes.length,
      totalPosts: posts.length,
      engagement: {
        estimated: this.calculateEstimatedEngagement(scenes),
        actual: posts.reduce((sum, post) => sum + (post.engagement || 0), 0)
      },
      hashtags: this.extractAllHashtags(scenes),
      contentTypes: this.analyzeContentTypes(scenes),
      postingSchedule: this.generatePostingSchedule(scenes.length)
    };

    return analytics;
  }

  /**
   * Calculate estimated engagement
   */
  private calculateEstimatedEngagement(scenes: any[]): number {
    return scenes.reduce((total, scene) => {
      let score = 0;
      
      // Base score for content length
      if (scene.content.length > 100) score += 0.2;
      if (scene.content.length > 200) score += 0.3;
      
      // Hashtag bonus
      score += (scene.hashtags?.length || 0) * 0.1;
      
      // Call-to-action bonus
      if (scene.callToAction) score += 0.2;
      
      // Question bonus
      if (scene.content.includes('?')) score += 0.1;
      
      return total + score;
    }, 0);
  }

  /**
   * Extract all hashtags from scenes
   */
  private extractAllHashtags(scenes: any[]): string[] {
    const hashtags = new Set<string>();
    
    scenes.forEach(scene => {
      scene.hashtags?.forEach((tag: string) => {
        hashtags.add(tag);
      });
    });
    
    return Array.from(hashtags);
  }

  /**
   * Analyze content types
   */
  private analyzeContentTypes(scenes: any[]): any {
    const types = {
      questions: 0,
      statements: 0,
      callsToAction: 0,
      stories: 0
    };
    
    scenes.forEach(scene => {
      if (scene.content.includes('?')) types.questions++;
      if (scene.callToAction) types.callsToAction++;
      if (scene.contentType === 'story') types.stories++;
      else types.statements++;
    });
    
    return types;
  }

  /**
   * Generate posting schedule
   */
  private generatePostingSchedule(sceneCount: number): any[] {
    const schedule = [];
    const now = new Date();
    
    for (let i = 0; i < sceneCount; i++) {
      const postTime = new Date(now);
      postTime.setHours(postTime.getHours() + (i * 2));
      
      schedule.push({
        sceneIndex: i,
        scheduledTime: postTime,
        status: 'pending'
      });
    }
    
    return schedule;
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
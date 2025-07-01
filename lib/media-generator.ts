/**
 * Media Generator Module for Twitter Agent
 * 
 * Enhanced media generation capabilities integrated from ContentCreator-0.1
 * Generates images and videos for Twitter content
 */

import OpenAI from 'openai';
import { Scene } from './scene-parser';
import { logger } from '../logger';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export interface MediaGenerationOptions {
  quality?: 'standard' | 'hd';
  aspectRatio?: '1:1' | '16:9' | '4:3';
  style?: 'cinematic' | 'modern' | 'vintage' | 'minimalist';
  brandColors?: string[];
  watermark?: boolean;
  maxRetries?: number;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  localPath?: string;
  metadata: {
    sceneId: number;
    prompt: string;
    generationTime: number;
    cost: number;
    dimensions: { width: number; height: number };
  };
}

export class MediaGenerator {
  private openai: OpenAI;
  private assetsDir: string;
  private falApiKey?: string;

  constructor(openaiApiKey: string, falApiKey?: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.falApiKey = falApiKey;
    this.assetsDir = path.join(process.cwd(), 'assets');
    this.ensureAssetsDirectory();
  }

  /**
   * Generate image for a scene
   */
  async generateSceneImage(
    scene: Scene,
    options: MediaGenerationOptions = {}
  ): Promise<GeneratedMedia | null> {
    const {
      quality = 'standard',
      aspectRatio = '16:9',
      style = 'cinematic',
      maxRetries = 2
    } = options;

    try {
      const prompt = this.buildImagePrompt(scene, options);
      const imagePath = path.join(this.assetsDir, `scene_${scene.id}.png`);

      // Check if image already exists
      if (fs.existsSync(imagePath)) {
        logger.info(`Image already exists for scene ${scene.id}`);
        return {
          id: `img_${scene.id}`,
          type: 'image',
          url: `file://${imagePath}`,
          localPath: imagePath,
          metadata: {
            sceneId: scene.id,
            prompt,
            generationTime: 0,
            cost: 0,
            dimensions: this.getDimensions(aspectRatio)
          }
        };
      }

      const startTime = Date.now();

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          logger.info(`Generating image for scene ${scene.id} (attempt ${attempt + 1})`);

          const response = await this.openai.images.generate({
            model: 'dall-e-3',
            prompt,
            size: this.getImageSize(aspectRatio),
            quality,
            n: 1
          });

          const imageUrl = response.data[0].url;
          if (!imageUrl) {
            throw new Error('No image URL in response');
          }

          // Download and save image
          await this.downloadImage(imageUrl, imagePath);

          const generationTime = Date.now() - startTime;
          const cost = this.estimateImageCost(quality);

          logger.info(`Successfully generated image for scene ${scene.id}`);

          return {
            id: `img_${scene.id}`,
            type: 'image',
            url: imageUrl,
            localPath: imagePath,
            metadata: {
              sceneId: scene.id,
              prompt,
              generationTime,
              cost,
              dimensions: this.getDimensions(aspectRatio)
            }
          };

        } catch (error) {
          logger.error(`Image generation attempt ${attempt + 1} failed:`, error);
          if (attempt === maxRetries) {
            throw error;
          }
          // Wait before retry
          await this.delay(2000);
        }
      }

      return null;

    } catch (error) {
      logger.error(`Failed to generate image for scene ${scene.id}:`, error);
      return null;
    }
  }

  /**
   * Generate video for a scene
   */
  async generateSceneVideo(
    scene: Scene,
    imagePath?: string,
    options: MediaGenerationOptions = {}
  ): Promise<GeneratedMedia | null> {
    const {
      quality = 'standard',
      aspectRatio = '16:9',
      style = 'cinematic',
      maxRetries = 2
    } = options;

    if (!this.falApiKey) {
      logger.warn('FAL API key not provided, skipping video generation');
      return null;
    }

    try {
      const prompt = this.buildVideoPrompt(scene, options);
      const videoPath = path.join(this.assetsDir, `scene_${scene.id}.mp4`);

      // Check if video already exists
      if (fs.existsSync(videoPath)) {
        logger.info(`Video already exists for scene ${scene.id}`);
        return {
          id: `vid_${scene.id}`,
          type: 'video',
          url: `file://${videoPath}`,
          localPath: videoPath,
          metadata: {
            sceneId: scene.id,
            prompt,
            generationTime: 0,
            cost: 0,
            dimensions: this.getDimensions(aspectRatio)
          }
        };
      }

      const startTime = Date.now();

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          logger.info(`Generating video for scene ${scene.id} (attempt ${attempt + 1})`);

          const response = await this.callFalApi(prompt, imagePath);
          
          if (response?.video_url) {
            // Download and save video
            await this.downloadVideo(response.video_url, videoPath);

            const generationTime = Date.now() - startTime;
            const cost = this.estimateVideoCost(response.duration || 10);

            logger.info(`Successfully generated video for scene ${scene.id}`);

            return {
              id: `vid_${scene.id}`,
              type: 'video',
              url: response.video_url,
              localPath: videoPath,
              metadata: {
                sceneId: scene.id,
                prompt,
                generationTime,
                cost,
                dimensions: this.getDimensions(aspectRatio)
              }
            };
          }

        } catch (error) {
          logger.error(`Video generation attempt ${attempt + 1} failed:`, error);
          if (attempt === maxRetries) {
            throw error;
          }
          // Wait before retry
          await this.delay(3000);
        }
      }

      return null;

    } catch (error) {
      logger.error(`Failed to generate video for scene ${scene.id}:`, error);
      return null;
    }
  }

  /**
   * Generate media for multiple scenes
   */
  async generateBatchMedia(
    scenes: Scene[],
    mediaType: 'image' | 'video' | 'both' = 'image',
    options: MediaGenerationOptions = {}
  ): Promise<GeneratedMedia[]> {
    const results: GeneratedMedia[] = [];

    for (const scene of scenes) {
      try {
        if (mediaType === 'image' || mediaType === 'both') {
          const image = await this.generateSceneImage(scene, options);
          if (image) results.push(image);
        }

        if (mediaType === 'video' || mediaType === 'both') {
          const video = await this.generateSceneVideo(scene, undefined, options);
          if (video) results.push(video);
        }

        // Add delay between generations to respect rate limits
        await this.delay(1000);

      } catch (error) {
        logger.error(`Failed to generate media for scene ${scene.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(scene: Scene, options: MediaGenerationOptions): string {
    const { style = 'cinematic', brandColors = [] } = options;

    const promptParts = [
      `A ${style} scene titled "${scene.title}"`,
      `Setting: ${scene.setting}`,
    ];

    if (scene.characters.length > 0) {
      promptParts.push(`Characters: ${scene.characters.join(', ')}`);
    }

    promptParts.push(`Action: ${scene.summary}`);
    promptParts.push(`Tone: ${scene.tone}`);

    // Add style-specific elements
    const styleElements = {
      cinematic: 'dramatic lighting, professional cinematography, high contrast',
      modern: 'clean lines, contemporary design, minimalist composition',
      vintage: 'retro aesthetic, film grain, nostalgic colors',
      minimalist: 'simple composition, limited colors, clean design'
    };

    promptParts.push(`Style: ${styleElements[style] || styleElements.cinematic}`);

    if (brandColors.length > 0) {
      promptParts.push(`Color palette: ${brandColors.join(', ')}`);
    }

    promptParts.push('High quality, detailed, professional photography');

    return promptParts.join('. ') + '.';
  }

  /**
   * Build video generation prompt
   */
  private buildVideoPrompt(scene: Scene, options: MediaGenerationOptions): string {
    const { style = 'cinematic' } = options;

    const promptParts = [
      `Scene: ${scene.title}`,
      `Setting: ${scene.setting}`,
      `Action: ${scene.summary}`,
      `Tone: ${scene.tone}`,
      'Style: Cinematic, smooth camera movements, professional lighting',
      'Duration: 8-12 seconds',
      'Quality: 1080p resolution, 24fps'
    ];

    if (scene.characters.length > 0) {
      promptParts.push(`Characters: ${scene.characters.join(', ')}`);
    }

    return promptParts.join('. ') + '.';
  }

  /**
   * Call FAL API for video generation
   */
  private async callFalApi(prompt: string, imagePath?: string): Promise<any> {
    if (!this.falApiKey) {
      throw new Error('FAL API key not provided');
    }

    const payload = {
      prompt,
      image_url: imagePath ? `file://${imagePath}` : undefined,
      duration: 10,
      resolution: '1080p'
    };

    const response = await axios.post(
      'https://fal.run/fal-ai/veo-3',
      payload,
      {
        headers: {
          'Authorization': `Key ${this.falApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string, filePath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);
  }

  /**
   * Download video from URL
   */
  private async downloadVideo(url: string, filePath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);
  }

  /**
   * Get image size for aspect ratio
   */
  private getImageSize(aspectRatio: string): string {
    const sizes = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '4:3': '1408x1024'
    };
    return sizes[aspectRatio] || sizes['16:9'];
  }

  /**
   * Get dimensions for aspect ratio
   */
  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const dimensions = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1792, height: 1024 },
      '4:3': { width: 1408, height: 1024 }
    };
    return dimensions[aspectRatio] || dimensions['16:9'];
  }

  /**
   * Estimate image generation cost
   */
  private estimateImageCost(quality: string): number {
    const costs = {
      standard: 0.04,
      hd: 0.08
    };
    return costs[quality] || costs.standard;
  }

  /**
   * Estimate video generation cost
   */
  private estimateVideoCost(durationSeconds: number): number {
    return durationSeconds * 0.05; // Approximate cost per second
  }

  /**
   * Ensure assets directory exists
   */
  private ensureAssetsDirectory(): void {
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get generation statistics
   */
  getStats(): { totalImages: number; totalVideos: number; totalCost: number } {
    const files = fs.readdirSync(this.assetsDir);
    const images = files.filter(f => f.endsWith('.png')).length;
    const videos = files.filter(f => f.endsWith('.mp4')).length;
    
    return {
      totalImages: images,
      totalVideos: videos,
      totalCost: (images * 0.04) + (videos * 0.5) // Rough estimate
    };
  }
} 
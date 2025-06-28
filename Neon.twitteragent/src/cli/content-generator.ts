#!/usr/bin/env node

/**
 * Content Generator CLI for Twitter Agent
 * 
 * Enhanced CLI interface integrating ContentCreator-0.1 capabilities
 * Provides commands for content parsing, media generation, and Twitter posting
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { SceneParser } from '../pipeline/scene-parser';
import { MediaGenerator } from '../pipeline/media-generator';
import { TwitterAgent } from '../agents/TwitterAgent';
import { logger } from '../logger';

const program = new Command();

program
  .name('neon-content-generator')
  .description('Enhanced content generation and Twitter automation tool')
  .version('2.1.0');

// Parse content command
program
  .command('parse')
  .description('Parse content into structured scenes')
  .argument('<file>', 'Path to content file')
  .option('-o, --output <file>', 'Output file for parsed scenes')
  .option('-m, --max-scenes <number>', 'Maximum number of scenes', '10')
  .option('-p, --platform <platform>', 'Target platform', 'twitter')
  .option('-t, --type <type>', 'Content type', 'story')
  .option('-v, --voice <voice>', 'Brand voice', 'professional')
  .action(async (file, options) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const parser = new SceneParser(process.env.OPENAI_API_KEY!);
      
      const result = await parser.parseScenes(content, {
        maxScenes: parseInt(options.maxScenes),
        targetPlatform: options.platform as any,
        contentType: options.type as any,
        brandVoice: options.voice
      });

      if (result.success) {
        const output = options.output || 'scenes.json';
        fs.writeFileSync(output, JSON.stringify(result, null, 2));
        logger.info(`Parsed ${result.scenes.length} scenes, saved to ${output}`);
        
        if (result.metadata) {
          console.log('\n📊 Content Analysis:');
          console.log(`Total Scenes: ${result.metadata.totalScenes}`);
          console.log(`Estimated Tweets: ${result.metadata.estimatedTweets}`);
          console.log(`Content Themes: ${result.metadata.contentThemes.join(', ')}`);
          console.log('\n⏰ Timing Recommendations:');
          result.metadata.recommendedTiming.forEach(rec => console.log(`• ${rec}`));
        }
      } else {
        logger.error('Failed to parse content:', result.errorMessage);
        process.exit(1);
      }
    } catch (error) {
      logger.error('Error parsing content:', error);
      process.exit(1);
    }
  });

// Generate media command
program
  .command('generate-media')
  .description('Generate images and videos for scenes')
  .argument('<scenes-file>', 'Path to scenes JSON file')
  .option('-t, --type <type>', 'Media type: image, video, or both', 'image')
  .option('-q, --quality <quality>', 'Media quality: standard or hd', 'standard')
  .option('-a, --aspect <ratio>', 'Aspect ratio: 1:1, 16:9, or 4:3', '16:9')
  .option('-s, --style <style>', 'Visual style', 'cinematic')
  .option('--fal-key <key>', 'FAL API key for video generation')
  .action(async (scenesFile, options) => {
    try {
      const scenesData = JSON.parse(fs.readFileSync(scenesFile, 'utf-8'));
      const scenes = scenesData.scenes || scenesData;
      
      const mediaGenerator = new MediaGenerator(
        process.env.OPENAI_API_KEY!,
        options.falKey || process.env.FAL_KEY
      );

      const results = await mediaGenerator.generateBatchMedia(
        scenes,
        options.type as any,
        {
          quality: options.quality as any,
          aspectRatio: options.aspect as any,
          style: options.style as any
        }
      );

      logger.info(`Generated ${results.length} media files`);
      
      const stats = mediaGenerator.getStats();
      console.log('\n📈 Generation Statistics:');
      console.log(`Total Images: ${stats.totalImages}`);
      console.log(`Total Videos: ${stats.totalVideos}`);
      console.log(`Estimated Cost: $${stats.totalCost.toFixed(2)}`);

    } catch (error) {
      logger.error('Error generating media:', error);
      process.exit(1);
    }
  });

// Post to Twitter command
program
  .command('post')
  .description('Post content to Twitter')
  .argument('<scenes-file>', 'Path to scenes JSON file')
  .option('-d, --dry-run', 'Preview tweets without posting')
  .option('-s, --schedule', 'Schedule tweets instead of posting immediately')
  .option('-i, --interval <minutes>', 'Interval between tweets in minutes', '30')
  .option('--campaign <name>', 'Campaign name for tracking')
  .action(async (scenesFile, options) => {
    try {
      const scenesData = JSON.parse(fs.readFileSync(scenesFile, 'utf-8'));
      const scenes = scenesData.scenes || scenesData;
      
      const agent = new TwitterAgent('content-generator', 'Content Generator Agent');
      
      if (options.dryRun) {
        console.log('\n🐦 Tweet Preview:');
        for (const scene of scenes) {
          const tweet = await agent.generateTweet(scene);
          console.log(`\nScene ${scene.id}: ${scene.title}`);
          console.log(`Tweet: ${tweet.text}`);
          console.log(`Hashtags: ${tweet.hashtags?.join(' ') || 'None'}`);
          console.log('---');
        }
      } else {
        for (const scene of scenes) {
          const tweet = await agent.generateTweet(scene);
          
          if (options.schedule) {
            // Schedule tweet
            const delay = parseInt(options.interval) * 60 * 1000;
            setTimeout(async () => {
              await agent.postTweet(tweet);
            }, delay);
            logger.info(`Scheduled tweet for scene ${scene.id}`);
          } else {
            // Post immediately
            await agent.postTweet(tweet);
            logger.info(`Posted tweet for scene ${scene.id}`);
          }
          
          // Add delay between posts
          if (!options.schedule) {
            await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
          }
        }
      }
    } catch (error) {
      logger.error('Error posting to Twitter:', error);
      process.exit(1);
    }
  });

// Full pipeline command
program
  .command('pipeline')
  .description('Run complete content generation pipeline')
  .argument('<content-file>', 'Path to content file')
  .option('-o, --output-dir <dir>', 'Output directory', './output')
  .option('-m, --media-type <type>', 'Media type: image, video, or both', 'image')
  .option('-p, --post', 'Post to Twitter after generation')
  .option('-s, --schedule', 'Schedule Twitter posts')
  .option('--dry-run', 'Preview without posting')
  .action(async (contentFile, options) => {
    try {
      console.log('🚀 Starting content generation pipeline...\n');
      
      // Step 1: Parse content
      console.log('📝 Step 1: Parsing content...');
      const content = fs.readFileSync(contentFile, 'utf-8');
      const parser = new SceneParser(process.env.OPENAI_API_KEY!);
      
      const parseResult = await parser.parseScenes(content);
      if (!parseResult.success) {
        throw new Error(`Failed to parse content: ${parseResult.errorMessage}`);
      }
      
      const scenesFile = path.join(options.outputDir, 'scenes.json');
      fs.mkdirSync(options.outputDir, { recursive: true });
      fs.writeFileSync(scenesFile, JSON.stringify(parseResult, null, 2));
      console.log(`✅ Parsed ${parseResult.scenes.length} scenes\n`);
      
      // Step 2: Generate media
      console.log('🎨 Step 2: Generating media...');
      const mediaGenerator = new MediaGenerator(
        process.env.OPENAI_API_KEY!,
        process.env.FAL_KEY
      );
      
      const mediaResults = await mediaGenerator.generateBatchMedia(
        parseResult.scenes,
        options.mediaType as any
      );
      console.log(`✅ Generated ${mediaResults.length} media files\n`);
      
      // Step 3: Post to Twitter (if requested)
      if (options.post) {
        console.log('🐦 Step 3: Posting to Twitter...');
        const agent = new TwitterAgent('pipeline-agent', 'Pipeline Agent');
        
        for (const scene of parseResult.scenes) {
          const tweet = await agent.generateTweet(scene);
          
          if (options.dryRun) {
            console.log(`Preview: ${tweet.text}`);
          } else if (options.schedule) {
            // Schedule tweet
            const delay = 30 * 60 * 1000; // 30 minutes
            setTimeout(async () => {
              await agent.postTweet(tweet);
            }, delay);
            console.log(`Scheduled tweet for scene ${scene.id}`);
          } else {
            // Post immediately
            await agent.postTweet(tweet);
            console.log(`Posted tweet for scene ${scene.id}`);
            await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
          }
        }
        console.log('✅ Twitter posting completed\n');
      }
      
      console.log('🎉 Pipeline completed successfully!');
      console.log(`📁 Output directory: ${options.outputDir}`);
      
    } catch (error) {
      logger.error('Pipeline failed:', error);
      process.exit(1);
    }
  });

// Analyze content command
program
  .command('analyze')
  .description('Analyze content and provide insights')
  .argument('<file>', 'Path to content file')
  .option('-d, --detailed', 'Show detailed analysis')
  .action(async (file, options) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const parser = new SceneParser(process.env.OPENAI_API_KEY!);
      
      const result = await parser.parseScenes(content, { maxScenes: 20 });
      
      if (result.success && result.metadata) {
        console.log('\n📊 Content Analysis Report');
        console.log('='.repeat(50));
        
        console.log(`\n📈 Overview:`);
        console.log(`• Total Scenes: ${result.metadata.totalScenes}`);
        console.log(`• Estimated Tweets: ${result.metadata.estimatedTweets}`);
        console.log(`• Content Themes: ${result.metadata.contentThemes.join(', ')}`);
        
        if (options.detailed) {
          console.log(`\n📝 Scene Breakdown:`);
          result.scenes.forEach((scene, index) => {
            console.log(`\n${index + 1}. ${scene.title}`);
            console.log(`   Tone: ${scene.tone}`);
            console.log(`   Characters: ${scene.characters.join(', ') || 'None'}`);
            console.log(`   Hashtags: ${scene.hashtags.join(' ') || 'None'}`);
            console.log(`   Summary: ${scene.summary}`);
          });
        }
        
        console.log(`\n⏰ Timing Recommendations:`);
        result.metadata.recommendedTiming.forEach(rec => console.log(`• ${rec}`));
        
        console.log(`\n💡 Engagement Tips:`);
        console.log(`• Use the suggested hashtags for better discoverability`);
        console.log(`• Post during recommended time windows for maximum engagement`);
        console.log(`• Consider creating a thread for longer content`);
        console.log(`• Include media (images/videos) to increase engagement`);
      } else {
        logger.error('Failed to analyze content:', result.errorMessage);
        process.exit(1);
      }
    } catch (error) {
      logger.error('Error analyzing content:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 
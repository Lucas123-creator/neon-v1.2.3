# TwitterAgent v2.1.0 - Enhanced Autonomous System

> **The most advanced autonomous Twitter management system with AI content generation, media creation, A/B testing, and contingency control.**

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/Lucas123-creator/Neon.twitteragent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 🚀 Features

### Core Capabilities

* **🤖 Autonomous Twitter Management** - AI-powered tweet generation and posting
* **📝 Content Scene Parsing** - Intelligent content breakdown into tweetable scenes
* **🎨 AI Media Generation** - DALL-E 3 images and Veo 3 videos for scenes
* **🧪 A/B Testing System** - Multi-variant testing with engagement scoring
* **👑 Influencer Detection** - Real-time identification of high-priority mentions
* **🛡️ Contingency Control** - Emergency pause/resume and safety systems
* **📡 Real-time Stream Listening** - Live mention tracking and response
* **🔐 OAuth 2.0 Authentication** - Secure token management and refresh
* **🛡️ Brand Safety** - Content moderation and filtering
* **📊 Metrics Sync** - Performance tracking and vector learning
* **🎭 Persona Management** - Brand voice and context awareness

### Enhanced Content Creation (v2.1.0)

* **📖 Scene Parser** - Parse long-form content into engaging tweetable scenes
* **🖼️ Image Generation** - Create custom images for each scene using DALL-E 3
* **🎬 Video Generation** - Generate short videos using Veo 3 AI
* **📊 Content Analysis** - Get insights and recommendations for content strategy
* **⏰ Smart Scheduling** - Optimize posting times based on content analysis
* **🎯 Engagement Optimization** - AI-powered hashtags and call-to-actions
* **🔄 Full Pipeline** - End-to-end content creation and posting workflow

### Advanced Systems

* **Vector Learning** - Embedding-based content optimization
* **Scheduling Engine** - Intelligent tweet timing and automation
* **Context Awareness** - Campaign-specific persona management
* **Performance Analytics** - Engagement scoring and insights
* **Safety Auditing** - Comprehensive content safety checks

## 📦 Installation

```bash
npm install @neon/twitter-agent-v2
```

### Prerequisites

* Node.js >= 18.0.0
* Twitter API v2 credentials
* OpenAI API key (for AI features)
* FAL API key (for video generation - optional)

## 🔧 Quick Start

### 1. Basic Usage

```typescript
import { TwitterAgent } from '@neon/twitter-agent-v2';

// Initialize agent
const agent = new TwitterAgent('my-agent', 'My Twitter Agent');

// Generate and post tweet
const tweet = await agent.generateTweet('campaign-123');
const response = await agent.postTweet(tweet);

console.log(`Posted tweet: ${response.tweetId}`);
```

### 2. Content Scene Parsing

```typescript
import { SceneParser } from '@neon/twitter-agent-v2';

const parser = new SceneParser(process.env.OPENAI_API_KEY);

// Parse long-form content into scenes
const result = await parser.parseScenes(content, {
  maxScenes: 10,
  targetPlatform: 'twitter',
  contentType: 'story',
  brandVoice: 'professional'
});

console.log(`Parsed ${result.scenes.length} scenes`);
console.log(`Estimated tweets: ${result.metadata?.estimatedTweets}`);
```

### 3. Media Generation

```typescript
import { MediaGenerator } from '@neon/twitter-agent-v2';

const mediaGenerator = new MediaGenerator(
  process.env.OPENAI_API_KEY,
  process.env.FAL_KEY
);

// Generate images for scenes
const images = await mediaGenerator.generateBatchMedia(scenes, 'image', {
  quality: 'standard',
  aspectRatio: '16:9',
  style: 'cinematic'
});

console.log(`Generated ${images.length} images`);
```

### 4. Full Content Pipeline

```typescript
import { ContentPipeline } from '@neon/twitter-agent-v2';

const pipeline = new ContentPipeline({
  openaiKey: process.env.OPENAI_API_KEY,
  falKey: process.env.FAL_KEY,
  twitterAgent: agent
});

// Run complete pipeline: parse → generate media → post
await pipeline.run(content, {
  mediaType: 'both',
  postToTwitter: true,
  schedule: true
});
```

### 5. CLI Usage

```bash
# Parse content into scenes
npx neon-content-generator parse content.txt -o scenes.json

# Generate media for scenes
npx neon-content-generator generate-media scenes.json -t image

# Post to Twitter
npx neon-content-generator post scenes.json --dry-run

# Run full pipeline
npx neon-content-generator pipeline content.txt -m both -p

# Analyze content
npx neon-content-generator analyze content.txt --detailed
```

## 🏗️ Architecture

```
twitter-agent-v2/
├── src/
│   ├── agents/           # Core agent implementations
│   │   ├── TwitterAgent.ts      # Main Twitter agent
│   │   ├── twitterABTest.ts     # A/B testing system
│   │   └── contextManager.ts    # Persona & context management
│   ├── pipeline/         # Content creation pipeline
│   │   ├── scene-parser.ts      # Content scene parsing
│   │   ├── media-generator.ts   # Image/video generation
│   │   └── content-pipeline.ts  # Full pipeline orchestration
│   ├── cli/              # Command-line interface
│   │   └── content-generator.ts # CLI tools
│   ├── utils/            # Utility systems
│   │   ├── agentControl.ts      # Contingency control
│   │   ├── filters.ts           # Brand safety & moderation
│   │   └── mediaGenerator.ts    # Visual content generation
│   ├── core/             # Core systems
│   │   ├── metricsSync.ts       # Performance tracking
│   │   └── scheduler.ts         # Task scheduling
│   ├── listeners/        # Real-time systems
│   │   └── streamListener.ts    # Twitter stream listening
│   ├── auth/             # Authentication
│   │   └── twitterOAuth.ts      # OAuth 2.0 implementation
│   ├── base-agent.ts     # Base agent framework
│   ├── types.ts          # TypeScript interfaces
│   ├── logger.ts         # Logging system
│   └── index.ts          # Main exports
```

## 🔌 Configuration

### Environment Variables

```bash
# Twitter API v2
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key

# FAL (for video generation)
FAL_KEY=your_fal_key

# Brand configuration
TWITTER_BRAND_HANDLE=@YourBrand
```

### Agent Configuration

```typescript
import { TwitterAgent } from '@neon/twitter-agent-v2';

const config = {
  maxTweetLength: 280,
  enableAutoResponses: true,
  enableTrendScanning: true,
  enableContentOptimization: true,
  rateLimitDelay: 1000,
  mediaGeneration: {
    enableImages: true,
    enableVideos: true,
    quality: 'standard',
    aspectRatio: '16:9'
  }
};

const agent = new TwitterAgent('my-agent', 'My Agent', config);
```

## 📊 Content Analysis

### Scene Parsing Features

- **Intelligent Content Breakdown** - Parse long articles into tweetable scenes
- **Platform Optimization** - Tailored for Twitter, LinkedIn, or Instagram
- **Brand Voice Adaptation** - Maintain consistent brand personality
- **Engagement Strategy** - AI-powered hashtags and call-to-actions
- **Timing Recommendations** - Optimal posting schedule suggestions

### Media Generation Features

- **DALL-E 3 Integration** - High-quality image generation
- **Veo 3 Video Creation** - Short-form video content
- **Style Customization** - Cinematic, modern, vintage, minimalist
- **Brand Color Integration** - Consistent visual identity
- **Cost Tracking** - Monitor generation expenses

## 🛡️ Safety & Control

### Contingency Control

```typescript
import { 
  agentControl, 
  emergencyStopAll 
} from '@neon/twitter-agent-v2';

// Emergency stop all agents
await emergencyStopAll('System maintenance');

// Get agent status
const status = await agentControl.getAgentStatusSummary();
console.log(status);
```

### Brand Safety

```typescript
import { brandSafetyFilter } from '@neon/twitter-agent-v2';

const result = await brandSafetyFilter.checkBrandSafety(
  'Your tweet content here',
  'campaign-123'
);

if (!result.isSafe) {
  console.log(`Blocked: ${result.auditLog.reason}`);
}
```

## 📈 Performance & Analytics

### Metrics Tracking

```typescript
import { metricsSync } from '@neon/twitter-agent-v2';

// Get performance data
const performance = await metricsSync.fetchTweetPerformance('campaign-123', 30);

// Get optimization insights
const insights = await metricsSync.getOptimizationInsights('campaign-123', 'tweet text');
```

### Content Analytics

```typescript
import { ContentAnalyzer } from '@neon/twitter-agent-v2';

const analyzer = new ContentAnalyzer();
const analysis = await analyzer.analyzeContent(content, {
  detailed: true,
  includeRecommendations: true
});

console.log('Content themes:', analysis.themes);
console.log('Engagement potential:', analysis.engagementScore);
console.log('Timing recommendations:', analysis.timingRecommendations);
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="Content Generation"
```

## 📝 API Reference

### Core Classes

* **TwitterAgent** - Main Twitter automation agent
* **SceneParser** - Content scene parsing and analysis
* **MediaGenerator** - AI-powered image and video generation
* **ContentPipeline** - End-to-end content creation workflow
* **TwitterABTest** - A/B testing system
* **AgentControl** - Contingency control system
* **MetricsSync** - Performance tracking and analytics
* **TwitterOAuth** - OAuth 2.0 authentication

### Key Methods

#### Content Generation

* `parseScenes(content, options)` - Parse content into scenes
* `generateSceneImage(scene, options)` - Generate image for scene
* `generateSceneVideo(scene, options)` - Generate video for scene
* `runPipeline(content, options)` - Complete content pipeline

#### Twitter Management

* `generateTweet(campaignId)` - Generate AI-powered tweet
* `postTweet(content)` - Post tweet to Twitter
* `respondToMention(id, context)` - Respond to mention
* `scanTrends()` - Analyze trending topics
* `optimizeContent(previousResults)` - Optimize based on performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

* **Documentation**: [GitHub Wiki](https://github.com/Lucas123-creator/Neon.twitteragent/wiki)
* **Issues**: [GitHub Issues](https://github.com/Lucas123-creator/Neon.twitteragent/issues)
* **Discussions**: [GitHub Discussions](https://github.com/Lucas123-creator/Neon.twitteragent/discussions)

## 🔄 Changelog

### v2.1.0

* ✨ **NEW**: Content Scene Parsing System
* ✨ **NEW**: AI Media Generation (DALL-E 3 + Veo 3)
* ✨ **NEW**: Full Content Pipeline
* ✨ **NEW**: CLI Interface for Content Generation
* ✨ **NEW**: Content Analysis and Insights
* ✨ **NEW**: Smart Scheduling Recommendations
* ✨ **NEW**: Brand Color Integration
* ✨ **NEW**: Cost Tracking for Media Generation
* 🛡️ **ENHANCED**: Brand Safety with Media Content
* 📊 **ENHANCED**: Content Performance Analytics
* 🔧 **IMPROVED**: Type Safety and Error Handling
* 🚀 **IMPROVED**: Performance and Caching

### v2.0.0

* ✨ **NEW**: A/B Testing System
* ✨ **NEW**: Influencer Detection
* ✨ **NEW**: Contingency Control
* ✨ **NEW**: Real-time Stream Listening
* ✨ **NEW**: OAuth 2.0 Authentication
* ✨ **NEW**: Vector Learning
* ✨ **NEW**: Persona Management
* 🛡️ **ENHANCED**: Brand Safety
* 📊 **ENHANCED**: Metrics & Analytics
* 🔧 **IMPROVED**: Type Safety
* 🚀 **IMPROVED**: Performance

---

**Built with ❤️ by the NeonHub Team** 
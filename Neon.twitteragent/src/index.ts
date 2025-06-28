// ============================================================================
// TWITTER AGENT V2 - ENHANCED AUTONOMOUS SYSTEM
// ============================================================================
// 
// This package includes all the enhanced TwitterAgent systems:
// - Contingency Control & Safety
// - Influencer Detection & Prioritization  
// - A/B Testing & Performance Optimization
// - Real-time Stream Listening
// - OAuth & Token Management
// - Brand Safety & Moderation
// - Media Generation & Visual Content
// - Metrics Sync & Vector Learning
// - Persona & Context Management
// ============================================================================

// --- Core TwitterAgent ---
export { TwitterAgent } from './agents/TwitterAgent';
export type { 
  TweetContent, 
  TweetResponse, 
  TrendInsight, 
  ImprovedTweet, 
  TwitterMention,
  TwitterAgentConfig 
} from './agents/TwitterAgent';

// --- A/B Testing System ---
export { TwitterABTest, twitterABTest, runABTest } from './agents/twitterABTest';
export type { 
  ABTestVariant, 
  ABTestResult, 
  ABTestConfig 
} from './agents/twitterABTest';

// --- Context & Persona Management ---
export { contextManager } from './agents/contextManager';
export type { 
  CampaignContext, 
  PersonaProfile, 
  BrandVoiceGuidelines 
} from './agents/contextManager';

// --- Contingency Control System ---
export { 
  AgentControl, 
  agentControl, 
  isAgentPaused, 
  throwIfPaused, 
  pauseAgent, 
  resumeAgent 
} from './utils/agentControl';
export type { 
  AgentFlag, 
  AgentControlConfig 
} from './utils/agentControl';

// --- Brand Safety & Moderation ---
export { brandSafetyFilter } from './utils/filters';
export type { 
  BrandSafetyResult, 
  SafetyAuditLog 
} from './utils/filters';

// --- Media Generation ---
export { mediaGenerator } from './utils/mediaGenerator';
export type { 
  MediaGenerationRequest, 
  GeneratedMedia 
} from './utils/mediaGenerator';

// --- Metrics & Analytics ---
export { metricsSync } from './core/metricsSync';
export type { 
  TweetPerformanceRecord, 
  OptimizationInsights, 
  VectorizedTweet 
} from './core/metricsSync';

// --- Scheduling System ---
export { scheduler } from './core/scheduler';
export type { 
  ScheduledTask, 
  ScheduleConfig 
} from './core/scheduler';

// --- Real-time Stream Listening ---
export { 
  startTwitterStreamListener, 
  getInfluencerMentions, 
  markInfluencerProcessed 
} from './listeners/streamListener';
export type { 
  TwitterMention as StreamMention, 
  InfluencerMention 
} from './listeners/streamListener';

// --- OAuth & Authentication ---
export { 
  TwitterOAuth, 
  twitterOAuth, 
  refreshAccessToken, 
  getAuthenticatedClient 
} from './auth/twitterOAuth';
export type { 
  OAuthTokens, 
  TwitterClientConfig 
} from './auth/twitterOAuth';

// --- Base Agent Framework ---
export { AbstractAgent } from './base-agent';
export type { 
  AgentPayload, 
  AgentResult, 
  AgentCapability 
} from './base-agent';

// --- Types & Interfaces ---
export type { 
  PerformanceMetrics, 
  AnalyticsData, 
  MarketingInsight 
} from './types';

// --- Logger ---
export { logger } from './logger';

// ============================================================================
// QUICK START EXAMPLES
// ============================================================================

/**
 * Example 1: Basic TwitterAgent Usage
 * 
 * ```typescript
 * import { TwitterAgent } from '@neon/twitter-agent-v2';
 * 
 * const agent = new TwitterAgent('my-agent', 'My Twitter Agent');
 * const tweet = await agent.generateTweet('campaign-123');
 * const response = await agent.postTweet(tweet);
 * ```
 */

/**
 * Example 2: A/B Testing
 * 
 * ```typescript
 * import { runABTest } from '@neon/twitter-agent-v2';
 * 
 * const variants = [
 *   { text: 'Check out our new product!', hashtags: ['#innovation'] },
 *   { text: 'Discover what\'s new today', hashtags: ['#discovery'] }
 * ];
 * 
 * const winner = await runABTest(variants, 'campaign-123');
 * ```
 */

/**
 * Example 3: Influencer Detection
 * 
 * ```typescript
 * import { startTwitterStreamListener, getInfluencerMentions } from '@neon/twitter-agent-v2';
 * 
 * // Start listening for mentions
 * await startTwitterStreamListener();
 * 
 * // Get high-priority mentions
 * const influencers = await getInfluencerMentions();
 * ```
 */

/**
 * Example 4: Contingency Control
 * 
 * ```typescript
 * import { pauseAgent, resumeAgent, isAgentPaused } from '@neon/twitter-agent-v2';
 * 
 * // Pause agent for maintenance
 * await pauseAgent('TwitterAgent', 'Scheduled maintenance');
 * 
 * // Check status
 * const paused = await isAgentPaused('TwitterAgent');
 * 
 * // Resume when ready
 * await resumeAgent('TwitterAgent');
 * ```
 */

// ============================================================================
// VERSION INFO
// ============================================================================
export const VERSION = '2.0.0';
export const FEATURES = [
  'Autonomous Twitter Management',
  'A/B Testing & Performance Optimization',
  'Influencer Detection & Prioritization',
  'Contingency Control & Safety Systems',
  'Real-time Stream Listening',
  'Brand Safety & Content Moderation',
  'Media Generation & Visual Content',
  'OAuth 2.0 Authentication',
  'Metrics Sync & Vector Learning',
  'Persona & Context Management'
]; 
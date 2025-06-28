import { TwitterAgent } from '../agents/TwitterAgent';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
// import { getTwitterBearerToken } from '../auth/twitterOAuth'; // Placeholder for future OAuth
// import { TrendInsightStore } from '../core/trendInsightStore'; // Placeholder for future module

// --- Type Interfaces ---
export interface TwitterMention {
  tweetId: string;
  userHandle: string;
  text: string;
  context?: string;
  userId?: string;
  followerCount?: number;
  isVerified?: boolean;
  isHighPriority?: boolean;
}

export interface InfluencerMention {
  tweetId: string;
  userId: string;
  userHandle: string;
  followerCount: number;
  isVerified: boolean;
  mentionText: string;
  detectedAt: Date;
  processed: boolean;
}

// --- Config ---
const BRAND_HANDLE = process.env.TWITTER_BRAND_HANDLE || '@YourBrand';
// const STREAM_URL = 'https://api.twitter.com/2/tweets/search/stream';
const LOG_FILE = path.join(process.cwd(), 'logs', 'twitter-stream-listener.log');
const RECONNECT_DELAY_MS = 10000;
const INFLUENCER_THRESHOLD = 10000; // 10K followers threshold

// --- TwitterAgent Instance ---
const twitterAgent = new TwitterAgent('twitter-listener', 'Twitter Listener');

// --- Event Emitter for internal events ---
export const streamEvents = new EventEmitter();

// --- Mock Influencer Store (Replace with DB when schema is updated) ---
const influencerMentionsStore: Map<string, InfluencerMention> = new Map();

// --- Logging Utility ---
function logEvent(event: any) {
  const logLine = `[${new Date().toISOString()}] ${JSON.stringify(event)}\n`;
  // Log to console
  // eslint-disable-next-line no-console
  console.log(logLine.trim());
  // Log to file
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, logLine);
  // TODO: Integrate with AgentLogService
}

// --- Twitter API Stream Connection ---
async function connectToTwitterStream() {
  let bearerToken = process.env.TWITTER_BEARER_TOKEN;
  // TODO: Use getTwitterBearerToken() from future auth/twitterOAuth.ts
  if (!bearerToken) {
    throw new Error('Twitter Bearer Token not set in environment variables.');
  }

  const trackedHashtags = await getTrackedHashtags();
  const rules = buildStreamRules(BRAND_HANDLE, trackedHashtags);

  // Set up stream rules (not implemented here, but would use Twitter API)
  // await setStreamRules(rules, bearerToken);

  while (true) {
    try {
      await listenToStream(bearerToken, rules);
    } catch (err) {
      logEvent({ level: 'error', message: 'Stream error, reconnecting...', error: err });
      await new Promise(res => setTimeout(res, RECONNECT_DELAY_MS));
    }
  }
}

// --- Build Stream Rules ---
function buildStreamRules(brandHandle: string, hashtags: string[]): string[] {
  const rules = [
    `@${brandHandle.replace(/^@/, '')}`,
    ...hashtags.map(tag => `#${tag.replace(/^#/, '')}`),
  ];
  return rules;
}

// --- Get Tracked Hashtags from Campaigns (stub) ---
async function getTrackedHashtags(): Promise<string[]> {
  // TODO: Query DB for Campaign.trackedHashtags where Twitter is enabled
  return ['AI', 'Marketing', 'YourBrand'];
}

// --- Check User Influence Level ---
async function checkUserInfluence(userId: string, bearerToken: string): Promise<{
  followerCount: number;
  isVerified: boolean;
  isHighPriority: boolean;
}> {
  try {
    // TODO: Replace with actual Twitter API v2 call
    // const response = await fetch(`https://api.twitter.com/2/users/${userId}?user.fields=public_metrics,verified`, {
    //   headers: { Authorization: `Bearer ${bearerToken}` }
    // });
    // const userData = await response.json();
    
    // Mock response for development
    const mockFollowerCount = Math.floor(Math.random() * 100000) + 100;
    const mockIsVerified = Math.random() > 0.8; // 20% chance of being verified
    
    const isHighPriority = mockFollowerCount > INFLUENCER_THRESHOLD || mockIsVerified;
    
    logEvent({
      level: 'info',
      message: 'User influence check',
      userId,
      followerCount: mockFollowerCount,
      isVerified: mockIsVerified,
      isHighPriority
    });
    
    return {
      followerCount: mockFollowerCount,
      isVerified: mockIsVerified,
      isHighPriority
    };
    
  } catch (error) {
    logEvent({
      level: 'error',
      message: 'Failed to check user influence',
      userId,
      error
    });
    
    // Default to low priority on error
    return {
      followerCount: 0,
      isVerified: false,
      isHighPriority: false
    };
  }
}

// --- Store Influencer Mention ---
async function storeInfluencerMention(mention: TwitterMention): Promise<void> {
  try {
    const influencerMention: InfluencerMention = {
      tweetId: mention.tweetId,
      userId: mention.userId || '',
      userHandle: mention.userHandle,
      followerCount: mention.followerCount || 0,
      isVerified: mention.isVerified || false,
      mentionText: mention.text,
      detectedAt: new Date(),
      processed: false
    };
    
    influencerMentionsStore.set(mention.tweetId, influencerMention);
    
    logEvent({
      level: 'info',
      message: 'Stored influencer mention',
      tweetId: mention.tweetId,
      userHandle: mention.userHandle,
      followerCount: mention.followerCount
    });
    
  } catch (error) {
    logEvent({
      level: 'error',
      message: 'Failed to store influencer mention',
      tweetId: mention.tweetId,
      error
    });
  }
}

// --- Listen to Twitter Stream (core logic) ---
async function listenToStream(bearerToken: string, rules: string[]) {
  // Use fetch or axios for HTTP/2 streaming (node-fetch v3+ or axios + http2)
  // For now, simulate with a mock event loop
  logEvent({ level: 'info', message: 'Connecting to Twitter filtered stream', rules });

  // --- Simulated event loop ---
  for (let i = 0; i < 3; i++) {
    // Simulate mention event
    const mention: TwitterMention = {
      tweetId: `tweet_${Date.now()}`,
      userHandle: '@user' + i,
      text: `Hey ${BRAND_HANDLE}, check this out!`,
      context: 'mention',
      userId: `user_${i}`,
    };
    
    // Check user influence
    const influence = await checkUserInfluence(mention.userId!, bearerToken);
    mention.followerCount = influence.followerCount;
    mention.isVerified = influence.isVerified;
    mention.isHighPriority = influence.isHighPriority;
    
    await handleMentionOrReply(mention);
    
    // Simulate tracked hashtag event
    const hashtag = rules.find(r => r.startsWith('#')) || '#AI';
    await handleTrackedHashtag(hashtag, mention);
    await new Promise(res => setTimeout(res, 1000));
  }
}

// --- Handle Mention or Reply ---
async function handleMentionOrReply(mention: TwitterMention) {
  logEvent({ level: 'info', type: 'mention', mention });
  
  try {
    // Store influencer mention if high priority
    if (mention.isHighPriority) {
      await storeInfluencerMention(mention);
      
      logEvent({
        level: 'info',
        message: 'High priority mention detected',
        tweetId: mention.tweetId,
        userHandle: mention.userHandle,
        followerCount: mention.followerCount,
        isVerified: mention.isVerified
      });
    }
    
    // Respond with elevated context for influencers
    const context = mention.isHighPriority 
      ? `influencer-${mention.context || 'mention'}`
      : mention.context || '';
      
    await twitterAgent.respondToMention(mention.tweetId, context);
    
    logEvent({ 
      level: 'success', 
      message: 'Responded to mention', 
      tweetId: mention.tweetId,
      isHighPriority: mention.isHighPriority
    });
    
  } catch (err) {
    logEvent({ level: 'error', message: 'Failed to respond to mention', tweetId: mention.tweetId, error: err });
  }
}

// --- Handle Tracked Hashtag ---
async function handleTrackedHashtag(hashtag: string, mention: TwitterMention) {
  logEvent({ level: 'info', type: 'hashtag', hashtag, mention });
  // TODO: Store insight in TrendInsightStore for later scanTrends analysis
  // TrendInsightStore.save({ ... })
}

// --- Get Influencer Mentions (for external access) ---
export async function getInfluencerMentions(): Promise<InfluencerMention[]> {
  return Array.from(influencerMentionsStore.values())
    .filter(mention => !mention.processed)
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
}

// --- Mark Influencer Mention as Processed ---
export async function markInfluencerProcessed(tweetId: string): Promise<void> {
  const mention = influencerMentionsStore.get(tweetId);
  if (mention) {
    mention.processed = true;
    influencerMentionsStore.set(tweetId, mention);
  }
}

// --- Start Listener ---
export async function startTwitterStreamListener() {
  logEvent({ level: 'info', message: 'Starting Twitter stream listener...' });
  await connectToTwitterStream();
}

// --- For direct run (dev) ---
if (require.main === module) {
  startTwitterStreamListener().catch(err => {
    logEvent({ level: 'fatal', message: 'Listener crashed', error: err });
    process.exit(1);
  });
} 
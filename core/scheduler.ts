import cron from 'node-cron';
import { TwitterAgent, TweetContent, TweetResponse } from '../agents/TwitterAgent';
import { db } from '../../../data-model/src';
import { Campaign, $Enums } from '../../../data-model/node_modules/.prisma/client';

// --- Scheduler Configuration ---
const SCHEDULE_CRON = '*/30 * * * *'; // Every 30 minutes
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 2000; // 2 seconds
const RATE_LIMIT_BUFFER_MS = 1500; // Buffer between tweets

// --- Priority Tweet Queue (urgent/manual override) ---
const priorityTweetQueue: TweetContent[] = [];

// --- TwitterAgent Instance ---
const twitterAgent = new TwitterAgent('twitter-scheduler', 'Twitter Scheduler');

// --- Helper: Exponential Backoff ---
async function exponentialBackoff<T>(fn: () => Promise<T>, maxRetries: number, baseDelay: number): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(res => setTimeout(res, delay));
      attempt++;
    }
  }
  throw lastError;
}

// --- Helper: Log Tweet Job ---
async function logTweetJob(data: {
  campaignId?: string;
  tweetContent: TweetContent;
  response?: TweetResponse;
  error?: any;
  priority?: boolean;
  attempt: number;
}) {
  // Placeholder: Write to DB table TweetJobLog (to be defined later)
  // For now, just log to console
  // TODO: Replace with Prisma create when model is available
  // await db.tweetJobLog.create({ data: { ... } });
  // eslint-disable-next-line no-console
  console.log('[TweetJobLog]', {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

// --- Main Scheduled Job ---
cron.schedule(SCHEDULE_CRON, async () => {
  try {
    // 1. Query active Twitter-enabled campaigns
    const campaigns: Campaign[] = await db.campaign.findMany({
      where: {
        status: $Enums.CampaignStatus.ACTIVE,
        platforms: {
          has: $Enums.Platform.TWITTER,
        },
      },
    });

    for (const campaign of campaigns) {
      try {
        // 2. Generate tweet for campaign
        const tweetContent = await twitterAgent.generateTweet(campaign.id);
        // 3. Post tweet with exponential backoff
        const response = await exponentialBackoff(
          () => twitterAgent.postTweet(tweetContent),
          MAX_RETRIES,
          BASE_BACKOFF_MS
        );
        await logTweetJob({
          campaignId: campaign.id,
          tweetContent,
          response,
          attempt: 1,
        });
        // 4. Rate limit buffer
        await new Promise(res => setTimeout(res, RATE_LIMIT_BUFFER_MS));
      } catch (err) {
        await logTweetJob({
          campaignId: campaign.id,
          tweetContent: { text: '', hashtags: [], campaignId: campaign.id },
          error: err,
          attempt: MAX_RETRIES,
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Scheduler job failed:', err);
  }
});

// --- Priority Tweet Queue Processor ---
export async function processPriorityTweetQueue() {
  while (priorityTweetQueue.length > 0) {
    const tweet = priorityTweetQueue.shift();
    if (!tweet) continue;
    try {
      const response = await exponentialBackoff(
        () => twitterAgent.postTweet(tweet),
        MAX_RETRIES,
        BASE_BACKOFF_MS
      );
      await logTweetJob({
        tweetContent: tweet,
        response,
        priority: true,
        attempt: 1,
      });
      await new Promise(res => setTimeout(res, RATE_LIMIT_BUFFER_MS));
    } catch (err) {
      await logTweetJob({
        tweetContent: tweet,
        error: err,
        priority: true,
        attempt: MAX_RETRIES,
      });
    }
  }
}

// --- Manual API to Add Urgent Tweet ---
export function enqueuePriorityTweet(tweet: TweetContent) {
  priorityTweetQueue.push(tweet);
}

// --- Export for testability and agent-agnostic extension ---
export const SchedulerConfig = {
  SCHEDULE_CRON,
  MAX_RETRIES,
  BASE_BACKOFF_MS,
  RATE_LIMIT_BUFFER_MS,
};

export { twitterAgent }; 
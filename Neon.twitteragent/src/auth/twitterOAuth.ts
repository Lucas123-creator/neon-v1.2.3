import { TwitterApi } from 'twitter-api-v2';
import { db } from '../../../data-model/src/client';
import * as crypto from 'crypto';

// --- Type Definitions ---
export interface TwitterToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId: string;
  scope?: string[];
}

export interface TwitterApiClient {
  client: TwitterApi;
  userId: string;
}

// --- Config ---
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI!;
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'devkeydevkeydevkeydevkey';

// --- Encryption Helpers (Mock) ---
function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(ENCRYPTION_KEY), Buffer.alloc(16, 0));
  return Buffer.concat([cipher.update(text), cipher.final()]).toString('hex');
}
function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(ENCRYPTION_KEY), Buffer.alloc(16, 0));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]).toString();
}

// --- OAuth: Get Access Token ---
export async function getAccessToken(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
  // Twitter OAuth 2.0 PKCE flow
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
  const { client: authClient, accessToken, refreshToken, expiresIn, scope } = await client.loginWithOAuth2({
    code,
    codeVerifier: '', // Should be stored per session in real implementation
    redirectUri: TWITTER_REDIRECT_URI,
  });
  return { accessToken, refreshToken };
}

// --- OAuth: Refresh Access Token ---
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
  const { accessToken } = await client.refreshOAuth2Token(refreshToken);
  return accessToken;
}

// --- Store Token in DB (Prisma) ---
export async function storeTwitterToken(userId: string, token: TwitterToken): Promise<void> {
  await db.account.upsert({
    where: { provider_providerAccountId: { provider: 'twitter', providerAccountId: userId } },
    update: {
      access_token: encrypt(token.accessToken),
      refresh_token: token.refreshToken ? encrypt(token.refreshToken) : undefined,
      expires_at: token.expiresAt ? Math.floor(token.expiresAt.getTime() / 1000) : undefined,
      scope: token.scope?.join(','),
      userId,
      provider: 'twitter',
      providerAccountId: userId,
      type: 'oauth',
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      provider: 'twitter',
      providerAccountId: userId,
      type: 'oauth',
      access_token: encrypt(token.accessToken),
      refresh_token: token.refreshToken ? encrypt(token.refreshToken) : undefined,
      expires_at: token.expiresAt ? Math.floor(token.expiresAt.getTime() / 1000) : undefined,
      scope: token.scope?.join(','),
    },
  });
}

// --- Retrieve Token from DB ---
export async function getStoredTwitterToken(userId: string): Promise<TwitterToken | null> {
  const cred = await db.account.findUnique({
    where: { provider_providerAccountId: { provider: 'twitter', providerAccountId: userId } },
  });
  if (!cred) return null;
  return {
    accessToken: cred.access_token ? decrypt(cred.access_token) : '',
    refreshToken: cred.refresh_token ? decrypt(cred.refresh_token) : undefined,
    expiresAt: cred.expires_at ? new Date(cred.expires_at * 1000) : undefined,
    userId,
    scope: cred.scope ? cred.scope.split(',') : undefined,
  };
}

// --- Get Authorized Twitter Client ---
export async function getAuthorizedTwitterClient(userId: string): Promise<TwitterApiClient> {
  let token = await getStoredTwitterToken(userId);
  if (!token) throw new Error('No Twitter token found for user');

  // Check expiry
  if (token.expiresAt && token.expiresAt < new Date()) {
    if (!token.refreshToken) throw new Error('No refresh token available');
    const newAccessToken = await refreshAccessToken(token.refreshToken);
    token.accessToken = newAccessToken;
    // Optionally update expiry
    await storeTwitterToken(userId, token);
  }

  // Create Twitter API client
  const client = new TwitterApi(token.accessToken);
  return { client, userId };
}

// --- Rate Limit Safety (Queue/Backoff) ---
export async function safeTwitterRequest<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.code === 429) {
        // Rate limit hit, backoff
        await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
        attempt++;
        continue;
      }
      lastError = err;
      break;
    }
  }
  throw lastError;
}

// --- Scope Validation ---
export function validateTwitterScopes(token: TwitterToken, requiredScopes: string[]): void {
  if (!token.scope) throw new Error('No scopes found');
  for (const scope of requiredScopes) {
    if (!token.scope.includes(scope)) {
      throw new Error(`Missing required Twitter scope: ${scope}`);
    }
  }
} 
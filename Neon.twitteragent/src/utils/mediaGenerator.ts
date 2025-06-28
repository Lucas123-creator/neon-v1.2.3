import * as path from 'path';
import * as fs from 'fs/promises';
import { createCanvas, loadImage } from 'canvas'; // If not installed, mock logic will be used
import { OpenAI } from 'openai';
import type { TweetContent } from '../agents/TwitterAgent';

// --- Type Definitions ---
export interface MemeSpec {
  caption: string;
  templateName: string;
  emotion: 'funny' | 'inspiring' | 'curious';
  altText?: string;
}

export interface ProductTileSpec {
  productImage: string;
  slogan: string;
  emoji?: string;
  colorScheme?: string;
  fontFamily?: string;
  altText?: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MEME_ASSETS_DIR = path.join(process.cwd(), 'public', 'assets', 'memes');
const DEFAULT_FONT = 'Poppins';
const DEFAULT_COLOR = '#0ff0fc';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Generate Meme ---
export async function generateMeme(campaignId: string): Promise<string> {
  // 1. Fetch campaign info (mocked for now)
  const campaign = await getCampaignInfo(campaignId);

  // 2. Use OpenAI to generate meme caption and visual type
  const memeSpec = await generateMemeSpecWithAI(campaign);

  // 3. Select base template
  const templatePath = await selectMemeTemplate(memeSpec.templateName);

  // 4. Render meme (mocked with canvas or fallback)
  const memeBuffer = await renderMeme(templatePath, memeSpec.caption, memeSpec.altText);

  // 5. Save meme to disk and return URL (mocked)
  const memeFileName = `meme_${campaignId}_${Date.now()}.png`;
  const memeFilePath = path.join(MEME_ASSETS_DIR, memeFileName);
  await fs.writeFile(memeFilePath, memeBuffer);
  const memeUrl = `/assets/memes/${memeFileName}`;

  return memeUrl;
}

// --- Generate Product Tile ---
export async function generateProductTile(spec: ProductTileSpec): Promise<string> {
  // 1. Load product image
  let productImg;
  try {
    productImg = await loadImage(spec.productImage);
  } catch {
    // fallback to placeholder
    productImg = await loadImage(path.join(MEME_ASSETS_DIR, 'placeholder.png'));
  }

  // 2. Create canvas
  const width = 600, height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 3. Draw product image
  ctx.drawImage(productImg, 0, 0, width, height);

  // 4. Overlay slogan and emoji
  ctx.font = `bold 48px ${spec.fontFamily || DEFAULT_FONT}`;
  ctx.fillStyle = spec.colorScheme || DEFAULT_COLOR;
  ctx.textAlign = 'center';
  ctx.fillText(spec.slogan, width / 2, height - 80);
  if (spec.emoji) {
    ctx.font = 'bold 64px Arial';
    ctx.fillText(spec.emoji, width / 2, height - 20);
  }

  // 5. Save and return URL
  const tileFileName = `tile_${Date.now()}.png`;
  const tileFilePath = path.join(MEME_ASSETS_DIR, tileFileName);
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(tileFilePath, buffer);
  return `/assets/memes/${tileFileName}`;
}

// --- Attach Visual to Tweet ---
export async function attachVisualToTweet(tweet: TweetContent): Promise<TweetContent> {
  // Simple heuristic: attach meme if tweet is funny or contains certain keywords
  const needsMeme = /funny|meme|lol|😂|joke|hilarious|rofl/i.test(tweet.text);
  const needsProductTile = /product|launch|new|shop|store|buy|sale/i.test(tweet.text);

  let mediaUrl: string | undefined;
  if (needsMeme) {
    mediaUrl = await generateMeme(tweet.campaignId || 'default-campaign');
  } else if (needsProductTile) {
    mediaUrl = await generateProductTile({
      productImage: '/assets/memes/placeholder.png',
      slogan: tweet.text.slice(0, 40),
      colorScheme: DEFAULT_COLOR,
      fontFamily: DEFAULT_FONT,
      altText: 'Product promotional tile',
    });
  }

  return {
    ...tweet,
    mediaUrl,
    metadata: {
      ...tweet.metadata,
      visualAttached: !!mediaUrl,
      visualType: needsMeme ? 'meme' : needsProductTile ? 'productTile' : undefined,
    },
  };
}

// --- Helper: Fetch Campaign Info (Mock) ---
async function getCampaignInfo(campaignId: string): Promise<any> {
  // Replace with real DB call
  return {
    id: campaignId,
    product: 'Neon Sign',
    theme: 'Futuristic',
    tone: 'funny',
    slogan: 'Light up your brand!',
    colorScheme: DEFAULT_COLOR,
    fontFamily: DEFAULT_FONT,
  };
}

// --- Helper: Generate Meme Spec with AI (or mock) ---
async function generateMemeSpecWithAI(campaign: any): Promise<MemeSpec> {
  try {
    const prompt = `Generate a meme caption and template for a ${campaign.tone} campaign about ${campaign.product}. Return JSON: { caption, templateName, emotion }`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a meme generator for a neon signage brand.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });
    const json = response.choices[0]?.message?.content?.match(/\{[\s\S]*\}/)?.[0];
    if (json) {
      return JSON.parse(json);
    }
  } catch (e) {
    // fallback
  }
  // Fallback meme spec
  return {
    caption: 'When your sign is brighter than your future ✨',
    templateName: 'drake.png',
    emotion: 'funny',
    altText: 'Drake meme with neon sign joke',
  };
}

// --- Helper: Select Meme Template ---
async function selectMemeTemplate(templateName: string): Promise<string> {
  // Check if template exists
  const templatePath = path.join(MEME_ASSETS_DIR, templateName);
  try {
    await fs.access(templatePath);
    return templatePath;
  } catch {
    // fallback to default
    return path.join(MEME_ASSETS_DIR, 'default-meme.png');
  }
}

// --- Helper: Render Meme (Canvas or fallback) ---
async function renderMeme(templatePath: string, caption: string, altText?: string): Promise<Buffer> {
  try {
    const baseImg = await loadImage(templatePath);
    const width = baseImg.width;
    const height = baseImg.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImg, 0, 0, width, height);
    ctx.font = 'bold 40px Poppins';
    ctx.fillStyle = '#0ff0fc';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    // Draw caption with outline
    ctx.strokeText(caption, width / 2, height - 40);
    ctx.fillText(caption, width / 2, height - 40);
    // Optionally add alt text as metadata (not visible)
    return canvas.toBuffer('image/png');
  } catch (e) {
    // fallback: return empty buffer
    return Buffer.from('');
  }
} 
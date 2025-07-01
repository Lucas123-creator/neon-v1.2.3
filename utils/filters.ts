import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

// --- Type Definitions ---
export interface BrandSafetyResult {
  isSafe: boolean;
  flaggedTerms: string[];
  confidence: number;
  revision?: string;
  auditLog: {
    timestamp: Date;
    originalText: string;
    action: 'approved' | 'rejected' | 'revised';
    reason?: string;
  };
}

export interface ModerationConfig {
  enableAutoRevision: boolean;
  strictMode: boolean;
  customBlacklist?: string[];
  allowedSlang?: string[];
  brandTone: 'professional' | 'casual' | 'friendly' | 'formal';
}

export interface BlacklistEntry {
  term: string;
  category: 'slur' | 'slang' | 'controversial' | 'off-brand' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  replacement?: string;
}

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLACKLIST_FILE = path.join(process.cwd(), 'data', 'config', 'blacklist.json');
const DEFAULT_BRAND_TONE = 'professional';

// --- OpenAI Client ---
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// --- Main Brand Safety Class ---
export class BrandSafetyFilter {
  private blacklist: BlacklistEntry[] = [];
  private customBlacklists: Map<string, string[]> = new Map();
  private auditLogs: BrandSafetyResult[] = [];

  constructor(private config: ModerationConfig = {
    enableAutoRevision: true,
    strictMode: false,
    brandTone: DEFAULT_BRAND_TONE,
  }) {
    this.loadBlacklist();
  }

  // --- Load Blacklist from File ---
  private async loadBlacklist(): Promise<void> {
    try {
      const blacklistPath = BLACKLIST_FILE;
      const blacklistData = await fs.readFile(blacklistPath, 'utf-8');
      this.blacklist = JSON.parse(blacklistData);
    } catch (error) {
      console.warn('Could not load blacklist file, using default terms:', error);
      this.blacklist = this.getDefaultBlacklist();
    }
  }

  // --- Get Default Blacklist ---
  private getDefaultBlacklist(): BlacklistEntry[] {
    return [
      { term: 'kill', category: 'controversial', severity: 'high' },
      { term: 'hate', category: 'controversial', severity: 'medium' },
      { term: 'cheap af', category: 'slang', severity: 'low' },
      { term: 'lit', category: 'slang', severity: 'low' },
      { term: 'nsfw', category: 'controversial', severity: 'high' },
      { term: 'onlyfans', category: 'controversial', severity: 'critical' },
      { term: 'fuck', category: 'slur', severity: 'high' },
      { term: 'shit', category: 'slur', severity: 'medium' },
      { term: 'damn', category: 'slur', severity: 'low' },
      { term: 'ass', category: 'slur', severity: 'medium' },
      { term: 'bitch', category: 'slur', severity: 'high' },
      { term: 'dumb', category: 'off-brand', severity: 'low' },
      { term: 'stupid', category: 'off-brand', severity: 'low' },
      { term: 'ugly', category: 'off-brand', severity: 'low' },
      { term: 'fat', category: 'off-brand', severity: 'medium' },
      { term: 'skinny', category: 'off-brand', severity: 'low' },
      { term: 'gay', category: 'controversial', severity: 'medium' },
      { term: 'retarded', category: 'slur', severity: 'critical' },
      { term: 'autistic', category: 'slur', severity: 'high' },
      { term: 'cripple', category: 'slur', severity: 'high' },
    ];
  }

  // --- Check Brand Safety ---
  async checkBrandSafety(text: string, campaignId?: string): Promise<BrandSafetyResult> {
    const timestamp = new Date();
    const originalText = text;
    
    try {
      // Get all blacklist terms (global + campaign-specific)
      const allBlacklistTerms = this.getAllBlacklistTerms(campaignId);
      
      // Scan for flagged terms
      const flaggedTerms = this.scanForFlaggedTerms(text, allBlacklistTerms);
      
      // Determine if content is safe
      const isSafe = flaggedTerms.length === 0;
      
      // Calculate confidence based on severity and strictness
      const confidence = this.calculateConfidence(flaggedTerms);
      
      let revision: string | undefined;
      let action: 'approved' | 'rejected' | 'revised' = 'approved';
      let reason: string | undefined;
      
      if (!isSafe) {
        if (this.config.enableAutoRevision) {
          revision = await this.reviseUnsafeTweet(text);
          action = 'revised';
          reason = `Auto-revised due to flagged terms: ${flaggedTerms.join(', ')}`;
        } else {
          action = 'rejected';
          reason = `Content rejected due to flagged terms: ${flaggedTerms.join(', ')}`;
        }
      }
      
      const result: BrandSafetyResult = {
        isSafe,
        flaggedTerms,
        confidence,
        revision,
        auditLog: {
          timestamp,
          originalText,
          action,
          reason,
        },
      };
      
      // Store audit log
      this.auditLogs.push(result);
      
      return result;
      
    } catch (error) {
      console.error('Error in brand safety check:', error);
      
      // Fallback: reject if error occurs in strict mode
      const fallbackResult: BrandSafetyResult = {
        isSafe: !this.config.strictMode,
        flaggedTerms: [],
        confidence: 0.5,
        auditLog: {
          timestamp,
          originalText,
          action: this.config.strictMode ? 'rejected' : 'approved',
          reason: 'Error occurred during safety check',
        },
      };
      
      this.auditLogs.push(fallbackResult);
      return fallbackResult;
    }
  }

  // --- Get All Blacklist Terms ---
  private getAllBlacklistTerms(campaignId?: string): BlacklistEntry[] {
    let allTerms = [...this.blacklist];
    
    // Add custom blacklist terms
    if (this.config.customBlacklist) {
      allTerms.push(...this.config.customBlacklist.map(term => ({
        term,
        category: 'custom' as const,
        severity: 'medium' as const,
      })));
    }
    
    // Add campaign-specific blacklist
    if (campaignId && this.customBlacklists.has(campaignId)) {
      const campaignTerms = this.customBlacklists.get(campaignId) || [];
      allTerms.push(...campaignTerms.map(term => ({
        term,
        category: 'custom' as const,
        severity: 'medium' as const,
      })));
    }
    
    return allTerms;
  }

  // --- Scan for Flagged Terms ---
  private scanForFlaggedTerms(text: string, blacklistTerms: BlacklistEntry[]): string[] {
    const flaggedTerms: string[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const entry of blacklistTerms) {
      const term = entry.term.toLowerCase();
      
      // Check for exact word boundaries
      const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
      if (wordBoundaryRegex.test(normalizedText)) {
        flaggedTerms.push(entry.term);
      }
      
      // Check for partial matches in strict mode
      if (this.config.strictMode && normalizedText.includes(term)) {
        flaggedTerms.push(entry.term);
      }
    }
    
    return Array.from(new Set(flaggedTerms)); // Remove duplicates
  }

  // --- Escape Regex Special Characters ---
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Calculate Confidence ---
  private calculateConfidence(flaggedTerms: string[]): number {
    if (flaggedTerms.length === 0) return 1.0;
    
    // Lower confidence with more flagged terms
    const baseConfidence = Math.max(0.1, 1.0 - (flaggedTerms.length * 0.2));
    
    // Adjust based on strict mode
    return this.config.strictMode ? baseConfidence * 0.8 : baseConfidence;
  }

  // --- Revise Unsafe Tweet ---
  async reviseUnsafeTweet(text: string): Promise<string> {
    try {
      const prompt = this.buildRevisionPrompt(text);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a brand safety expert. Rewrite tweets to be professional, inclusive, and brand-safe while maintaining the original message and tone.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 280,
        temperature: 0.7,
      });
      
      const revisedText = response.choices[0]?.message?.content?.trim();
      
      if (!revisedText) {
        throw new Error('No revision generated');
      }
      
      return revisedText;
      
    } catch (error) {
      console.error('Error revising unsafe tweet:', error);
      
      // Fallback: return sanitized version
      return this.sanitizeText(text);
    }
  }

  // --- Build Revision Prompt ---
  private buildRevisionPrompt(originalText: string): string {
    const tone = this.config.brandTone;
    
    return `Rewrite the following tweet to match a ${tone}, brand-safe, inclusive tone. 
    
Guidelines:
- Avoid slang, insults, or controversial terms
- Maintain the original message and intent
- Keep it professional and respectful
- Ensure it's suitable for all audiences
- Preserve hashtags and mentions
- Keep under 280 characters

Original tweet: "${originalText}"

Revised tweet:`;
  }

  // --- Sanitize Text (Fallback) ---
  private sanitizeText(text: string): string {
    // Simple fallback sanitization
    let sanitized = text;
    
    // Replace common problematic terms
    const replacements: Record<string, string> = {
      'fuck': 'heck',
      'shit': 'stuff',
      'damn': 'darn',
      'ass': 'bottom',
      'bitch': 'person',
      'dumb': 'silly',
      'stupid': 'foolish',
      'ugly': 'unattractive',
      'fat': 'large',
      'skinny': 'thin',
      'gay': 'homosexual',
      'retarded': 'slow',
      'autistic': 'neurodivergent',
      'cripple': 'disabled',
    };
    
    for (const [bad, good] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${this.escapeRegex(bad)}\\b`, 'gi');
      sanitized = sanitized.replace(regex, good);
    }
    
    return sanitized;
  }

  // --- Add Custom Blacklist for Campaign ---
  addCampaignBlacklist(campaignId: string, terms: string[]): void {
    this.customBlacklists.set(campaignId, terms);
  }

  // --- Remove Campaign Blacklist ---
  removeCampaignBlacklist(campaignId: string): void {
    this.customBlacklists.delete(campaignId);
  }

  // --- Get Blacklist Terms ---
  getBlacklistTerms(): string[] {
    return this.blacklist.map(entry => entry.term);
  }

  // --- Get All Blacklist Terms (Public) ---
  getAllBlacklistTermsPublic(campaignId?: string): string[] {
    const allEntries = this.getAllBlacklistTerms(campaignId);
    return allEntries.map(entry => entry.term);
  }

  // --- Get Audit Logs ---
  getAuditLogs(): BrandSafetyResult[] {
    return [...this.auditLogs];
  }

  // --- Clear Audit Logs ---
  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  // --- Update Configuration ---
  updateConfig(newConfig: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // --- Get Current Configuration ---
  getConfig(): ModerationConfig {
    return { ...this.config };
  }
}

// --- Export Singleton Instance ---
export const brandSafetyFilter = new BrandSafetyFilter();

// --- Export Helper Functions ---
export const checkBrandSafety = (text: string, campaignId?: string) => 
  brandSafetyFilter.checkBrandSafety(text, campaignId);

export const reviseUnsafeTweet = (text: string) => 
  brandSafetyFilter.reviseUnsafeTweet(text);

export const getBlacklistTerms = () => 
  brandSafetyFilter.getBlacklistTerms(); 
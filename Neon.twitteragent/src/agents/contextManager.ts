import { db } from '../../../data-model/src/client';

// --- Type Definitions ---
export interface PersonaProfile {
  id: string;
  name: string;
  tone: string;
  emojiStyle: 'emoji-heavy' | 'subtle' | 'none';
  typicalPhrases: string[];
  colorScheme?: string;
  visualStyle?: 'bold' | 'minimal' | 'playful' | 'professional';
  hashtagStyle?: 'trendy' | 'branded' | 'minimal';
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignContext {
  campaignId: string;
  goal: string;
  product: string;
  audience: string;
  persona: PersonaProfile;
  hashtags: string[];
  tone: 'humorous' | 'inspirational' | 'bold' | 'minimal';
  brandVoice?: string;
  targetMetrics?: string[];
  competitors?: string[];
  industry?: string;
  seasonality?: string[];
  urgency?: 'low' | 'medium' | 'high';
}

export interface BrandVoiceGuidelines {
  do: string[];
  dont: string[];
  keywords: string[];
  toneAdjustments: Record<string, string>;
}

// --- Mock Persona Memory Store ---
const personaMemory: Map<string, PersonaProfile> = new Map();

// Initialize with default personas
const defaultPersonas: PersonaProfile[] = [
  {
    id: 'neon-enthusiast',
    name: 'Neon Enthusiast',
    tone: 'energetic and passionate about lighting',
    emojiStyle: 'emoji-heavy',
    typicalPhrases: [
      'Light up your world! ✨',
      'Illuminate your brand! 💡',
      'Make it shine! 🌟',
      'Bright ideas start here! 🚀',
      'Turn heads with neon! 🔥'
    ],
    colorScheme: '#0ff0fc',
    visualStyle: 'bold',
    hashtagStyle: 'trendy',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    tone: 'confident and results-driven',
    emojiStyle: 'subtle',
    typicalPhrases: [
      'Transform your business presence',
      'Professional signage solutions',
      'Elevate your brand visibility',
      'Strategic lighting for growth',
      'Quality craftsmanship guaranteed'
    ],
    colorScheme: '#1a1a1a',
    visualStyle: 'professional',
    hashtagStyle: 'branded',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'creative-innovator',
    name: 'Creative Innovator',
    tone: 'artistic and forward-thinking',
    emojiStyle: 'subtle',
    typicalPhrases: [
      'Where art meets technology',
      'Innovative lighting solutions',
      'Creative expression through light',
      'Pushing boundaries with neon',
      'Artistic excellence in every sign'
    ],
    colorScheme: '#ff6b6b',
    visualStyle: 'playful',
    hashtagStyle: 'trendy',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    tone: 'clean and sophisticated',
    emojiStyle: 'none',
    typicalPhrases: [
      'Less is more',
      'Clean lines, bold impact',
      'Sophisticated simplicity',
      'Modern minimalism',
      'Elegant lighting solutions'
    ],
    colorScheme: '#ffffff',
    visualStyle: 'minimal',
    hashtagStyle: 'minimal',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Populate persona memory
defaultPersonas.forEach(persona => {
  personaMemory.set(persona.id, persona);
});

// --- Main Context Manager Class ---
export class ContextManager {
  private personaStore: Map<string, PersonaProfile> = personaMemory;

  // --- Get Campaign Context ---
  async getCampaignContext(campaignId: string): Promise<CampaignContext> {
    try {
      // Fetch campaign from database
      const campaign = await this.fetchCampaignFromDB(campaignId);
      
      // Get persona profile
      const persona = await this.getPersonaProfile(campaign.personaId || 'neon-enthusiast');
      
      // Build context
      const context: CampaignContext = {
        campaignId: campaign.id,
        goal: campaign.description || 'Increase brand visibility',
        product: this.extractProductFromCampaign(campaign),
        audience: this.extractAudienceFromCampaign(campaign),
        persona,
        hashtags: this.extractHashtagsFromCampaign(campaign),
        tone: this.determineToneFromPersona(persona),
        brandVoice: campaign.settings?.brandVoice,
        targetMetrics: campaign.settings?.targetMetrics,
        competitors: campaign.settings?.competitors,
        industry: campaign.settings?.industry,
        seasonality: campaign.settings?.seasonality,
        urgency: this.determineUrgency(campaign),
      };

      return context;

    } catch (error) {
      console.error('Error getting campaign context:', error);
      // Return fallback context
      return this.getFallbackContext(campaignId);
    }
  }

  // --- Fetch Campaign from Database ---
  private async fetchCampaignFromDB(campaignId: string): Promise<any> {
    try {
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: {
          user: true,
        },
      });
      
      if (!campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
      }
      
      return campaign;
    } catch (error) {
      console.error('Error fetching campaign from DB:', error);
      // Return mock campaign data
      return this.getMockCampaign(campaignId);
    }
  }

  // --- Get Persona Profile ---
  async getPersonaProfile(personaId: string): Promise<PersonaProfile> {
    const persona = this.personaStore.get(personaId);
    if (!persona) {
      console.warn(`Persona not found: ${personaId}, using default`);
      return this.personaStore.get('neon-enthusiast')!;
    }
    return persona;
  }

  // --- Extract Product from Campaign ---
  private extractProductFromCampaign(campaign: any): string {
    if (campaign.settings?.product) return campaign.settings.product;
    if (campaign.name.toLowerCase().includes('neon')) return 'Neon Signs';
    if (campaign.name.toLowerCase().includes('lighting')) return 'Custom Lighting';
    return 'Neon Signage Solutions';
  }

  // --- Extract Audience from Campaign ---
  private extractAudienceFromCampaign(campaign: any): string {
    if (campaign.targetAudience) {
      const audience = campaign.targetAudience as any;
      if (typeof audience === 'object') {
        return audience.description || audience.type || 'Business owners';
      }
      return audience;
    }
    return 'Small business owners and entrepreneurs';
  }

  // --- Extract Hashtags from Campaign ---
  private extractHashtagsFromCampaign(campaign: any): string[] {
    const hashtags: string[] = [];
    
    // Add campaign-specific hashtags
    if (campaign.settings?.hashtags) {
      hashtags.push(...campaign.settings.hashtags);
    }
    
    // Add default hashtags based on product
    const product = this.extractProductFromCampaign(campaign);
    if (product.toLowerCase().includes('neon')) {
      hashtags.push('#NeonSigns', '#CustomNeon');
    }
    if (product.toLowerCase().includes('lighting')) {
      hashtags.push('#CustomLighting', '#LEDSigns');
    }
    
    // Add business hashtags
    hashtags.push('#SmallBusiness', '#BusinessGrowth');
    
    return Array.from(new Set(hashtags)); // Remove duplicates
  }

  // --- Determine Tone from Persona ---
  private determineToneFromPersona(persona: PersonaProfile): CampaignContext['tone'] {
    const toneMap: Record<string, CampaignContext['tone']> = {
      'energetic': 'bold',
      'passionate': 'bold',
      'confident': 'bold',
      'results-driven': 'bold',
      'artistic': 'inspirational',
      'forward-thinking': 'inspirational',
      'clean': 'minimal',
      'sophisticated': 'minimal',
      'playful': 'humorous',
      'fun': 'humorous',
    };

    for (const [key, tone] of Object.entries(toneMap)) {
      if (persona.tone.toLowerCase().includes(key)) {
        return tone;
      }
    }

    return 'bold'; // Default tone
  }

  // --- Determine Urgency ---
  private determineUrgency(campaign: any): CampaignContext['urgency'] {
    if (campaign.endDate) {
      const daysUntilEnd = Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilEnd <= 7) return 'high';
      if (daysUntilEnd <= 30) return 'medium';
    }
    return 'low';
  }

  // --- Get Fallback Context ---
  private getFallbackContext(campaignId: string): CampaignContext {
    const defaultPersona = this.personaStore.get('neon-enthusiast')!;
    
    return {
      campaignId,
      goal: 'Increase brand visibility and engagement',
      product: 'Neon Signage Solutions',
      audience: 'Small business owners',
      persona: defaultPersona,
      hashtags: ['#NeonSigns', '#SmallBusiness', '#CustomLighting'],
      tone: 'bold',
      urgency: 'low',
    };
  }

  // --- Get Mock Campaign ---
  private getMockCampaign(campaignId: string): any {
    return {
      id: campaignId,
      name: 'Neon Sign Campaign',
      description: 'Promote custom neon signage solutions',
      settings: {
        product: 'Neon Signs',
        targetMetrics: ['engagement', 'leads'],
        industry: 'Signage',
        brandVoice: 'Professional yet approachable',
      },
      targetAudience: {
        type: 'Small business owners',
        description: 'Local businesses looking to enhance their storefront',
      },
      personaId: 'neon-enthusiast',
    };
  }

  // --- Add Persona to Store ---
  addPersona(persona: PersonaProfile): void {
    this.personaStore.set(persona.id, persona);
  }

  // --- Remove Persona from Store ---
  removePersona(personaId: string): void {
    this.personaStore.delete(personaId);
  }

  // --- Get All Personas ---
  getAllPersonas(): PersonaProfile[] {
    return Array.from(this.personaStore.values());
  }

  // --- Get Brand Voice Guidelines ---
  getBrandVoiceGuidelines(persona: PersonaProfile): BrandVoiceGuidelines {
    const guidelines: BrandVoiceGuidelines = {
      do: [
        `Use ${persona.tone} language`,
        `Include ${persona.emojiStyle} emojis appropriately`,
        `Reference typical phrases like: ${persona.typicalPhrases.slice(0, 2).join(', ')}`,
        `Maintain ${persona.visualStyle} visual style`,
      ],
      dont: [
        'Use overly formal language',
        'Include irrelevant hashtags',
        'Mix conflicting tones',
        'Ignore brand consistency',
      ],
      keywords: persona.typicalPhrases.flatMap(phrase => 
        phrase.toLowerCase().match(/\b\w+\b/g) || []
      ),
      toneAdjustments: {
        'humorous': 'Add wit and playfulness',
        'inspirational': 'Include motivational language',
        'bold': 'Use confident, assertive language',
        'minimal': 'Keep it simple and clean',
      },
    };

    return guidelines;
  }

  // --- Match Visual Style to Persona ---
  getVisualStyleForPersona(persona: PersonaProfile): string {
    const styleMap: Record<string, string> = {
      'bold': 'high-contrast, vibrant colors, strong typography',
      'minimal': 'clean lines, simple graphics, plenty of white space',
      'playful': 'bright colors, fun shapes, dynamic layouts',
      'professional': 'refined typography, balanced composition, corporate colors',
    };

    return styleMap[persona.visualStyle || 'bold'] || styleMap.bold;
  }

  // --- Get Hashtag Strategy ---
  getHashtagStrategy(persona: PersonaProfile): string[] {
    const strategies: Record<string, string[]> = {
      'trendy': ['#Trending', '#Viral', '#Popular'],
      'branded': ['#BrandName', '#CompanyName', '#Signature'],
      'minimal': ['#Simple', '#Clean', '#Minimal'],
    };

    return strategies[persona.hashtagStyle || 'trendy'] || strategies.trendy;
  }
}

// --- Export Singleton Instance ---
export const contextManager = new ContextManager();

// --- Export Helper Functions ---
export const getCampaignContext = (campaignId: string) => 
  contextManager.getCampaignContext(campaignId);

export const getPersonaProfile = (personaId: string) => 
  contextManager.getPersonaProfile(personaId); 
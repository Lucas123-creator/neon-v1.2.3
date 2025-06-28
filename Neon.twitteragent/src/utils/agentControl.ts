import { db } from '../../../data-model/src/client';

// --- Type Definitions ---
export interface AgentFlag {
  agentName: string;
  paused: boolean;
  reason?: string;
  pausedAt?: Date;
  pausedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentControlConfig {
  enableEmergencyStop: boolean;
  requireApproval: boolean;
  maxDailyTweets: number;
  safeMode: boolean;
}

// --- Mock In-Memory Store (Replace with DB when schema is updated) ---
const agentFlagsStore: Map<string, AgentFlag> = new Map();

// --- Agent Control Class ---
export class AgentControl {
  private controlCache: Map<string, AgentFlag> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // --- Check if Agent is Paused ---
  async isAgentPaused(agentName: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.getCachedFlag(agentName);
      if (cached !== null) {
        return cached.paused;
      }

      // Query mock store
      const flag = await this.getAgentFlagFromStore(agentName);
      
      // Cache the result
      this.cacheFlag(agentName, flag);
      
      return flag?.paused || false;
      
    } catch (error) {
      console.error(`Error checking agent pause status for ${agentName}:`, error);
      // Default to paused in case of error (fail-safe)
      return true;
    }
  }

  // --- Throw if Agent is Paused ---
  async throwIfPaused(agentName: string): Promise<void> {
    const isPaused = await this.isAgentPaused(agentName);
    if (isPaused) {
      const flag = await this.getAgentFlagFromStore(agentName);
      throw new Error(`Agent ${agentName} is paused${flag?.reason ? `: ${flag.reason}` : ''}`);
    }
  }

  // --- Pause Agent ---
  async pauseAgent(agentName: string, reason?: string, pausedBy?: string): Promise<void> {
    try {
      const flag: AgentFlag = {
        agentName,
        paused: true,
        reason,
        pausedAt: new Date(),
        pausedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      agentFlagsStore.set(agentName, flag);

      // Clear cache
      this.clearCache(agentName);
      
      console.log(`Agent ${agentName} paused${reason ? `: ${reason}` : ''}`);
      
    } catch (error) {
      console.error(`Error pausing agent ${agentName}:`, error);
      throw error;
    }
  }

  // --- Resume Agent ---
  async resumeAgent(agentName: string, resumedBy?: string): Promise<void> {
    try {
      const existingFlag = agentFlagsStore.get(agentName);
      if (existingFlag) {
        const updatedFlag: AgentFlag = {
          ...existingFlag,
          paused: false,
          reason: undefined,
          pausedAt: undefined,
          pausedBy: undefined,
          updatedAt: new Date(),
        };
        agentFlagsStore.set(agentName, updatedFlag);
      }

      // Clear cache
      this.clearCache(agentName);
      
      console.log(`Agent ${agentName} resumed`);
      
    } catch (error) {
      console.error(`Error resuming agent ${agentName}:`, error);
      throw error;
    }
  }

  // --- Get Agent Flag from Mock Store ---
  private async getAgentFlagFromStore(agentName: string): Promise<AgentFlag | null> {
    try {
      return agentFlagsStore.get(agentName) || null;
    } catch (error) {
      console.error(`Error fetching agent flag for ${agentName}:`, error);
      return null;
    }
  }

  // --- Cache Management ---
  private getCachedFlag(agentName: string): AgentFlag | null {
    const expiry = this.cacheExpiry.get(agentName);
    if (expiry && Date.now() < expiry) {
      return this.controlCache.get(agentName) || null;
    }
    return null;
  }

  private cacheFlag(agentName: string, flag: AgentFlag | null): void {
    if (flag) {
      this.controlCache.set(agentName, flag);
      this.cacheExpiry.set(agentName, Date.now() + this.CACHE_TTL);
    }
  }

  private clearCache(agentName: string): void {
    this.controlCache.delete(agentName);
    this.cacheExpiry.delete(agentName);
  }

  // --- Get All Paused Agents ---
  async getPausedAgents(): Promise<AgentFlag[]> {
    try {
      const flags = Array.from(agentFlagsStore.values())
        .filter(flag => flag.paused)
        .sort((a, b) => (b.pausedAt?.getTime() || 0) - (a.pausedAt?.getTime() || 0));
      
      return flags;
    } catch (error) {
      console.error('Error fetching paused agents:', error);
      return [];
    }
  }

  // --- Emergency Stop All Agents ---
  async emergencyStopAll(reason: string = 'Emergency stop initiated'): Promise<void> {
    try {
      const agents = ['TwitterAgent', 'ContentAgent', 'SocialAgent', 'EmailAgent'];
      
      await Promise.all(
        agents.map(agentName => this.pauseAgent(agentName, reason, 'system'))
      );
      
      console.log('Emergency stop completed for all agents');
      
    } catch (error) {
      console.error('Error during emergency stop:', error);
      throw error;
    }
  }

  // --- Resume All Agents ---
  async resumeAllAgents(resumedBy: string = 'system'): Promise<void> {
    try {
      const pausedAgents = await this.getPausedAgents();
      
      await Promise.all(
        pausedAgents.map(flag => this.resumeAgent(flag.agentName, resumedBy))
      );
      
      console.log(`Resumed ${pausedAgents.length} agents`);
      
    } catch (error) {
      console.error('Error resuming all agents:', error);
      throw error;
    }
  }

  // --- Get Agent Status Summary ---
  async getAgentStatusSummary(): Promise<Record<string, boolean>> {
    try {
      const flags = Array.from(agentFlagsStore.values());
      const summary: Record<string, boolean> = {};
      
      flags.forEach(flag => {
        summary[flag.agentName] = !flag.paused;
      });
      
      return summary;
      
    } catch (error) {
      console.error('Error getting agent status summary:', error);
      return {};
    }
  }
}

// --- Export Singleton Instance ---
export const agentControl = new AgentControl();

// --- Export Helper Functions ---
export const isAgentPaused = (agentName: string) => 
  agentControl.isAgentPaused(agentName);

export const throwIfPaused = (agentName: string) => 
  agentControl.throwIfPaused(agentName);

export const pauseAgent = (agentName: string, reason?: string, pausedBy?: string) => 
  agentControl.pauseAgent(agentName, reason, pausedBy);

export const resumeAgent = (agentName: string, resumedBy?: string) => 
  agentControl.resumeAgent(agentName, resumedBy); 
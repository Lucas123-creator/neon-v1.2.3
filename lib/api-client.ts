// Simple API client for development
// This will be replaced with real tRPC integration later

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Training endpoints
  async getAgentTrainingHistory(agentId: string, timeRange: string = 'month') {
    return this.request(`/api/training/history?agentId=${agentId}&timeRange=${timeRange}`);
  }

  async getAgents() {
    return this.request('/api/training/agents');
  }

  async createAgent(data: { name: string; type: string; description?: string }) {
    return this.request('/api/training/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assets endpoints
  async getAssets(params?: {
    agentId?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request(`/api/assets?${searchParams.toString()}`);
  }

  async createAsset(data: {
    type: string;
    title: string;
    content?: string;
    url?: string;
    agentId?: string;
    campaignId?: string;
    tags?: string[];
  }) {
    return this.request('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings endpoints
  async getSystemSettings(category?: string) {
    const url = category ? `/api/settings?category=${category}` : '/api/settings';
    return this.request(url);
  }

  async updateSetting(data: {
    key: string;
    value: string;
    type?: string;
    category?: string;
    description?: string;
  }) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Insights endpoints
  async getInsights(timeRange: string = 'month') {
    return this.request(`/api/insights?timeRange=${timeRange}`);
  }

  // Lab endpoints
  async getProductIdeas(params?: {
    category?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request(`/api/lab/ideas?${searchParams.toString()}`);
  }

  // Feedback endpoints
  async getFeedback(params?: {
    source?: string;
    type?: string;
    sentiment?: string;
    timeRange?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    return this.request(`/api/feedback?${searchParams.toString()}`);
  }

  async getFeedbackStats(timeRange: string = 'month') {
    return this.request(`/api/feedback/stats?timeRange=${timeRange}`);
  }
}

export const apiClient = new ApiClient(); 
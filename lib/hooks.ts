import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";
import { useToaster } from "../components/ui/toaster";

// Training hooks
export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.getAgents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAgentTrainingHistory(agentId: string, timeRange: string = "month") {
  return useQuery({
    queryKey: ["agent-training-history", agentId, timeRange],
    queryFn: () => apiClient.getAgentTrainingHistory(agentId, timeRange),
    enabled: !!agentId,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: (data: { name: string; type: string; description?: string }) =>
      apiClient.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      addToast({
        title: "Agent Created",
        description: "New agent has been created successfully",
        type: "success",
      });
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: "Failed to create agent",
        type: "error",
      });
    },
  });
}

// Assets hooks
export function useAssets(params?: {
  agentId?: string;
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => apiClient.getAssets(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: (data: {
      type: string;
      title: string;
      content?: string;
      url?: string;
      agentId?: string;
      campaignId?: string;
      tags?: string[];
    }) => apiClient.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      addToast({
        title: "Asset Created",
        description: "New asset has been created successfully",
        type: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to create asset",
        type: "error",
      });
    },
  });
}

// Settings hooks
export function useSystemSettings(category?: string) {
  return useQuery({
    queryKey: ["system-settings", category],
    queryFn: () => apiClient.getSystemSettings(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { addToast } = useToaster();

  return useMutation({
    mutationFn: (data: {
      key: string;
      value: string;
      type?: string;
      category?: string;
      description?: string;
    }) => apiClient.updateSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      addToast({
        title: "Setting Updated",
        description: "System setting has been updated successfully",
        type: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "Failed to update setting",
        type: "error",
      });
    },
  });
}

// Insights hooks
export function useInsights(timeRange: string = "month") {
  return useQuery({
    queryKey: ["insights", timeRange],
    queryFn: () => apiClient.getInsights(timeRange),
    staleTime: 5 * 60 * 1000,
  });
}

// Lab hooks
export function useProductIdeas(params?: {
  category?: string;
  status?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["product-ideas", params],
    queryFn: () => apiClient.getProductIdeas(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Feedback hooks
export function useFeedback(params?: {
  source?: string;
  type?: string;
  sentiment?: string;
  timeRange?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["feedback", params],
    queryFn: () => apiClient.getFeedback(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeedbackStats(timeRange: string = "month") {
  return useQuery({
    queryKey: ["feedback-stats", timeRange],
    queryFn: () => apiClient.getFeedbackStats(timeRange),
    staleTime: 5 * 60 * 1000,
  });
} 
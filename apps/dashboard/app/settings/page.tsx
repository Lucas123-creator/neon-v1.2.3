"use client";

import { useState } from "react";
import {
  Settings,
  Key,
  Zap,
  Shield,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@neon/ui";
import { api } from "../providers/trpc-provider";
import { FeatureToggle } from "../components/settings/FeatureToggle";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "ai_behavior" | "api_keys" | "features" | "limits"
  >("ai_behavior");
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState({
    key: "",
    value: "",
    description: "",
  });

  const { data: settings = {} } = api.settings.getSystemSettings.useQuery();
  const { data: featureFlags = [] } = api.settings.getFeatureFlags.useQuery();
  const { data: apiKeys = [] } = api.settings.listKeys.useQuery();
  const { data: aiBehavior } = api.settings.getAIBehaviorSettings.useQuery();

  const updateSetting = api.settings.updateSetting.useMutation();
  const updateAIBehavior = api.settings.updateAIBehaviorSettings.useMutation();
  const toggleFeature = api.settings.toggleFeatureFlag.useMutation();
  const setApiKey = api.settings.setApiKey.useMutation();
  const deleteSetting = api.settings.deleteSetting.useMutation();

  const [aiSettings, setAiSettings] = useState({
    temperature: aiBehavior?.temperature || 0.7,
    maxTokens: aiBehavior?.maxTokens || 1000,
    retryCount: aiBehavior?.retryCount || 3,
    fallbackThreshold: aiBehavior?.fallbackThreshold || 0.5,
    enableFallback: aiBehavior?.enableFallback || true,
  });

  const handleSaveAISettings = async () => {
    await updateAIBehavior.mutateAsync(aiSettings);
  };

  const handleToggleFeature = async (key: string, enabled: boolean) => {
    await toggleFeature.mutateAsync({ key, enabled });
  };

  const handleAddApiKey = async () => {
    if (newApiKey.key && newApiKey.value) {
      await setApiKey.mutateAsync(newApiKey);
      setNewApiKey({ key: "", value: "", description: "" });
    }
  };

  const tabs = [
    { id: "ai_behavior", label: "AI Behavior", icon: Zap },
    { id: "api_keys", label: "API Keys", icon: Key },
    { id: "features", label: "Features", icon: Settings },
    { id: "limits", label: "Limits", icon: Shield },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure AI behavior, manage API keys, and control system features
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "ai_behavior" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Behavior Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Temperature</label>
                  <span className="text-sm text-muted-foreground">
                    {aiSettings.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      temperature: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness in AI responses. Higher values = more
                  creative, lower values = more focused.
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="4000"
                  value={aiSettings.maxTokens}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      maxTokens: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens in AI responses.
                </p>
              </div>

              {/* Retry Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Retry Count</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={aiSettings.retryCount}
                  onChange={(e) =>
                    setAiSettings((prev) => ({
                      ...prev,
                      retryCount: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Number of times to retry failed AI requests.
                </p>
              </div>

              {/* Fallback Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">
                      Enable Fallback
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Use fallback agents when primary agents fail
                    </p>
                  </div>
                  <FeatureToggle
                    enabled={aiSettings.enableFallback}
                    onToggle={(enabled) =>
                      setAiSettings((prev) => ({
                        ...prev,
                        enableFallback: enabled,
                      }))
                    }
                  />
                </div>

                {aiSettings.enableFallback && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Fallback Threshold
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {aiSettings.fallbackThreshold}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.fallbackThreshold}
                      onChange={(e) =>
                        setAiSettings((prev) => ({
                          ...prev,
                          fallbackThreshold: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Quality threshold below which fallback agents are used.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAISettings}
                  disabled={updateAIBehavior.isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateAIBehavior.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "api_keys" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New API Key */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Add New API Key</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    placeholder="Key name (e.g., openai_api_key)"
                    value={newApiKey.key}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({ ...prev, key: e.target.value }))
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <input
                    type="password"
                    placeholder="API key value"
                    value={newApiKey.value}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={newApiKey.description}
                    onChange={(e) =>
                      setNewApiKey((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <Button
                  onClick={handleAddApiKey}
                  disabled={!newApiKey.key || !newApiKey.value}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </div>

              {/* Existing API Keys */}
              <div className="space-y-2">
                <h3 className="font-medium">Existing API Keys</h3>
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No API keys configured yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{key.key}</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          {key.description && (
                            <p className="text-sm text-muted-foreground">
                              {key.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Updated{" "}
                            {new Date(key.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowApiKeys((prev) => ({
                                ...prev,
                                [key.id]: !prev[key.id],
                              }))
                            }
                          >
                            {showApiKeys[key.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteSetting.mutate({ key: key.key })
                            }
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "features" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No feature flags configured.
                </p>
              ) : (
                featureFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{flag.key}</span>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">
                          {flag.description}
                        </p>
                      )}
                    </div>
                    <FeatureToggle
                      enabled={flag.enabled}
                      onToggle={(enabled) =>
                        handleToggleFeature(flag.key, enabled)
                      }
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "limits" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    System Limits
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Configure rate limits, resource usage limits, and other system
                  constraints here. This section will be populated with specific
                  limit controls as needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

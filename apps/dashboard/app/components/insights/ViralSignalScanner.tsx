"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Heart,
  MessageCircle,
  Share,
  Eye,
  TrendingUp,
  AlertTriangle,
  Radio,
  Sparkles,
} from "lucide-react";

interface ViralSignalScannerProps {
  signals: any[];
  platformStats: Record<
    string,
    {
      count: number;
      avgViralScore: number;
      totalEngagement: number;
    }
  >;
}

export function ViralSignalScanner({
  signals,
  platformStats,
}: ViralSignalScannerProps) {
  const [alertLevel, setAlertLevel] = useState<"low" | "medium" | "high">(
    "low",
  );
  const [scannerActive, setScannerActive] = useState(true);
  const [activeSignal, setActiveSignal] = useState(0);

  // Simulate scanner sweep
  useEffect(() => {
    if (!scannerActive || signals.length === 0) return;

    const interval = setInterval(() => {
      setActiveSignal((prev) => (prev + 1) % signals.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [signals.length, scannerActive]);

  // Determine alert level based on signals
  useEffect(() => {
    const highViralCount = signals.filter((s) => s.viralScore >= 85).length;
    if (highViralCount >= 3) setAlertLevel("high");
    else if (highViralCount >= 1) setAlertLevel("medium");
    else setAlertLevel("low");
  }, [signals]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "🎵";
      case "instagram":
        return "📸";
      case "twitter":
        return "🐦";
      case "youtube":
        return "📹";
      case "facebook":
        return "👥";
      default:
        return "📱";
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 85) return "text-red-500 bg-red-50 border-red-200";
    if (score >= 70) return "text-orange-500 bg-orange-50 border-orange-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-blue-500 bg-blue-50 border-blue-200";
  };

  const getAlertClass = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500 text-white animate-pulse";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const topSignals = signals
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Scanner Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getAlertClass(alertLevel)}`}>
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">Viral Scanner</div>
            <div className="text-xs text-muted-foreground">
              Scanning {Object.keys(platformStats).length} platforms
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScannerActive(!scannerActive)}
            className={`text-xs px-3 py-1 rounded-full ${
              scannerActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {scannerActive ? "SCANNING" : "PAUSED"}
          </button>
          <div
            className={`w-2 h-2 rounded-full ${
              scannerActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Alert Banner */}
      {alertLevel === "high" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <div className="font-semibold text-red-800">
                High Viral Activity Detected!
              </div>
              <div className="text-sm text-red-700">
                Multiple signals showing strong viral potential. Consider
                immediate engagement.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(platformStats).map(([platform, stats]) => (
          <div key={platform} className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getPlatformIcon(platform)}</span>
              <span className="font-medium capitalize">{platform}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signals:</span>
                <span className="font-medium">{stats.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Score:</span>
                <span className="font-medium">
                  {stats.avgViralScore.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engagement:</span>
                <span className="font-medium">
                  {(stats.totalEngagement / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Signal Feed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="font-medium">Live Viral Signals</span>
          <div className="h-px bg-gradient-to-r from-purple-500 to-transparent flex-1" />
        </div>

        {topSignals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No viral signals detected</p>
            <p className="text-sm">
              Scanner will alert when content goes viral
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topSignals.map((signal, index) => {
              const isActive = scannerActive && index === activeSignal;
              const viralScoreClass = getViralScoreColor(signal.viralScore);

              return (
                <div
                  key={signal.id}
                  className={`p-4 border rounded-lg transition-all duration-300 ${
                    isActive
                      ? "border-purple-300 bg-purple-50 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getPlatformIcon(signal.platform)}
                        </span>
                        <span className="font-medium">{signal.platform}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {signal.type}
                        </span>
                        {isActive && (
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-ping" />
                            <span className="text-xs text-purple-600 font-medium">
                              SCANNING
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="font-medium text-sm mb-1">
                          {signal.content}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{signal.engagement.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{signal.velocity.toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>

                      {/* Engagement Visualization */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span>
                            {Math.floor(
                              signal.engagement * 0.6,
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          <span>
                            {Math.floor(
                              signal.engagement * 0.2,
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share className="h-3 w-3 text-green-400" />
                          <span>
                            {Math.floor(
                              signal.engagement * 0.2,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div
                        className={`px-3 py-2 rounded-lg border ${viralScoreClass}`}
                      >
                        <div className="font-bold text-lg">
                          {signal.viralScore.toFixed(0)}
                        </div>
                        <div className="text-xs opacity-80">VIRAL</div>
                      </div>

                      {signal.viralScore >= 85 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <Zap className="h-3 w-3" />
                            <span>URGENT</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Viral Score */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${signal.viralScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scanner Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {signals.filter((s) => s.viralScore >= 85).length}
          </div>
          <div className="text-xs text-red-700">Critical Alerts</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {
              signals.filter((s) => s.viralScore >= 70 && s.viralScore < 85)
                .length
            }
          </div>
          <div className="text-xs text-orange-700">High Potential</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {
              signals.filter((s) => s.viralScore >= 50 && s.viralScore < 70)
                .length
            }
          </div>
          <div className="text-xs text-yellow-700">Trending</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {signals.reduce((sum, s) => sum + s.engagement, 0).toLocaleString()}
          </div>
          <div className="text-xs text-blue-700">Total Engagement</div>
        </div>
      </div>

      {/* Scanner Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div
          className={`w-2 h-2 rounded-full ${scannerActive ? "bg-purple-500 animate-pulse" : "bg-gray-400"}`}
        />
        <span>
          Scanner {scannerActive ? "active" : "paused"} • Next sweep:{" "}
          {new Date(Date.now() + 1500).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

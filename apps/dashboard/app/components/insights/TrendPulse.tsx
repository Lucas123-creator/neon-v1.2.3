"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Zap, Fire } from "lucide-react";

interface TrendPulseProps {
  trends: any[];
  analytics?: {
    totalTrends: number;
    avgScore: number;
    topRegions: string[];
    topCategories: string[];
    growthTrends: number;
  };
}

export function TrendPulse({ trends, analytics }: TrendPulseProps) {
  const [pulseIndex, setPulseIndex] = useState(0);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time pulse effect
  useEffect(() => {
    if (!isLive || trends.length === 0) return;

    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % trends.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [trends.length, isLive]);

  const getTrendIntensity = (score: number) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  const getTrendIcon = (score: number, growth: number) => {
    if (score >= 90) return <Fire className="h-4 w-4 text-red-500" />;
    if (score >= 70) return <Zap className="h-4 w-4 text-orange-500" />;
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getIntensityClass = (intensity: string, isActive: boolean) => {
    const baseClass = "transition-all duration-500";
    if (!isActive) return `${baseClass} opacity-50 scale-95`;

    switch (intensity) {
      case "high":
        return `${baseClass} bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 animate-pulse`;
      case "medium":
        return `${baseClass} bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25`;
      case "low":
        return `${baseClass} bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25`;
      default:
        return `${baseClass} bg-gray-200 text-gray-700`;
    }
  };

  const topTrends = trends.sort((a, b) => b.score - a.score).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Pulse Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity
            className={`h-4 w-4 ${isLive ? "text-green-500" : "text-gray-400"}`}
          />
          <span className="text-sm font-medium">Trend Pulse</span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-2 py-1 rounded ${
              isLive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isLive ? "LIVE" : "PAUSED"}
          </button>
        </div>
        {analytics && (
          <div className="text-xs text-muted-foreground">
            {analytics.totalTrends} trends • Avg:{" "}
            {analytics.avgScore.toFixed(0)}
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Top Regions</div>
            <div className="flex flex-wrap gap-1">
              {analytics.topRegions.slice(0, 3).map((region) => (
                <span
                  key={region}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Hot Categories</div>
            <div className="flex flex-wrap gap-1">
              {analytics.topCategories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trend Pulse Grid */}
      {topTrends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No trends detected</p>
          <p className="text-sm">Pulse will activate when trends are found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {topTrends.map((trend, index) => {
            const intensity = getTrendIntensity(trend.score);
            const isActive = isLive && index === pulseIndex;

            return (
              <div
                key={trend.id}
                className={`p-4 rounded-lg border ${getIntensityClass(intensity, isActive)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(trend.score, trend.growth)}
                    <div>
                      <div className="font-medium">{trend.keyword}</div>
                      <div className="text-sm opacity-80">
                        {trend.region} • {trend.category}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {trend.score.toFixed(0)}
                    </div>
                    <div
                      className={`text-sm ${
                        trend.growth > 0
                          ? "text-green-200"
                          : trend.growth < 0
                            ? "text-red-200"
                            : "text-gray-200"
                      }`}
                    >
                      {trend.growth > 0 ? "+" : ""}
                      {trend.growth.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Pulse Wave Effect */}
                {isActive && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs opacity-80">
                      <span>
                        Volume: {trend.volume?.toLocaleString() || "N/A"}
                      </span>
                      <span>
                        Velocity:{" "}
                        {((trend.score / 100) * trend.growth).toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full animate-pulse"
                        style={{ width: `${Math.min(100, trend.score)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Intensity Indicator */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      intensity === "high"
                        ? "bg-red-300 animate-ping"
                        : intensity === "medium"
                          ? "bg-orange-300"
                          : "bg-blue-300"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pulse Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {topTrends.filter((t) => t.score >= 80).length}
          </div>
          <div className="text-xs text-red-700">High Intensity</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {topTrends.filter((t) => t.score >= 60 && t.score < 80).length}
          </div>
          <div className="text-xs text-orange-700">Medium Intensity</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {topTrends.filter((t) => t.score < 60).length}
          </div>
          <div className="text-xs text-blue-700">Emerging</div>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div
          className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
        />
        <span>
          {isLive ? "Live pulse monitoring" : "Pulse paused"} • Next update:{" "}
          {(() => {
            const dateObj = new Date(Date.now() + 2000);
            return dateObj.toLocaleTimeString("en-US");
          })()}
        </span>
      </div>
    </div>
  );
}

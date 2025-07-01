"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketHeatmapProps {
  trends: any[];
  timeRange: string;
  selectedRegion: string;
}

export function MarketHeatmap({
  trends,
  timeRange,
  selectedRegion,
}: MarketHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Group trends by region and category
    const regionData = trends.reduce((acc: any, trend) => {
      if (!acc[trend.region]) {
        acc[trend.region] = {
          totalScore: 0,
          trends: [],
          avgGrowth: 0,
          categories: new Set(),
        };
      }

      acc[trend.region].totalScore += trend.score;
      acc[trend.region].trends.push(trend);
      acc[trend.region].avgGrowth += trend.growth;
      acc[trend.region].categories.add(trend.category);

      return acc;
    }, {});

    // Calculate averages and prepare for visualization
    return Object.entries(regionData).map(([region, data]: [string, any]) => ({
      region,
      avgScore: data.totalScore / data.trends.length,
      avgGrowth: data.avgGrowth / data.trends.length,
      trendCount: data.trends.length,
      categories: Array.from(data.categories),
      intensity: Math.min(100, data.totalScore / data.trends.length || 0),
    }));
  }, [trends]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 80) return "bg-red-500 text-white";
    if (intensity >= 60) return "bg-orange-500 text-white";
    if (intensity >= 40) return "bg-yellow-500 text-black";
    if (intensity >= 20) return "bg-blue-500 text-white";
    return "bg-gray-300 text-gray-700";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const maxScore = Math.max(...heatmapData.map((d) => d.avgScore), 1);

  return (
    <div className="space-y-6">
      {/* Heatmap Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Intensity Scale:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-xs">Low</span>
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs">High</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {trends.length} trends across {heatmapData.length} regions
        </div>
      </div>

      {/* Global Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {heatmapData.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 opacity-50" />
            </div>
            <p>No trend data available</p>
            <p className="text-sm">Data will appear as trends are detected</p>
          </div>
        ) : (
          heatmapData.map((data) => (
            <div
              key={data.region}
              className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer ${getHeatmapColor(data.intensity)}`}
              style={{
                boxShadow:
                  data.region === selectedRegion ? "0 0 0 2px #3b82f6" : "none",
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{data.region}</span>
                  {getGrowthIcon(data.avgGrowth)}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Score:</span>
                    <span className="font-semibold">
                      {data.avgScore.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Growth:</span>
                    <span
                      className={`font-semibold ${data.avgGrowth > 0 ? "text-green-200" : data.avgGrowth < 0 ? "text-red-200" : "text-gray-200"}`}
                    >
                      {data.avgGrowth > 0 ? "+" : ""}
                      {data.avgGrowth.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">Trends:</span>
                    <span className="font-semibold">{data.trendCount}</span>
                  </div>
                </div>

                {/* Progress bar for relative intensity */}
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${(data.avgScore / maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Top categories */}
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {data.categories.slice(0, 2).map((category: string) => (
                      <span
                        key={category}
                        className="text-xs px-2 py-1 bg-white/20 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                    {data.categories.length > 2 && (
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                        +{data.categories.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Trend List for Selected Region */}
      {selectedRegion !== "all" && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends in {selectedRegion}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends
              .filter((trend) => trend.region === selectedRegion)
              .slice(0, 6)
              .map((trend) => (
                <div key={trend.id} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{trend.keyword}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {trend.score.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trend.category} • Volume: {trend.volume.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(trend.growth)}
                    <span className="text-xs">
                      {trend.growth > 0 ? "+" : ""}
                      {trend.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Real-time Update Indicator */}
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            Live data • Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

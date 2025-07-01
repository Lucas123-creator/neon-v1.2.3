"use client";

import { useState } from "react";
import {
  Globe,
  TrendingUp,
  Zap,
  Target,
  Activity,
  MapPin,
  Eye,
  Filter,
  RefreshCw,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@neon/ui";
import { api } from "../providers/trpc-provider";
import { MarketHeatmap } from "../components/insights/MarketHeatmap";
import { TrendPulse } from "../components/insights/TrendPulse";
import { ViralSignalScanner } from "../components/insights/ViralSignalScanner";

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "24h",
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Data fetching hooks
  const { data: dashboardData, refetch: refetchDashboard } =
    api.insights.getDashboardInsights.useQuery({
      timeRange,
    });

  const { data: trendsData } = api.insights.getMarketTrends.useQuery({
    region: selectedRegion === "all" ? undefined : selectedRegion,
    timeRange,
    limit: 20,
    minScore: 50,
  });

  const { data: signalsData } = api.insights.getPlatformSignals.useQuery({
    timeRange: timeRange === "30d" ? "7d" : timeRange,
    minViralScore: 60,
    limit: 15,
  });

  const { data: hotspotsData } = api.insights.getConversionHotspots.useQuery({
    region: selectedRegion === "all" ? undefined : selectedRegion,
    minRoiScore: 70,
    minBuyerIntent: 60,
    limit: 10,
  });

  const handleRefresh = () => {
    refetchDashboard();
  };

  const regions = ["all", "US", "EU", "APAC", "LATAM", "MENA"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            AI Market Pulse Panel
          </h1>
          <p className="text-muted-foreground">
            Real-time global insights, trends, and viral signals for optimal
            market timing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Activity
              className={`h-4 w-4 ${autoRefresh ? "text-green-500" : "text-gray-400"}`}
            />
            <span className="text-sm text-muted-foreground">
              {autoRefresh ? "Live" : "Paused"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === "all" ? "Global" : region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.summary.topTrends || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High-score trends detected
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Viral Alerts</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData?.summary.viralAlerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Content going viral</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hot Regions</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.summary.highValueRegions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High-ROI opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Market Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {trendsData?.analytics.avgScore.toFixed(0) || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average trend strength
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Global Market Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarketHeatmap
              trends={trendsData?.trends || []}
              timeRange={timeRange}
              selectedRegion={selectedRegion}
            />
          </CardContent>
        </Card>

        {/* Trend Pulse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Real-Time Trend Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendPulse
              trends={trendsData?.trends || []}
              analytics={trendsData?.analytics}
            />
          </CardContent>
        </Card>

        {/* Viral Signal Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Viral Signal Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ViralSignalScanner
              signals={signalsData?.signals || []}
              platformStats={signalsData?.platformStats || {}}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Conversion Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            Conversion Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hotspotsData?.hotspots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No high-ROI hotspots detected in the current timeframe.</p>
              <p className="text-sm">
                Try adjusting your filters or time range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotspotsData?.hotspots.map((hotspot: any) => (
                <div
                  key={hotspot.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{hotspot.region}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">
                        {hotspot.roiScore.toFixed(0)}% ROI
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Demo: {hotspot.demographic}</div>
                    <div>Interest: {hotspot.interest}</div>
                    <div>Intent: {hotspot.buyerIntent.toFixed(0)}%</div>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

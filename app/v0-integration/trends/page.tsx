import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MapPin
} from "lucide-react";

// Mock data for development
const mockData = {
  trends: [
    {
      id: 1,
      keyword: "neon signs",
      platform: "Google",
      score: 85,
      volume: 45000,
      growth: 23.5,
      trend: "up",
      category: "home decor",
      opportunity: "high",
    },
    {
      id: 2,
      keyword: "led displays",
      platform: "TikTok",
      score: 92,
      volume: 125000,
      growth: 67.2,
      trend: "up",
      category: "technology",
      opportunity: "very high",
    },
    {
      id: 3,
      keyword: "custom neon",
      platform: "Instagram",
      score: 78,
      volume: 28000,
      growth: 15.8,
      trend: "up",
      category: "art",
      opportunity: "medium",
    },
    {
      id: 4,
      keyword: "neon lights",
      platform: "Pinterest",
      score: 65,
      volume: 89000,
      growth: -5.2,
      trend: "down",
      category: "home decor",
      opportunity: "low",
    },
  ],
  viralContent: [
    {
      id: 1,
      title: "Neon Sign DIY Tutorial",
      platform: "TikTok",
      views: "2.4M",
      engagement: 8.7,
      viralScore: 94,
      category: "tutorial",
      trending: true,
    },
    {
      id: 2,
      title: "Custom Neon Room Setup",
      platform: "Instagram",
      views: "890K",
      engagement: 6.2,
      viralScore: 87,
      category: "lifestyle",
      trending: true,
    },
    {
      id: 3,
      title: "Neon Sign Business Ideas",
      platform: "YouTube",
      views: "156K",
      engagement: 4.8,
      viralScore: 72,
      category: "business",
      trending: false,
    },
  ],
  marketInsights: {
    topRegions: [
      { region: "United States", score: 92, growth: 15.2 },
      { region: "United Kingdom", score: 87, growth: 12.8 },
      { region: "Canada", score: 84, growth: 18.5 },
      { region: "Australia", score: 79, growth: 22.1 },
    ],
    demographics: [
      { age: "18-24", interest: 78, growth: 25.3 },
      { age: "25-34", interest: 85, growth: 18.7 },
      { age: "35-44", interest: 72, growth: 12.4 },
      { age: "45+", interest: 65, growth: 8.9 },
    ],
  },
  predictions: [
    {
      id: 1,
      prediction: "Neon sign demand will increase 35% in Q3",
      confidence: 87,
      timeframe: "3 months",
      impact: "high",
    },
    {
      id: 2,
      prediction: "Custom neon market to reach $2.1B by 2025",
      confidence: 92,
      timeframe: "12 months",
      impact: "very high",
    },
    {
      id: 3,
      prediction: "LED display adoption in retail to spike",
      confidence: 78,
      timeframe: "6 months",
      impact: "medium",
    },
  ],
};

function TrendCard({ trend }: any) {
  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "very high": return "bg-green-500";
      case "high": return "bg-blue-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{trend.keyword}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{trend.platform}</Badge>
              <Badge variant="outline">{trend.category}</Badge>
            </CardDescription>
          </div>
          {getTrendIcon(trend.trend)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Trend Score</span>
            <span className="font-medium">{trend.score}/100</span>
          </div>
          <Progress value={trend.score} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Volume</span>
              <p className="font-medium">{trend.volume.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Growth</span>
              <p className={`font-medium ${trend.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend.growth > 0 ? '+' : ''}{trend.growth}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Opportunity</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getOpportunityColor(trend.opportunity)}`} />
              <span className="text-sm font-medium capitalize">{trend.opportunity}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button size="sm" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Target
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ViralContentCard({ content }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{content.title}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{content.platform}</Badge>
              <Badge variant="outline">{content.category}</Badge>
            </CardDescription>
          </div>
          {content.trending && (
            <Badge variant="default" className="bg-orange-500">
              Trending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Views</span>
              <p className="font-medium">{content.views}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Engagement</span>
              <p className="font-medium">{content.engagement}%</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Viral Score</span>
              <span>{content.viralScore}/100</span>
            </div>
            <Progress value={content.viralScore} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trend Radar</h1>
          <p className="text-muted-foreground">
            Real-time market intelligence and trend analysis.
          </p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+8 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Content</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Opportunity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1B</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="viral">Viral Content</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="viral" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.viralContent.map((content) => (
              <ViralContentCard key={content.id} content={content} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Top Regions
                </CardTitle>
                <CardDescription>
                  Geographic performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.marketInsights.topRegions.map((region, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {region.region}
                        </span>
                        <span>{region.score}/100</span>
                      </div>
                      <Progress value={region.score} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        +{region.growth}% growth
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Demographics
                </CardTitle>
                <CardDescription>
                  Age group interest analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.marketInsights.demographics.map((demo, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{demo.age}</span>
                        <span>{demo.interest}%</span>
                      </div>
                      <Progress value={demo.interest} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        +{demo.growth}% growth
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{prediction.prediction}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Timeframe</span>
                        <p className="font-medium">{prediction.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impact</span>
                        <p className="font-medium capitalize">{prediction.impact}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
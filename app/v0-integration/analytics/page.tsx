import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  Globe,
  Calendar,
  Download,
  Filter
} from "lucide-react";

// Mock data for development
const mockData = {
  overview: {
    revenue: { value: "$124,567", change: "+12.5%", trend: "up" },
    conversions: { value: "2,847", change: "+8.2%", trend: "up" },
    visitors: { value: "45.2K", change: "+15.3%", trend: "up" },
    avgOrder: { value: "$87.45", change: "-2.1%", trend: "down" },
  },
  topPerformers: [
    {
      id: 1,
      name: "Summer Sale Campaign",
      type: "email",
      revenue: "$23,456",
      conversions: 234,
      roi: 3.2,
      status: "active",
    },
    {
      id: 2,
      name: "Instagram Ads",
      type: "social",
      revenue: "$18,234",
      conversions: 156,
      roi: 2.8,
      status: "active",
    },
    {
      id: 3,
      name: "Google Search",
      type: "ppc",
      revenue: "$15,678",
      conversions: 89,
      roi: 2.1,
      status: "active",
    },
  ],
  conversionFunnel: [
    { stage: "Visitors", count: 45200, rate: 100 },
    { stage: "Product Views", count: 15820, rate: 35 },
    { stage: "Add to Cart", count: 3164, rate: 7 },
    { stage: "Checkout", count: 2847, rate: 6.3 },
    { stage: "Purchase", count: 2562, rate: 5.7 },
  ],
  geographicData: [
    { region: "United States", revenue: "$67,234", visitors: "23.4K", conversion: 6.2 },
    { region: "United Kingdom", revenue: "$23,456", visitors: "8.9K", conversion: 5.8 },
    { region: "Canada", revenue: "$18,567", visitors: "6.7K", conversion: 5.4 },
    { region: "Australia", revenue: "$15,310", visitors: "6.2K", conversion: 4.9 },
  ],
  timeSeriesData: [
    { date: "Mon", revenue: 12500, visitors: 3200, conversions: 45 },
    { date: "Tue", revenue: 13800, visitors: 3400, conversions: 52 },
    { date: "Wed", revenue: 15200, visitors: 3800, conversions: 58 },
    { date: "Thu", revenue: 14100, visitors: 3600, conversions: 49 },
    { date: "Fri", revenue: 16800, visitors: 4200, conversions: 67 },
    { date: "Sat", revenue: 18900, visitors: 4800, conversions: 78 },
    { date: "Sun", revenue: 17200, visitors: 4400, conversions: 71 },
  ],
};

function MetricCard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
          )}
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

function TopPerformerCard({ performer }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{performer.name}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{performer.type}</Badge>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Revenue</span>
              <p className="font-medium">{performer.revenue}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Conversions</span>
              <p className="font-medium">{performer.conversions}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>ROI</span>
              <span>{performer.roi}x</span>
            </div>
            <Progress value={performer.roi * 25} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionFunnel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Customer journey from visit to purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockData.conversionFunnel.map((stage, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span>{stage.stage}</span>
                <span>{stage.count.toLocaleString()}</span>
              </div>
              <Progress value={stage.rate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stage.rate}% conversion rate
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GeographicPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Geographic Performance
        </CardTitle>
        <CardDescription>
          Revenue and performance by region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockData.geographicData.map((region, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{region.region}</p>
                <p className="text-sm text-muted-foreground">{region.visitors} visitors</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{region.revenue}</p>
                <p className="text-sm text-muted-foreground">{region.conversion}% conversion</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimeSeriesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance</CardTitle>
        <CardDescription>
          Revenue, visitors, and conversions over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockData.timeSeriesData.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="font-medium w-12">{day.date}</span>
                <div className="text-sm">
                  <span className="text-muted-foreground">Revenue: </span>
                  <span className="font-medium">${day.revenue.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Visitors: </span>
                  <span className="font-medium">{day.visitors.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Conversions: </span>
                  <span className="font-medium">{day.conversions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance insights and data analysis.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={mockData.overview.revenue.value}
          change={mockData.overview.revenue.change}
          trend={mockData.overview.revenue.trend}
          icon={DollarSign}
        />
        <MetricCard
          title="Conversions"
          value={mockData.overview.conversions.value}
          change={mockData.overview.conversions.change}
          trend={mockData.overview.conversions.trend}
          icon={Target}
        />
        <MetricCard
          title="Visitors"
          value={mockData.overview.visitors.value}
          change={mockData.overview.visitors.change}
          trend={mockData.overview.visitors.trend}
          icon={Users}
        />
        <MetricCard
          title="Avg Order Value"
          value={mockData.overview.avgOrder.value}
          change={mockData.overview.avgOrder.change}
          trend={mockData.overview.avgOrder.trend}
          icon={ShoppingCart}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ConversionFunnel />
            <GeographicPerformance />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.topPerformers.map((performer) => (
              <TopPerformerCard key={performer.id} performer={performer} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <ConversionFunnel />
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <GeographicPerformance />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TimeSeriesChart />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
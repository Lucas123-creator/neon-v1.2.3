"use client";

import { useState } from "react";
import {
  MessageSquare,
  TrendingUp,
  Brain,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@neon/ui";
import { api } from "../providers/trpc-provider";
import { FeedbackList } from "../components/feedback/FeedbackList";
import { SentimentGraph } from "../components/feedback/SentimentGraph";
import { ResponseImprover } from "../components/feedback/ResponseImprover";

export default function FeedbackPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "24h" | "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [showProcessedOnly, setShowProcessedOnly] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  // Data fetching
  const { data: feedbackData, refetch: refetchFeedback } =
    api.feedback.getFeedback.useQuery({
      source: selectedSource === "all" ? undefined : (selectedSource as any),
      sentiment:
        selectedSentiment === "all" ? undefined : (selectedSentiment as any),
      processed: showProcessedOnly ? true : undefined,
      timeRange: selectedTimeRange,
      limit: 20,
    });

  const { data: sentimentTrends } = api.feedback.getSentimentTrends.useQuery({
    timeRange: selectedTimeRange === "24h" ? "week" : selectedTimeRange,
    groupBy: selectedTimeRange === "year" ? "month" : "day",
  });

  const { data: feedbackStats } = api.feedback.getFeedbackStats.useQuery({
    timeRange: selectedTimeRange,
  });

  const markProcessedMutation = api.feedback.markAsProcessed.useMutation();
  const markRespondedMutation = api.feedback.markAsResponded.useMutation();

  const sources = ["all", "website", "email", "social", "support"];
  const sentiments = ["all", "positive", "negative", "neutral"];

  const handleMarkProcessed = async (
    feedbackId: string,
    processed: boolean,
  ) => {
    try {
      await markProcessedMutation.mutateAsync({ feedbackId, processed });
      refetchFeedback();
    } catch (error) {
      console.error("Failed to update feedback:", error);
    }
  };

  const handleMarkResponded = async (
    feedbackId: string,
    responded: boolean,
  ) => {
    try {
      await markRespondedMutation.mutateAsync({ feedbackId, responded });
      refetchFeedback();
    } catch (error) {
      console.error("Failed to update feedback:", error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Feedback & Sentiment Intelligence
          </h1>
          <p className="text-muted-foreground">
            Transform user feedback into actionable insights with AI-powered
            sentiment analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchFeedback()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {feedbackStats?.totalFeedback || 0}
            </div>
            <p className="text-xs text-muted-foreground">All sources</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {feedbackStats?.processedPercentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {feedbackStats?.processedFeedback || 0} items
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Heart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {feedbackStats?.responseRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {feedbackStats?.urgentFeedback || 0}
            </div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Negative</CardTitle>
            <span className="text-lg">😞</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {feedbackStats?.sentimentCounts?.find(
                (s: any) => s.sentiment === "negative",
              )?._count?.sentiment || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <span className="text-lg">😊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {feedbackStats?.sentimentCounts?.find(
                (s: any) => s.sentiment === "positive",
              )?._count?.sentiment || 0}
            </div>
            <p className="text-xs text-muted-foreground">Happy customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      {feedbackStats?.sourceCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Feedback Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {feedbackStats.sourceCounts.map((source: any) => (
                <div
                  key={source.source}
                  className="text-center p-3 bg-muted/30 rounded-lg"
                >
                  <div className="text-2xl font-bold text-blue-600">
                    {source._count.source}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {source.source}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Time:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="24h">Last 24h</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === "all"
                    ? "All Sources"
                    : source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sentiment:</span>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {sentiments.map((sentiment) => (
                <option key={sentiment} value={sentiment}>
                  {sentiment === "all"
                    ? "All Sentiments"
                    : `${getSentimentIcon(sentiment)} ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showProcessedOnly}
              onChange={(e) => setShowProcessedOnly(e.target.checked)}
              className="rounded"
            />
            Processed only
          </label>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Sentiment Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentGraph
              trends={sentimentTrends?.trends || []}
              summary={sentimentTrends?.summary}
              timeRange={selectedTimeRange}
            />
          </CardContent>
        </Card>

        {/* AI Response Improver */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Response Improver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseImprover
              selectedFeedback={selectedFeedback}
              onFeedbackSelect={setSelectedFeedback}
            />
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Feedback Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackList
            feedback={feedbackData?.feedback || []}
            onMarkProcessed={handleMarkProcessed}
            onMarkResponded={handleMarkResponded}
            onSelectFeedback={setSelectedFeedback}
            selectedFeedback={selectedFeedback}
          />
        </CardContent>
      </Card>

      {/* AI Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                🔍 Key Issues
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Shipping delays mentioned 23 times</li>
                <li>• Website performance concerns</li>
                <li>• Payment processing issues</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                💡 Opportunities
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Customers love new neon designs</li>
                <li>• Demand for custom options rising</li>
                <li>• Mobile app requests increasing</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">
                🎯 Recommendations
              </h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Prioritize shipping improvements</li>
                <li>• Create custom design portal</li>
                <li>• Develop mobile application</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

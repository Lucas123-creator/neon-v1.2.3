"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface SentimentGraphProps {
  trends: any[];
  summary?: {
    totalFeedback: number;
    averageSentiment: number;
  };
  timeRange: string;
}

export function SentimentGraph({
  trends,
  summary,
  timeRange,
}: SentimentGraphProps) {
  const chartData = useMemo(() => {
    return trends.map((trend) => ({
      ...trend,
      positiveHeight: Math.max(5, trend.positivePercentage),
      negativeHeight: Math.max(5, trend.negativePercentage),
      neutralHeight: Math.max(5, trend.neutralPercentage),
    }));
  }, [trends]);

  const getTimeLabel = (date: string) => {
    if (timeRange === "year") {
      return new Date(date).toLocaleDateString("en-US", { month: "short" });
    }
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSentimentTrend = () => {
    if (trends.length < 2) return "stable";

    const recent = trends.slice(-3);
    const earlier = trends.slice(-6, -3);

    if (recent.length === 0 || earlier.length === 0) return "stable";

    const recentAvg =
      recent.reduce((sum, t) => sum + t.positivePercentage, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, t) => sum + t.positivePercentage, 0) /
      earlier.length;

    if (recentAvg > earlierAvg + 5) return "improving";
    if (recentAvg < earlierAvg - 5) return "declining";
    return "stable";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "declining":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const sentimentTrend = getSentimentTrend();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalFeedback}
            </div>
            <div className="text-sm text-blue-700">Total Feedback</div>
          </div>

          <div
            className={`text-center p-4 border rounded-lg ${getTrendColor(sentimentTrend)}`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {getTrendIcon(sentimentTrend)}
              <span className="text-sm font-medium capitalize">
                {sentimentTrend}
              </span>
            </div>
            <div className="text-xs opacity-80">Overall Trend</div>
          </div>
        </div>
      )}

      {/* Chart Area */}
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No sentiment data</h3>
          <p>Sentiment trends will appear as feedback is analyzed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>😊 Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>😞 Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>😐 Neutral</span>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="relative">
            <div className="flex items-end justify-between gap-2 h-64 p-4 bg-gray-50 rounded-lg">
              {chartData.map((data, index) => (
                <div
                  key={data.date}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Bar Stack */}
                  <div className="relative w-full max-w-8 h-48 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Positive */}
                    <div
                      className="w-full bg-green-500 transition-all duration-500 hover:bg-green-600"
                      style={{
                        height: `${data.positiveHeight * 0.48}%`,
                        marginTop: "auto",
                      }}
                      title={`Positive: ${data.positive} (${data.positivePercentage}%)`}
                    />

                    {/* Neutral */}
                    <div
                      className="w-full bg-gray-400 transition-all duration-500 hover:bg-gray-500"
                      style={{
                        height: `${data.neutralHeight * 0.48}%`,
                      }}
                      title={`Neutral: ${data.neutral} (${data.neutralPercentage}%)`}
                    />

                    {/* Negative */}
                    <div
                      className="w-full bg-red-500 transition-all duration-500 hover:bg-red-600"
                      style={{
                        height: `${data.negativeHeight * 0.48}%`,
                      }}
                      title={`Negative: ${data.negative} (${data.negativePercentage}%)`}
                    />
                  </div>

                  {/* Label */}
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {getTimeLabel(data.date)}
                  </div>

                  {/* Total Count */}
                  <div className="text-xs font-medium text-gray-700">
                    {data.total}
                  </div>
                </div>
              ))}
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-muted-foreground py-4">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>

          {/* Detailed Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-center py-2 px-3">😊 Positive</th>
                  <th className="text-center py-2 px-3">😐 Neutral</th>
                  <th className="text-center py-2 px-3">😞 Negative</th>
                  <th className="text-center py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(-7).map((data) => (
                  <tr key={data.date} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">
                      {getTimeLabel(data.date)}
                    </td>
                    <td className="text-center py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-green-600">
                          {data.positive}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({data.positivePercentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-gray-600">
                          {data.neutral}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({data.neutralPercentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-red-600">
                          {data.negative}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({data.negativePercentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-3 font-bold">
                      {data.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Emoji Sentiment Bars */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">Latest Period Breakdown</h4>

            {chartData.length > 0 &&
              (() => {
                const latest = chartData[chartData.length - 1];
                return (
                  <div className="space-y-2">
                    {/* Positive */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😊</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-700 relative"
                          style={{ width: `${latest.positivePercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-green-400 animate-pulse opacity-50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {latest.positive} ({latest.positivePercentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Neutral */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-gray-400 h-full rounded-full transition-all duration-700 relative"
                          style={{ width: `${latest.neutralPercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gray-300 animate-pulse opacity-50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {latest.neutral} ({latest.neutralPercentage}%)
                        </div>
                      </div>
                    </div>

                    {/* Negative */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😞</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-700 relative"
                          style={{ width: `${latest.negativePercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-red-400 animate-pulse opacity-50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {latest.negative} ({latest.negativePercentage}%)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="font-medium text-green-800 mb-1">🌟 Best Day</h5>
          <div className="text-sm text-green-700">
            {chartData.length > 0
              ? (() => {
                  const bestDay = chartData.reduce((best, day) =>
                    day.positivePercentage > best.positivePercentage
                      ? day
                      : best,
                  );
                  return `${getTimeLabel(bestDay.date)} (${bestDay.positivePercentage}% positive)`;
                })()
              : "No data"}
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-1">📊 Average</h5>
          <div className="text-sm text-blue-700">
            {chartData.length > 0
              ? (() => {
                  const avgPositive =
                    chartData.reduce(
                      (sum, day) => sum + day.positivePercentage,
                      0,
                    ) / chartData.length;
                  return `${avgPositive.toFixed(0)}% positive sentiment`;
                })()
              : "No data"}
          </div>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <h5 className="font-medium text-purple-800 mb-1">🎯 Goal</h5>
          <div className="text-sm text-purple-700">
            Target: 80% positive sentiment
          </div>
        </div>
      </div>
    </div>
  );
}

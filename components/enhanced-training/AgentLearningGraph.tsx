"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RouterOutputs } from "@neon/api";

type TrainingData = RouterOutputs["training"]["getAgentTrainingHistory"];

interface AgentLearningGraphProps {
  data: TrainingData;
}

export function AgentLearningGraph({ data }: AgentLearningGraphProps) {
  if (!data.graphData || data.graphData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No performance data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {data.metrics.currentScore.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Current Score</p>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${data.metrics.totalChange >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {data.metrics.totalChange >= 0 ? "+" : ""}
            {data.metrics.totalChange.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total Change</p>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${data.metrics.changePercentage >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {data.metrics.changePercentage >= 0 ? "+" : ""}
            {data.metrics.changePercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Change %</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.graphData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: any) => {
                const dateObj = new Date(value);
                return dateObj.toLocaleDateString("en-US");
              }}
            />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
            <Tooltip
              labelFormatter={(value: any) => {
                const dateObj = new Date(value);
                return dateObj.toLocaleDateString("en-US");
              }}
              formatter={(value: number) => [value.toFixed(3), "Score"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "hsl(var(--primary))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">{data.agent.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium">{data.agent.type}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Events:</span>
            <span className="ml-2 font-medium">{data.events.length}</span>
          </div>
        </div>
        {data.agent.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {data.agent.description}
          </p>
        )}
      </div>
    </div>
  );
}

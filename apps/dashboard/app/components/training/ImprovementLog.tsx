"use client";

import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Edit,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import type { RouterOutputs } from "@neon/api";

type TrainingEvent =
  RouterOutputs["training"]["getAgentTrainingHistory"]["events"][0];

interface ImprovementLogProps {
  events: TrainingEvent[];
}

const eventIcons = {
  prompt_update: Edit,
  fine_tune: Zap,
  score_adjustment: Target,
};

const eventColors = {
  prompt_update: "text-blue-600",
  fine_tune: "text-purple-600",
  score_adjustment: "text-green-600",
};

export function ImprovementLog({ events }: ImprovementLogProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No training events recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden">
        {events.map((event, index) => {
          const Icon =
            eventIcons[event.eventType as keyof typeof eventIcons] || Clock;
          const colorClass =
            eventColors[event.eventType as keyof typeof eventColors] ||
            "text-gray-600";
          const isImprovement = event.scoreChange && event.scoreChange > 0;
          const isRegression = event.scoreChange && event.scoreChange < 0;

          return (
            <div key={event.id} className="flex gap-4 pb-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={`p-2 rounded-full bg-background border-2 ${colorClass.replace("text-", "border-")}`}
                >
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium capitalize">
                    {event.eventType.replace("_", " ")}
                  </h4>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(event.createdAt), "MMM dd, HH:mm")}
                  </time>
                </div>

                {/* Score Change */}
                {event.scoreChange !== null && (
                  <div className="flex items-center gap-2 mb-2">
                    {isImprovement ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : isRegression ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span
                      className={`text-sm font-mono ${
                        isImprovement
                          ? "text-green-600"
                          : isRegression
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {event.scoreChange > 0 ? "+" : ""}
                      {event.scoreChange.toFixed(3)}
                    </span>
                    {event.scoreAfter !== null && (
                      <span className="text-xs text-muted-foreground">
                        → {event.scoreAfter.toFixed(3)}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {event.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.notes}
                  </p>
                )}

                {/* Metadata */}
                {event.metadata && typeof event.metadata === "object" && (
                  <div className="bg-muted/50 rounded p-2 text-xs">
                    <details>
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Event Details
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {events.filter((e) => e.scoreChange && e.scoreChange > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Improvements</p>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {events.filter((e) => e.scoreChange && e.scoreChange < 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Regressions</p>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {events.filter((e) => e.eventType === "prompt_update").length}
            </div>
            <p className="text-xs text-muted-foreground">Prompt Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

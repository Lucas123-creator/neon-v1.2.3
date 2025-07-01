"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, TrendingUp, Users } from "lucide-react";
import { Button } from "@neon/ui";

interface VotingPanelProps {
  ideaId: string;
  upvotes: number;
  downvotes: number;
  onVote: (ideaId: string, voteType: "upvote" | "downvote") => Promise<void>;
}

export function VotingPanel({
  ideaId,
  upvotes,
  downvotes,
  onVote,
}: VotingPanelProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [animatingVote, setAnimatingVote] = useState<
    "upvote" | "downvote" | null
  >(null);

  const totalVotes = upvotes + downvotes;
  const voteScore = upvotes - downvotes;
  const popularityPercentage =
    totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0;

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (isVoting) return;

    setIsVoting(true);
    setAnimatingVote(voteType);

    try {
      await onVote(ideaId, voteType);
      setUserVote(userVote === voteType ? null : voteType);
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
      // Keep animation for a bit longer for visual feedback
      setTimeout(() => setAnimatingVote(null), 300);
    }
  };

  const getVoteButtonClass = (
    voteType: "upvote" | "downvote",
    isActive: boolean,
  ) => {
    const baseClass =
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium";
    const animationClass = animatingVote === voteType ? "scale-110" : "";

    if (voteType === "upvote") {
      return `${baseClass} ${animationClass} ${
        isActive
          ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
      }`;
    } else {
      return `${baseClass} ${animationClass} ${
        isActive
          ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
      }`;
    }
  };

  const getPopularityColor = () => {
    if (popularityPercentage >= 80) return "bg-green-500";
    if (popularityPercentage >= 60) return "bg-blue-500";
    if (popularityPercentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreColor = () => {
    if (voteScore > 10) return "text-green-600";
    if (voteScore > 0) return "text-blue-600";
    if (voteScore < -5) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* Vote Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleVote("upvote")}
          disabled={isVoting}
          className={getVoteButtonClass("upvote", userVote === "upvote")}
          variant="ghost"
        >
          <ThumbsUp
            className={`h-4 w-4 ${animatingVote === "upvote" ? "animate-bounce" : ""}`}
          />
          <span className="font-bold">{upvotes}</span>
          <span className="hidden sm:inline">Upvote</span>
        </Button>

        <Button
          onClick={() => handleVote("downvote")}
          disabled={isVoting}
          className={getVoteButtonClass("downvote", userVote === "downvote")}
          variant="ghost"
        >
          <ThumbsDown
            className={`h-4 w-4 ${animatingVote === "downvote" ? "animate-bounce" : ""}`}
          />
          <span className="font-bold">{downvotes}</span>
          <span className="hidden sm:inline">Downvote</span>
        </Button>
      </div>

      {/* Vote Statistics */}
      <div className="space-y-2">
        {/* Popularity Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Community Score</span>
              <span>{totalVotes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getPopularityColor()} rounded-full h-2 transition-all duration-500 relative`}
                style={{ width: `${Math.max(5, popularityPercentage)}%` }}
              >
                {/* Pulse effect for high scores */}
                {popularityPercentage >= 80 && (
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score and Metrics */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className={`font-semibold ${getScoreColor()}`}>
                {voteScore > 0 ? "+" : ""}
                {voteScore}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{totalVotes}</span>
            </div>
          </div>

          {/* Popularity Percentage */}
          <div className="text-right">
            <div
              className={`font-semibold ${
                popularityPercentage >= 70
                  ? "text-green-600"
                  : popularityPercentage >= 50
                    ? "text-blue-600"
                    : "text-gray-600"
              }`}
            >
              {popularityPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">approval</div>
          </div>
        </div>

        {/* Vote Breakdown */}
        {totalVotes > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                {upvotes} up ({((upvotes / totalVotes) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>
                {downvotes} down ({((downvotes / totalVotes) * 100).toFixed(0)}
                %)
              </span>
            </div>
          </div>
        )}

        {/* Special Badges */}
        <div className="flex gap-2">
          {voteScore >= 20 && (
            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
              🔥 Hot Idea
            </div>
          )}

          {popularityPercentage >= 90 && totalVotes >= 5 && (
            <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
              ⭐ Community Favorite
            </div>
          )}

          {totalVotes >= 50 && (
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
              📊 Trending
            </div>
          )}
        </div>
      </div>

      {/* Voting Help */}
      {totalVotes === 0 && (
        <div className="text-center py-3 px-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Be the first to vote on this idea! Help the community discover great
            concepts.
          </p>
        </div>
      )}

      {/* User Feedback */}
      {userVote && (
        <div
          className={`text-center py-2 px-3 rounded-lg text-sm ${
            userVote === "upvote"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {userVote === "upvote"
            ? "✅ You upvoted this idea!"
            : "❌ You downvoted this idea"}
          <br />
          <span className="text-xs opacity-75">
            Click again to remove your vote
          </span>
        </div>
      )}
    </div>
  );
}

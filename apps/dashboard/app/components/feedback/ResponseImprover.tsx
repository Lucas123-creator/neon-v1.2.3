"use client";

import { useState } from "react";
import {
  Brain,
  Sparkles,
  Copy,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { Button } from "@neon/ui";
import { api } from "../../providers/trpc-provider";

interface ResponseImproverProps {
  selectedFeedback: string | null;
  onFeedbackSelect: (feedbackId: string | null) => void;
}

export function ResponseImprover({
  selectedFeedback,
  onFeedbackSelect,
}: ResponseImproverProps) {
  const [currentResponse, setCurrentResponse] = useState("");
  const [selectedTone, setSelectedTone] = useState<
    "professional" | "friendly" | "empathetic" | "formal"
  >("professional");
  const [selectedLength, setSelectedLength] = useState<
    "brief" | "medium" | "detailed"
  >("medium");
  const [isImproving, setIsImproving] = useState(false);
  const [improvedResponse, setImprovedResponse] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);

  const improveMutation = api.feedback.improveResponse.useMutation();
  const { data: recentFeedback } = api.feedback.getFeedback.useQuery({
    limit: 5,
    timeRange: "week",
  });

  const tones = [
    {
      value: "professional" as const,
      label: "Professional",
      description: "Business-like and formal",
    },
    {
      value: "friendly" as const,
      label: "Friendly",
      description: "Warm and approachable",
    },
    {
      value: "empathetic" as const,
      label: "Empathetic",
      description: "Understanding and caring",
    },
    {
      value: "formal" as const,
      label: "Formal",
      description: "Official and structured",
    },
  ];

  const lengths = [
    {
      value: "brief" as const,
      label: "Brief",
      description: "Concise and to-the-point",
    },
    {
      value: "medium" as const,
      label: "Medium",
      description: "Balanced detail level",
    },
    {
      value: "detailed" as const,
      label: "Detailed",
      description: "Comprehensive explanation",
    },
  ];

  const handleImproveResponse = async () => {
    if (!selectedFeedback || !currentResponse.trim()) return;

    setIsImproving(true);
    try {
      const result = await improveMutation.mutateAsync({
        feedbackId: selectedFeedback,
        currentResponse: currentResponse.trim(),
        tone: selectedTone,
        length: selectedLength,
      });

      setImprovedResponse(result.improvedResponse);
      setImprovements(result.improvements);
    } catch (error) {
      console.error("Failed to improve response:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUseImprovedResponse = () => {
    if (improvedResponse) {
      setCurrentResponse(improvedResponse);
      setImprovedResponse(null);
      setImprovements([]);
    }
  };

  const handleReset = () => {
    setCurrentResponse("");
    setImprovedResponse(null);
    setImprovements([]);
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "professional":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "friendly":
        return "border-green-200 bg-green-50 text-green-700";
      case "empathetic":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "formal":
        return "border-gray-200 bg-gray-50 text-gray-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getExamplePrompts = () => [
    "Thank you for your feedback. We appreciate you taking the time to share your experience with us.",
    "We sincerely apologize for the inconvenience you experienced. We are taking immediate action to resolve this issue.",
    "Your suggestion is valuable to us and we will consider it for future improvements to our service.",
    "We're thrilled to hear about your positive experience! Thank you for choosing our services.",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">AI Response Improver</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enhance your customer responses with AI-powered tone and style
          optimization
        </p>
      </div>

      {/* Feedback Selection */}
      {!selectedFeedback && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Select Feedback to Respond To
          </h4>
          <div className="space-y-2">
            {recentFeedback?.feedback?.slice(0, 3).map((feedback: any) => (
              <button
                key={feedback.id}
                onClick={() => onFeedbackSelect(feedback.id)}
                className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      feedback.sentimentAnalysis?.sentiment === "positive"
                        ? "bg-green-100 text-green-700"
                        : feedback.sentimentAnalysis?.sentiment === "negative"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {feedback.sentimentAnalysis?.sentiment || "neutral"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {feedback.source}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {feedback.content}
                </p>
              </button>
            )) || []}
          </div>
        </div>
      )}

      {/* Current Response Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Response
          {selectedFeedback && (
            <span className="text-muted-foreground ml-2">
              (for selected feedback)
            </span>
          )}
        </label>
        <textarea
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          placeholder="Enter your response to the customer feedback..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {currentResponse.length} characters
          </div>
          {!currentResponse && (
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground">
                Quick start:
              </span>
              {getExamplePrompts()
                .slice(0, 2)
                .map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentResponse(prompt)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Template {index + 1}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Tone and Length Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setSelectedTone(tone.value)}
                className={`p-3 border rounded-lg text-sm transition-colors ${
                  selectedTone === tone.value
                    ? getToneColor(tone.value) + " border-2"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{tone.label}</div>
                <div className="text-xs opacity-75">{tone.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Length</label>
          <div className="space-y-2">
            {lengths.map((length) => (
              <button
                key={length.value}
                onClick={() => setSelectedLength(length.value)}
                className={`w-full p-3 border rounded-lg text-sm text-left transition-colors ${
                  selectedLength === length.value
                    ? "border-purple-300 bg-purple-50 text-purple-700 border-2"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{length.label}</div>
                <div className="text-xs opacity-75">{length.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Improve Button */}
      <Button
        onClick={handleImproveResponse}
        disabled={!currentResponse.trim() || isImproving}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isImproving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Improving Response...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Improve Response with AI
          </>
        )}
      </Button>

      {/* Improved Response */}
      {improvedResponse && (
        <div className="space-y-4">
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-800">
                AI-Improved Response
              </h4>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {improvedResponse}
              </p>
            </div>

            {/* Improvements List */}
            {improvements.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-green-800 mb-2">
                  Improvements Made:
                </h5>
                <ul className="space-y-1">
                  {improvements.map((improvement, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-green-700"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={handleUseImprovedResponse}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Use This Response
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyResponse(improvedResponse)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Response Comparison */}
      {improvedResponse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Original Response
            </h5>
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {currentResponse}
              </p>
            </div>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Improved Response
            </h5>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-700 whitespace-pre-wrap">
                {improvedResponse}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {(currentResponse || improvedResponse) && (
        <div className="text-center pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <h5 className="font-medium text-yellow-800">Pro Tips</h5>
        </div>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • Be specific about the issue or praise in your original response
          </li>
          <li>
            • Choose empathetic tone for complaints and friendly for positive
            feedback
          </li>
          <li>
            • Use detailed length for complex issues, brief for simple
            acknowledgments
          </li>
          <li>• Always review AI suggestions before sending to customers</li>
        </ul>
      </div>
    </div>
  );
}

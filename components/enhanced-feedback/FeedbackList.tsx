"use client";

import { useState } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Mail,
  Globe,
  Phone,
  Users,
} from "lucide-react";
import { Button } from "@neon/ui";

interface FeedbackListProps {
  feedback: any[];
  onMarkProcessed: (feedbackId: string, processed: boolean) => Promise<void>;
  onMarkResponded: (feedbackId: string, responded: boolean) => Promise<void>;
  onSelectFeedback: (feedbackId: string | null) => void;
  selectedFeedback: string | null;
}

export function FeedbackList({
  feedback,
  onMarkProcessed,
  onMarkResponded,
  onSelectFeedback,
  selectedFeedback,
}: FeedbackListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (feedbackId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(feedbackId)) {
      newExpanded.delete(feedbackId);
    } else {
      newExpanded.add(feedbackId);
    }
    setExpandedItems(newExpanded);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "website":
        return <Globe className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "support":
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug_report":
        return "bg-red-100 text-red-700";
      case "feature_request":
        return "bg-blue-100 text-blue-700";
      case "complaint":
        return "bg-orange-100 text-orange-700";
      case "praise":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getUrgencyIndicator = (urgencyLevel: number) => {
    if (urgencyLevel >= 4) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">URGENT</span>
        </div>
      );
    }
    if (urgencyLevel >= 3) {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium">HIGH</span>
        </div>
      );
    }
    return null;
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {feedback.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No feedback found</h3>
          <p>No feedback matches your current filters.</p>
        </div>
      ) : (
        feedback.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const isSelected = selectedFeedback === item.id;

          return (
            <div
              key={item.id}
              className={`border rounded-lg transition-all duration-200 ${
                isSelected
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Source Icon */}
                      <div className="p-2 bg-muted rounded-lg">
                        {getSourceIcon(item.source)}
                      </div>

                      {/* Sentiment Badge */}
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(
                          item.sentimentAnalysis?.sentiment || "neutral",
                        )}`}
                      >
                        {getSentimentIcon(
                          item.sentimentAnalysis?.sentiment || "neutral",
                        )}{" "}
                        {item.sentimentAnalysis?.sentiment || "neutral"}
                      </div>

                      {/* Type Badge */}
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}
                      >
                        {item.type.replace("_", " ")}
                      </div>

                      {/* Urgency Indicator */}
                      {item.sentimentAnalysis &&
                        getUrgencyIndicator(
                          item.sentimentAnalysis.urgencyLevel,
                        )}

                      {/* Rating */}
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {item.rating}/5
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>From: {item.source}</span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                      {item.sentimentAnalysis?.confidence && (
                        <>
                          <span>•</span>
                          <span>
                            Confidence:{" "}
                            {(item.sentimentAnalysis.confidence * 100).toFixed(
                              0,
                            )}
                            %
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onSelectFeedback(isSelected ? null : item.id)
                      }
                      className={isSelected ? "bg-blue-100 text-blue-700" : ""}
                    >
                      {isSelected ? "Deselect" : "Select"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-3 mt-3">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      item.processed ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {item.processed ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span>{item.processed ? "Processed" : "Pending"}</span>
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs ${
                      item.responded ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {item.responded ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span>{item.responded ? "Responded" : "No Response"}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t bg-muted/30 p-4 space-y-4">
                  {/* Full Content */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Full Feedback:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>

                  {/* Customer Info */}
                  {item.customerInfo && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Customer Information:
                      </h4>
                      <div className="text-sm text-gray-600">
                        {JSON.parse(item.customerInfo).name && (
                          <div>Name: {JSON.parse(item.customerInfo).name}</div>
                        )}
                        {JSON.parse(item.customerInfo).email && (
                          <div>
                            Email: {JSON.parse(item.customerInfo).email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sentiment Analysis Details */}
                  {item.sentimentAnalysis && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Sentiment
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              item.sentimentAnalysis.sentiment === "positive"
                                ? "text-green-600"
                                : item.sentimentAnalysis.sentiment ===
                                    "negative"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {item.sentimentAnalysis.sentiment} (
                            {(item.sentimentAnalysis.confidence * 100).toFixed(
                              0,
                            )}
                            % confidence)
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            Urgency Level
                          </div>
                          <div className="text-sm font-medium">
                            {item.sentimentAnalysis.urgencyLevel}/5
                          </div>
                        </div>

                        {item.sentimentAnalysis.emotions && (
                          <div className="md:col-span-2">
                            <div className="text-xs text-muted-foreground">
                              Detected Emotions
                            </div>
                            <div className="flex gap-2 mt-1">
                              {JSON.parse(item.sentimentAnalysis.emotions).map(
                                (emotion: string) => (
                                  <span
                                    key={emotion}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                  >
                                    {emotion}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {item.sentimentAnalysis.suggestedResponse && (
                          <div className="md:col-span-2">
                            <div className="text-xs text-muted-foreground">
                              AI Suggested Response
                            </div>
                            <div className="text-sm mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
                              {item.sentimentAnalysis.suggestedResponse}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      variant={item.processed ? "outline" : "default"}
                      onClick={() => onMarkProcessed(item.id, !item.processed)}
                    >
                      {item.processed ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Mark Unprocessed
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Processed
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant={item.responded ? "outline" : "default"}
                      onClick={() => onMarkResponded(item.id, !item.responded)}
                    >
                      {item.responded ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Mark Not Responded
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Responded
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectFeedback(item.id)}
                    >
                      Use in AI Improver
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Load More */}
      {feedback.length > 0 && feedback.length % 20 === 0 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More Feedback</Button>
        </div>
      )}
    </div>
  );
}

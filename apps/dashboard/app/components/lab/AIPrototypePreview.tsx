"use client";

import { useState } from "react";
import {
  Palette,
  Sparkles,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Image,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@neon/ui";
import { api } from "../../providers/trpc-provider";

interface AIPrototypePreviewProps {
  ideaId: string;
  ideaTitle: string;
  category: string;
  mockups: any[];
}

export function AIPrototypePreview({
  ideaId,
  ideaTitle,
  category,
  mockups,
}: AIPrototypePreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("neon");
  const [selectedType, setSelectedType] = useState<
    "image" | "3d_render" | "sketch"
  >("image");
  const [expandedMockup, setExpandedMockup] = useState<string | null>(null);

  const generateMockupMutation = api.lab.generateMockup.useMutation();
  const approveMockupMutation = api.lab.approveMockup.useMutation();

  const styles = [
    {
      value: "neon",
      label: "Neon Style",
      description: "Classic neon glow effect",
    },
    {
      value: "minimalist",
      label: "Minimalist",
      description: "Clean, simple design",
    },
    {
      value: "futuristic",
      label: "Futuristic",
      description: "Sci-fi inspired look",
    },
    { value: "retro", label: "Retro", description: "Vintage aesthetic" },
    {
      value: "industrial",
      label: "Industrial",
      description: "Raw, metal finish",
    },
    { value: "elegant", label: "Elegant", description: "Sophisticated style" },
  ];

  const types = [
    {
      value: "image" as const,
      label: "2D Mockup",
      description: "Standard visualization",
    },
    {
      value: "3d_render" as const,
      label: "3D Render",
      description: "Three-dimensional view",
    },
    {
      value: "sketch" as const,
      label: "Concept Sketch",
      description: "Hand-drawn style",
    },
  ];

  const handleGenerateMockup = async () => {
    setIsGenerating(true);
    try {
      await generateMockupMutation.mutateAsync({
        ideaId,
        type: selectedType,
        style: selectedStyle,
      });
      // In a real app, you'd refetch the mockups here
    } catch (error) {
      console.error("Failed to generate mockup:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveMockup = async (mockupId: string, approved: boolean) => {
    try {
      await approveMockupMutation.mutateAsync({
        mockupId,
        approved,
      });
      // In a real app, you'd update the mockup state here
    } catch (error) {
      console.error("Failed to approve mockup:", error);
    }
  };

  const getMockupTypeIcon = (type: string) => {
    switch (type) {
      case "3d_render":
        return "🎯";
      case "sketch":
        return "✏️";
      default:
        return "🖼️";
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "neon":
        return "bg-purple-100 text-purple-700";
      case "minimalist":
        return "bg-gray-100 text-gray-700";
      case "futuristic":
        return "bg-blue-100 text-blue-700";
      case "retro":
        return "bg-orange-100 text-orange-700";
      case "industrial":
        return "bg-amber-100 text-amber-700";
      case "elegant":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generation Controls */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h4 className="font-semibold text-purple-800">AI Mockup Generator</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {styles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label} - {style.description}
                </option>
              ))}
            </select>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerateMockup}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating AI Mockup...
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 mr-2" />
              Generate AI Mockup
            </>
          )}
        </Button>

        <p className="text-xs text-purple-600 mt-2">
          AI will create a {selectedType.replace("_", " ")} in {selectedStyle}{" "}
          style based on: "{ideaTitle}"
        </p>
      </div>

      {/* Existing Mockups */}
      {mockups.length > 0 && (
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Generated Mockups ({mockups.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockups.map((mockup) => (
              <div
                key={mockup.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Mockup Preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {mockup.url ? (
                    <img
                      src={mockup.url}
                      alt={`Mockup for ${ideaTitle}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {getMockupTypeIcon(mockup.type)}
                      </div>
                      <p className="text-sm text-gray-600">
                        AI Generated Mockup
                      </p>
                      <p className="text-xs text-gray-500">
                        {mockup.type.replace("_", " ")}
                      </p>
                    </div>
                  )}

                  {/* Approval Status */}
                  {mockup.approved && (
                    <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() =>
                      setExpandedMockup(
                        expandedMockup === mockup.id ? null : mockup.id,
                      )
                    }
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <Eye className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Mockup Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStyleColor(
                          JSON.parse(mockup.metadata || "{}")?.style ||
                            "default",
                        )}`}
                      >
                        {JSON.parse(mockup.metadata || "{}")?.style ||
                          "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {mockup.type.replace("_", " ")}
                      </span>
                    </div>
                    {mockup.aiGenerated && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <Sparkles className="h-3 w-3" />
                        <span>AI</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        handleApproveMockup(mockup.id, !mockup.approved)
                      }
                    >
                      {mockup.approved ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Unapprove
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>

                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>

                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedMockup === mockup.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="text-sm">
                        <strong>AI Prompt:</strong>
                        <p className="text-gray-600 mt-1">
                          {mockup.prompt || "No prompt available"}
                        </p>
                      </div>

                      {mockup.metadata && (
                        <div className="text-sm">
                          <strong>Generation Details:</strong>
                          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(
                              JSON.parse(mockup.metadata),
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {(() => {
                          const dateObj = new Date(mockup.createdAt);
                          return dateObj.toLocaleString("en-US");
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Mockups State */}
      {mockups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h4 className="font-medium mb-2">No mockups yet</h4>
          <p className="text-sm mb-4">
            Generate the first AI mockup for this idea to help visualize the
            concept
          </p>
        </div>
      )}

      {/* Generation Tips */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">💡 Generation Tips:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Try different styles to explore various aesthetic approaches
          </li>
          <li>
            • 3D renders work best for architectural and installation concepts
          </li>
          <li>• Sketches are perfect for initial concept exploration</li>
          <li>• Approved mockups help others understand your vision</li>
        </ul>
      </div>
    </div>
  );
}

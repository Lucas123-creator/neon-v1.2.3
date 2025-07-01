"use client";

import { useState } from "react";
import { X, Lightbulb, Send, Loader2 } from "lucide-react";
import { Button } from "@neon/ui";
import { api } from "../../providers/trpc-provider";

interface SignIdeaFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function SignIdeaForm({ onSubmit, onCancel }: SignIdeaFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "neon-signs",
    submittedBy: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitIdeaMutation = api.lab.submitIdea.useMutation();

  const categories = [
    { value: "neon-signs", label: "Neon Signs" },
    { value: "led-displays", label: "LED Displays" },
    { value: "custom", label: "Custom Design" },
    { value: "interactive", label: "Interactive Display" },
    { value: "outdoor", label: "Outdoor Signage" },
    { value: "indoor", label: "Indoor Display" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    if (!formData.submittedBy.trim()) {
      newErrors.submittedBy = "Your name/email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await submitIdeaMutation.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category as any,
        submittedBy: formData.submittedBy.trim(),
      });

      onSubmit();
    } catch (error) {
      console.error("Failed to submit idea:", error);
      setErrors({ submit: "Failed to submit idea. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Lightbulb className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Submit Your Idea</h2>
            <p className="text-sm text-muted-foreground">
              Share your innovative sign concept with the community
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Idea Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="e.g., Interactive Neon Gaming Wall"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Detailed Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your idea in detail. What makes it unique? How would it work? What problems does it solve?"
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            maxLength={2000}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Submitter Info */}
        <div>
          <label
            htmlFor="submittedBy"
            className="block text-sm font-medium mb-2"
          >
            Your Name or Email *
          </label>
          <input
            id="submittedBy"
            type="text"
            value={formData.submittedBy}
            onChange={(e) => handleInputChange("submittedBy", e.target.value)}
            placeholder="John Doe or john@example.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.submittedBy ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.submittedBy && (
            <p className="text-red-500 text-sm mt-1">{errors.submittedBy}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            This will be visible to other users when voting
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">
            Submission Guidelines:
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Be specific and detailed in your description</li>
            <li>• Consider technical feasibility and cost</li>
            <li>• Think about the target audience and use cases</li>
            <li>• Include any special features or technology requirements</li>
            <li>• Be respectful and constructive</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Idea
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview */}
      {formData.title && formData.description && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Preview:</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h5 className="font-semibold">{formData.title}</h5>
                <p className="text-xs text-muted-foreground">
                  {categories.find((c) => c.value === formData.category)?.label}{" "}
                  • by {formData.submittedBy || "Anonymous"}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.description.substring(0, 150)}
              {formData.description.length > 150 && "..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";

export const feedbackRouter = createRouter({
  // Get all feedback with filtering and pagination
  getFeedback: publicProcedure
    .input(
      z.object({
        source: z.enum(["website", "email", "social", "support"]).optional(),
        type: z
          .enum(["bug_report", "feature_request", "complaint", "praise"])
          .optional(),
        sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
        processed: z.boolean().optional(),
        responded: z.boolean().optional(),
        timeRange: z
          .enum(["24h", "week", "month", "quarter", "year"])
          .default("month"),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        source,
        type,
        sentiment,
        processed,
        responded,
        timeRange,
        limit,
        offset,
      } = input;

      // Calculate date range
      const now = new Date();
      const timeRanges = {
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const where: any = {
        createdAt: { gte: timeRanges[timeRange] },
      };

      if (source) where.source = source;
      if (type) where.type = type;
      if (processed !== undefined) where.processed = processed;
      if (responded !== undefined) where.responded = responded;
      if (sentiment) {
        where.sentimentAnalysis = {
          sentiment: sentiment,
        };
      }

      const [feedback, total] = await Promise.all([
        ctx.prisma.feedback.findMany({
          where,
          include: {
            sentimentAnalysis: true,
          },
          orderBy: [
            { sentimentAnalysis: { urgencyLevel: "desc" } },
            { createdAt: "desc" },
          ],
          take: limit,
          skip: offset,
        }),
        ctx.prisma.feedback.count({ where }),
      ]);

      return {
        feedback,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Submit new feedback
  submitFeedback: publicProcedure
    .input(
      z.object({
        source: z.enum(["website", "email", "social", "support"]),
        type: z.enum(["bug_report", "feature_request", "complaint", "praise"]),
        content: z.string().min(1).max(5000),
        rating: z.number().min(1).max(5).optional(),
        customerInfo: z.record(z.any()).optional(), // name, email, etc.
        context: z.record(z.any()).optional(), // page URL, product info, etc.
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const feedback = await ctx.prisma.feedback.create({
        data: {
          ...input,
          customerInfo: input.customerInfo
            ? JSON.stringify(input.customerInfo)
            : null,
          context: input.context ? JSON.stringify(input.context) : null,
        },
      });

      // Automatically trigger sentiment analysis
      await ctx.prisma.sentimentAnalysis.create({
        data: {
          feedbackId: feedback.id,
          sentiment: "neutral", // Will be updated by analyzeSentiment
          confidence: 0.0,
          urgencyLevel: 1,
        },
      });

      return feedback;
    }),

  // Analyze sentiment for feedback
  analyzeSentiment: publicProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        forceReanalyze: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { feedbackId, forceReanalyze } = input;

      // Get feedback content
      const feedback = await ctx.prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: { sentimentAnalysis: true },
      });

      if (!feedback) {
        throw new Error("Feedback not found");
      }

      // Skip if already analyzed and not forcing reanalysis
      if (feedback.sentimentAnalysis && !forceReanalyze) {
        return feedback.sentimentAnalysis;
      }

      // Simulate AI sentiment analysis (in real implementation, use OpenAI, Google Cloud, etc.)
      const content = feedback.content.toLowerCase();

      // Simple keyword-based sentiment analysis (placeholder for real AI)
      const positiveWords = [
        "great",
        "excellent",
        "amazing",
        "love",
        "perfect",
        "awesome",
        "fantastic",
      ];
      const negativeWords = [
        "terrible",
        "awful",
        "hate",
        "worst",
        "horrible",
        "broken",
        "useless",
      ];

      let sentiment = "neutral";
      let confidence = 0.5;
      let urgencyLevel = 1;

      const positiveCount = positiveWords.filter((word) =>
        content.includes(word),
      ).length;
      const negativeCount = negativeWords.filter((word) =>
        content.includes(word),
      ).length;

      if (positiveCount > negativeCount) {
        sentiment = "positive";
        confidence = Math.min(0.9, 0.6 + positiveCount * 0.1);
        urgencyLevel = 1;
      } else if (negativeCount > positiveCount) {
        sentiment = "negative";
        confidence = Math.min(0.9, 0.6 + negativeCount * 0.1);
        urgencyLevel = Math.min(5, 2 + negativeCount);
      }

      // Extract emotions and keywords
      const emotions = [];
      if (content.includes("angry") || content.includes("frustrated"))
        emotions.push("anger");
      if (content.includes("happy") || content.includes("excited"))
        emotions.push("joy");
      if (content.includes("worried") || content.includes("concerned"))
        emotions.push("concern");

      // Generate suggested response based on sentiment and type
      let suggestedResponse = "";
      if (sentiment === "negative") {
        if (feedback.type === "complaint") {
          suggestedResponse =
            "Thank you for bringing this to our attention. We sincerely apologize for the inconvenience and are working to resolve this issue immediately.";
        } else if (feedback.type === "bug_report") {
          suggestedResponse =
            "Thank you for reporting this bug. Our technical team is investigating and will provide an update within 24 hours.";
        }
      } else if (sentiment === "positive") {
        suggestedResponse =
          "Thank you so much for your positive feedback! We're thrilled to hear about your experience and appreciate you taking the time to share it.";
      }

      // Update or create sentiment analysis
      const sentimentData = {
        sentiment,
        confidence,
        emotions: JSON.stringify(emotions),
        keywords: JSON.stringify([
          ...positiveWords.filter((w) => content.includes(w)),
          ...negativeWords.filter((w) => content.includes(w)),
        ]),
        suggestedResponse,
        urgencyLevel,
      };

      if (feedback.sentimentAnalysis) {
        return await ctx.prisma.sentimentAnalysis.update({
          where: { feedbackId },
          data: sentimentData,
        });
      } else {
        return await ctx.prisma.sentimentAnalysis.create({
          data: {
            feedbackId,
            ...sentimentData,
          },
        });
      }
    }),

  // Improve response using AI
  improveResponse: publicProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        currentResponse: z.string(),
        tone: z
          .enum(["professional", "friendly", "empathetic", "formal"])
          .default("professional"),
        length: z.enum(["brief", "medium", "detailed"]).default("medium"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { feedbackId, currentResponse, tone, length } = input;

      // Get feedback and sentiment data
      const feedback = await ctx.prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: { sentimentAnalysis: true },
      });

      if (!feedback) {
        throw new Error("Feedback not found");
      }

      // Simulate AI response improvement (placeholder for real AI integration)
      let improvedResponse = currentResponse;

      const toneAdjustments = {
        professional: "We appreciate your feedback and",
        friendly: "Thanks so much for reaching out!",
        empathetic: "We understand your concerns and",
        formal: "We acknowledge receipt of your feedback and",
      };

      const lengthTemplates = {
        brief: `${toneAdjustments[tone]} will address this promptly.`,
        medium: `${toneAdjustments[tone]} want to ensure we address your concerns properly. ${currentResponse}`,
        detailed: `${toneAdjustments[tone]} value your input greatly. ${currentResponse} Please don't hesitate to reach out if you need any further assistance.`,
      };

      improvedResponse = lengthTemplates[length];

      // Update sentiment analysis with improved response
      if (feedback.sentimentAnalysis) {
        await ctx.prisma.sentimentAnalysis.update({
          where: { feedbackId },
          data: { suggestedResponse: improvedResponse },
        });
      }

      return {
        originalResponse: currentResponse,
        improvedResponse,
        tone,
        length,
        improvements: [
          "Adjusted tone to be more " + tone,
          "Optimized length for " + length + " communication",
          "Enhanced empathy and acknowledgment",
        ],
      };
    }),

  // Get sentiment trends and analytics
  getSentimentTrends: publicProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["week", "month", "quarter", "year"])
          .default("month"),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange, groupBy } = input;

      const now = new Date();
      const timeRanges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const feedback = await ctx.prisma.feedback.findMany({
        where: {
          createdAt: { gte: timeRanges[timeRange] },
        },
        include: {
          sentimentAnalysis: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by time periods
      const trends = feedback.reduce((acc: any, item) => {
        const date = new Date(item.createdAt);
        let key = "";

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          key = `Week ${week}`;
        } else {
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        }

        if (!acc[key]) {
          acc[key] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        }

        const sentiment = item.sentimentAnalysis?.sentiment || "neutral";
        acc[key][sentiment]++;
        acc[key].total++;

        return acc;
      }, {});

      return {
        trends: Object.entries(trends).map(([date, counts]: [string, any]) => ({
          date,
          ...counts,
          positivePercentage: Math.round(
            (counts.positive / counts.total) * 100,
          ),
          negativePercentage: Math.round(
            (counts.negative / counts.total) * 100,
          ),
          neutralPercentage: Math.round((counts.neutral / counts.total) * 100),
        })),
        summary: {
          totalFeedback: feedback.length,
          averageSentiment:
            feedback.reduce((sum, f) => {
              const score =
                f.sentimentAnalysis?.sentiment === "positive"
                  ? 1
                  : f.sentimentAnalysis?.sentiment === "negative"
                    ? -1
                    : 0;
              return sum + score;
            }, 0) / feedback.length,
        },
      };
    }),

  // Mark feedback as processed
  markAsProcessed: publicProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        processed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.feedback.update({
        where: { id: input.feedbackId },
        data: { processed: input.processed },
      });
    }),

  // Mark feedback as responded
  markAsResponded: publicProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        responded: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.feedback.update({
        where: { id: input.feedbackId },
        data: { responded: input.responded },
      });
    }),

  // Get feedback statistics
  getFeedbackStats: publicProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["week", "month", "quarter", "year"])
          .default("month"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange } = input;

      const now = new Date();
      const timeRanges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const [
        totalFeedback,
        processedFeedback,
        respondedFeedback,
        urgentFeedback,
        sentimentCounts,
        sourceCounts,
        typeCounts,
      ] = await Promise.all([
        ctx.prisma.feedback.count({
          where: { createdAt: { gte: timeRanges[timeRange] } },
        }),
        ctx.prisma.feedback.count({
          where: {
            createdAt: { gte: timeRanges[timeRange] },
            processed: true,
          },
        }),
        ctx.prisma.feedback.count({
          where: {
            createdAt: { gte: timeRanges[timeRange] },
            responded: true,
          },
        }),
        ctx.prisma.feedback.count({
          where: {
            createdAt: { gte: timeRanges[timeRange] },
            sentimentAnalysis: {
              urgencyLevel: { gte: 4 },
            },
          },
        }),
        ctx.prisma.sentimentAnalysis.groupBy({
          by: ["sentiment"],
          _count: { sentiment: true },
          where: {
            feedback: {
              createdAt: { gte: timeRanges[timeRange] },
            },
          },
        }),
        ctx.prisma.feedback.groupBy({
          by: ["source"],
          _count: { source: true },
          where: { createdAt: { gte: timeRanges[timeRange] } },
        }),
        ctx.prisma.feedback.groupBy({
          by: ["type"],
          _count: { type: true },
          where: { createdAt: { gte: timeRanges[timeRange] } },
        }),
      ]);

      return {
        totalFeedback,
        processedFeedback,
        respondedFeedback,
        urgentFeedback,
        processedPercentage:
          totalFeedback > 0
            ? Math.round((processedFeedback / totalFeedback) * 100)
            : 0,
        responseRate:
          totalFeedback > 0
            ? Math.round((respondedFeedback / totalFeedback) * 100)
            : 0,
        sentimentCounts,
        sourceCounts,
        typeCounts,
      };
    }),

  // Export feedback data for external analysis
  exportFeedback: publicProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["week", "month", "quarter", "year"])
          .default("month"),
        format: z.enum(["json", "csv"]).default("json"),
        includePersonalInfo: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange, format, includePersonalInfo } = input;

      const now = new Date();
      const timeRanges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const feedback = await ctx.prisma.feedback.findMany({
        where: {
          createdAt: { gte: timeRanges[timeRange] },
        },
        include: {
          sentimentAnalysis: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Process data for export
      const exportData = feedback.map((item: any) => ({
        id: item.id,
        source: item.source,
        type: item.type,
        content: item.content,
        rating: item.rating,
        sentiment: item.sentimentAnalysis?.sentiment,
        confidence: item.sentimentAnalysis?.confidence,
        urgency: item.sentimentAnalysis?.urgencyLevel,
        processed: item.processed,
        responded: item.responded,
        createdAt: item.createdAt,
        ...(includePersonalInfo && {
          customerInfo: item.customerInfo
            ? JSON.parse(item.customerInfo)
            : null,
        }),
      }));

      return {
        data: exportData,
        format,
        generatedAt: new Date(),
        totalRecords: exportData.length,
      };
    }),

  // Delete feedback (GDPR compliance)
  deleteFeedback: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete sentiment analysis first
      await ctx.prisma.sentimentAnalysis.deleteMany({
        where: { feedbackId: input.id },
      });

      // Then delete feedback
      return await ctx.prisma.feedback.delete({
        where: { id: input.id },
      });
    }),
});

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const insightsRouter = createTRPCRouter({
  // Get market trends with filtering and regional data
  getMarketTrends: publicProcedure
    .input(
      z.object({
        region: z.string().optional(),
        category: z.string().optional(),
        timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
        limit: z.number().min(1).max(100).default(20),
        minScore: z.number().min(0).max(100).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { region, category, timeRange, limit, minScore } = input;

      // Calculate date range based on timeRange
      const now = new Date();
      const timeRanges = {
        "1h": new Date(now.getTime() - 60 * 60 * 1000),
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      const where: any = {
        score: { gte: minScore },
        createdAt: { gte: timeRanges[timeRange] },
      };

      if (region) where.region = region;
      if (category) where.category = category;

      const trends = await ctx.prisma.marketTrend.findMany({
        where,
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        take: limit,
      });

      // Calculate trend analytics
      const analytics = {
        totalTrends: trends.length,
        avgScore:
          trends.reduce((sum, t) => sum + t.score, 0) / trends.length || 0,
        topRegions: [...new Set(trends.map((t) => t.region))].slice(0, 5),
        topCategories: [...new Set(trends.map((t) => t.category))].slice(0, 5),
        growthTrends: trends.filter((t) => t.growth > 0).length,
      };

      return { trends, analytics };
    }),

  // Get platform signals for viral content tracking
  getPlatformSignals: publicProcedure
    .input(
      z.object({
        platform: z.string().optional(),
        type: z.string().optional(),
        minViralScore: z.number().min(0).max(100).default(50),
        timeRange: z.enum(["1h", "6h", "24h", "7d"]).default("24h"),
        limit: z.number().min(1).max(50).default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { platform, type, minViralScore, timeRange, limit } = input;

      const now = new Date();
      const timeRanges = {
        "1h": new Date(now.getTime() - 60 * 60 * 1000),
        "6h": new Date(now.getTime() - 6 * 60 * 60 * 1000),
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };

      const where: any = {
        viralScore: { gte: minViralScore },
        createdAt: { gte: timeRanges[timeRange] },
      };

      if (platform) where.platform = platform;
      if (type) where.type = type;

      const signals = await ctx.prisma.platformSignal.findMany({
        where,
        orderBy: [{ viralScore: "desc" }, { velocity: "desc" }],
        take: limit,
      });

      // Platform analytics
      const platformStats = signals.reduce((acc: any, signal) => {
        if (!acc[signal.platform]) {
          acc[signal.platform] = {
            count: 0,
            avgViralScore: 0,
            totalEngagement: 0,
          };
        }
        acc[signal.platform].count++;
        acc[signal.platform].avgViralScore += signal.viralScore;
        acc[signal.platform].totalEngagement += signal.engagement;
        return acc;
      }, {});

      // Calculate averages
      Object.keys(platformStats).forEach((platform) => {
        platformStats[platform].avgViralScore /= platformStats[platform].count;
      });

      return { signals, platformStats };
    }),

  // Get conversion hotspots for ROI targeting
  getConversionHotspots: publicProcedure
    .input(
      z.object({
        region: z.string().optional(),
        demographic: z.string().optional(),
        minRoiScore: z.number().min(0).max(100).default(60),
        minBuyerIntent: z.number().min(0).max(100).default(50),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { region, demographic, minRoiScore, minBuyerIntent, limit } = input;

      const where: any = {
        roiScore: { gte: minRoiScore },
        buyerIntent: { gte: minBuyerIntent },
      };

      if (region) where.region = region;
      if (demographic) where.demographic = demographic;

      const hotspots = await ctx.prisma.conversionHotspot.findMany({
        where,
        orderBy: [{ roiScore: "desc" }, { buyerIntent: "desc" }],
        take: limit,
      });

      // ROI analytics
      const roiAnalytics = {
        avgRoiScore:
          hotspots.reduce((sum, h) => sum + h.roiScore, 0) / hotspots.length ||
          0,
        avgBuyerIntent:
          hotspots.reduce((sum, h) => sum + h.buyerIntent, 0) /
            hotspots.length || 0,
        topRegions: [...new Set(hotspots.map((h) => h.region))].slice(0, 5),
        topDemographics: [...new Set(hotspots.map((h) => h.demographic))].slice(
          0,
          5,
        ),
        highValueCount: hotspots.filter(
          (h) => h.roiScore > 80 && h.buyerIntent > 80,
        ).length,
      };

      return { hotspots, roiAnalytics };
    }),

  // Create or update market trend data (for data ingestion)
  updateMarketTrend: publicProcedure
    .input(
      z.object({
        region: z.string(),
        category: z.string(),
        keyword: z.string(),
        score: z.number().min(0).max(100),
        volume: z.number().min(0),
        growth: z.number(),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.marketTrend.create({
        data: {
          ...input,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    }),

  // Create platform signal data
  createPlatformSignal: publicProcedure
    .input(
      z.object({
        platform: z.string(),
        type: z.string(),
        content: z.string(),
        engagement: z.number().min(0),
        velocity: z.number(),
        viralScore: z.number().min(0).max(100),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.platformSignal.create({
        data: {
          ...input,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    }),

  // Create conversion hotspot data
  createConversionHotspot: publicProcedure
    .input(
      z.object({
        region: z.string(),
        demographic: z.string(),
        interest: z.string(),
        roiScore: z.number().min(0).max(100),
        buyerIntent: z.number().min(0).max(100),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.conversionHotspot.create({
        data: {
          ...input,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    }),

  // Get comprehensive insights dashboard data
  getDashboardInsights: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange } = input;

      const now = new Date();
      const timeRanges = {
        "1h": new Date(now.getTime() - 60 * 60 * 1000),
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      const dateFilter = { gte: timeRanges[timeRange] };

      const [topTrends, viralSignals, hotspots] = await Promise.all([
        ctx.prisma.marketTrend.findMany({
          where: { createdAt: dateFilter, score: { gte: 70 } },
          orderBy: { score: "desc" },
          take: 5,
        }),
        ctx.prisma.platformSignal.findMany({
          where: { createdAt: dateFilter, viralScore: { gte: 80 } },
          orderBy: { viralScore: "desc" },
          take: 3,
        }),
        ctx.prisma.conversionHotspot.findMany({
          where: { roiScore: { gte: 75 } },
          orderBy: { roiScore: "desc" },
          take: 5,
        }),
      ]);

      return {
        summary: {
          topTrends: topTrends.length,
          viralAlerts: viralSignals.length,
          highValueRegions: hotspots.length,
          lastUpdated: new Date(),
        },
        topTrends,
        viralSignals,
        hotspots,
      };
    }),

  // Delete old data for cleanup
  cleanupOldData: publicProcedure
    .input(
      z.object({
        daysToKeep: z.number().min(1).max(365).default(30),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysToKeep);

      const [deletedTrends, deletedSignals, deletedHotspots] =
        await Promise.all([
          ctx.prisma.marketTrend.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          }),
          ctx.prisma.platformSignal.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          }),
          ctx.prisma.conversionHotspot.deleteMany({
            where: { createdAt: { lt: cutoffDate } },
          }),
        ]);

      return {
        deletedTrends: deletedTrends.count,
        deletedSignals: deletedSignals.count,
        deletedHotspots: deletedHotspots.count,
      };
    }),
});

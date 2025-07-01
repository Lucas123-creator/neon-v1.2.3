import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";

export const labRouter = createRouter({
  // Submit a new product idea
  submitIdea: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(10).max(2000),
        category: z.enum([
          "neon-signs",
          "led-displays",
          "custom",
          "interactive",
          "outdoor",
          "indoor",
        ]),
        submittedBy: z.string(), // user ID or email
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.productIdea.create({
        data: input,
        include: {
          votes: true,
          mockups: true,
        },
      });
    }),

  // Get all product ideas with filtering and pagination
  getIdeas: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z
          .enum(["pending", "approved", "in_progress", "completed", "rejected"])
          .optional(),
        sortBy: z
          .enum(["newest", "oldest", "popular", "priority"])
          .default("newest"),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { category, status, sortBy, limit, offset } = input;

      const where: any = {};
      if (category) where.category = category;
      if (status) where.status = status;

      // Define sort orders
      const orderBy: any = {
        newest: { createdAt: "desc" },
        oldest: { createdAt: "asc" },
        priority: { priority: "desc" },
        popular: { votes: { _count: "desc" } },
      };

      const [ideas, total] = await Promise.all([
        ctx.prisma.productIdea.findMany({
          where,
          include: {
            votes: true,
            mockups: {
              where: { approved: true },
              take: 3,
            },
            _count: {
              select: {
                votes: true,
                mockups: true,
              },
            },
          },
          orderBy: orderBy[sortBy],
          take: limit,
          skip: offset,
        }),
        ctx.prisma.productIdea.count({ where }),
      ]);

      // Calculate voting scores for each idea
      const ideasWithScores = ideas.map((idea: any) => {
        const upvotes = idea.votes.filter(
          (v: any) => v.voteType === "upvote",
        ).length;
        const downvotes = idea.votes.filter(
          (v: any) => v.voteType === "downvote",
        ).length;
        const score = upvotes - downvotes;
        const popularityScore =
          upvotes + downvotes > 0 ? (upvotes / (upvotes + downvotes)) * 100 : 0;

        return {
          ...idea,
          voteScore: score,
          popularityScore: Math.round(popularityScore),
          upvotes,
          downvotes,
        };
      });

      return {
        ideas: ideasWithScores,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get top ideas based on votes and engagement
  getTopIdeas: publicProcedure
    .input(
      z.object({
        timeRange: z
          .enum(["week", "month", "quarter", "year", "all"])
          .default("month"),
        limit: z.number().min(1).max(20).default(10),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { timeRange, limit, category } = input;

      // Calculate date range
      const now = new Date();
      const timeRanges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        all: new Date(0),
      };

      const where: any = {
        createdAt: { gte: timeRanges[timeRange] },
      };
      if (category) where.category = category;

      const ideas = await ctx.prisma.productIdea.findMany({
        where,
        include: {
          votes: true,
          mockups: {
            where: { approved: true },
            take: 1,
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      // Calculate comprehensive ranking score
      const rankedIdeas = ideas
        .map((idea: any) => {
          const upvotes = idea.votes.filter(
            (v: any) => v.voteType === "upvote",
          ).length;
          const downvotes = idea.votes.filter(
            (v: any) => v.voteType === "downvote",
          ).length;
          const totalVotes = upvotes + downvotes;

          // Weighted score considering vote count, ratio, and recency
          const voteScore = upvotes - downvotes;
          const popularityRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
          const recencyScore =
            (now.getTime() - idea.createdAt.getTime()) / (24 * 60 * 60 * 1000); // days old

          const finalScore =
            voteScore * 0.4 +
            popularityRatio * 100 * 0.3 +
            Math.max(0, 30 - recencyScore) * 0.2 + // newer ideas get bonus
            idea.priority * 0.1;

          return {
            ...idea,
            voteScore,
            popularityRatio: Math.round(popularityRatio * 100),
            upvotes,
            downvotes,
            finalScore: Math.round(finalScore * 10) / 10,
          };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, limit);

      return rankedIdeas;
    }),

  // Vote on a product idea
  voteOnIdea: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        userId: z.string(), // user ID or IP hash
        voteType: z.enum(["upvote", "downvote"]),
        weight: z.number().min(0.1).max(5.0).default(1.0), // vote weight based on user reputation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ideaId, userId, voteType, weight } = input;

      // Check if user already voted
      const existingVote = await ctx.prisma.vote.findUnique({
        where: {
          ideaId_userId: {
            ideaId,
            userId,
          },
        },
      });

      if (existingVote) {
        // Update existing vote
        return await ctx.prisma.vote.update({
          where: {
            ideaId_userId: {
              ideaId,
              userId,
            },
          },
          data: {
            voteType,
            weight,
          },
        });
      } else {
        // Create new vote
        return await ctx.prisma.vote.create({
          data: {
            ideaId,
            userId,
            voteType,
            weight,
          },
        });
      }
    }),

  // Generate AI mockup for an idea
  generateMockup: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        type: z.enum(["image", "3d_render", "sketch"]).default("image"),
        prompt: z.string().optional(),
        style: z.string().optional(), // "neon", "minimalist", "futuristic", etc.
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ideaId, type, prompt, style } = input;

      // Get the idea details
      const idea = await ctx.prisma.productIdea.findUnique({
        where: { id: ideaId },
      });

      if (!idea) {
        throw new Error("Product idea not found");
      }

      // Generate AI prompt based on idea details
      const aiPrompt =
        prompt ||
        `Create a ${style || "modern neon"} ${idea.category} design for "${idea.title}". 
         Description: ${idea.description}. 
         Style: professional, commercial-ready, eye-catching.`;

      // Simulate AI image generation (in real implementation, this would call DALL-E, Midjourney, etc.)
      const mockupUrl = `https://placeholder-ai-generated-image.com/${Date.now()}.jpg`;

      const mockup = await ctx.prisma.mockup.create({
        data: {
          ideaId,
          type,
          url: mockupUrl,
          prompt: aiPrompt,
          aiGenerated: true,
          metadata: JSON.stringify({
            style,
            generatedAt: new Date(),
            model: "simulated-ai-v1",
            parameters: { style, type },
          }),
        },
      });

      return mockup;
    }),

  // Get mockups for an idea
  getMockups: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        approved: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { ideaId, approved } = input;

      const where: any = { ideaId };
      if (approved !== undefined) where.approved = approved;

      return await ctx.prisma.mockup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          idea: {
            select: {
              title: true,
              category: true,
            },
          },
        },
      });
    }),

  // Approve a mockup
  approveMockup: publicProcedure
    .input(
      z.object({
        mockupId: z.string(),
        approved: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.mockup.update({
        where: { id: input.mockupId },
        data: { approved: input.approved },
      });
    }),

  // Update idea status
  updateIdeaStatus: publicProcedure
    .input(
      z.object({
        ideaId: z.string(),
        status: z.enum([
          "pending",
          "approved",
          "in_progress",
          "completed",
          "rejected",
        ]),
        priority: z.number().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ideaId, status, priority } = input;

      const updateData: any = { status };
      if (priority !== undefined) updateData.priority = priority;

      return await ctx.prisma.productIdea.update({
        where: { id: ideaId },
        data: updateData,
        include: {
          votes: true,
          mockups: true,
        },
      });
    }),

  // Get idea by ID with full details
  getIdeaById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const idea = await ctx.prisma.productIdea.findUnique({
        where: { id: input.id },
        include: {
          votes: {
            orderBy: { createdAt: "desc" },
          },
          mockups: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              votes: true,
              mockups: true,
            },
          },
        },
      });

      if (!idea) return null;

      // Calculate vote statistics
      const upvotes = idea.votes.filter(
        (v: any) => v.voteType === "upvote",
      ).length;
      const downvotes = idea.votes.filter(
        (v: any) => v.voteType === "downvote",
      ).length;
      const voteScore = upvotes - downvotes;
      const popularityScore =
        upvotes + downvotes > 0 ? (upvotes / (upvotes + downvotes)) * 100 : 0;

      return {
        ...idea,
        voteScore,
        popularityScore: Math.round(popularityScore),
        upvotes,
        downvotes,
      };
    }),

  // Delete an idea (admin only)
  deleteIdea: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete associated votes and mockups first
      await Promise.all([
        ctx.prisma.vote.deleteMany({
          where: { ideaId: input.id },
        }),
        ctx.prisma.mockup.deleteMany({
          where: { ideaId: input.id },
        }),
      ]);

      // Then delete the idea
      return await ctx.prisma.productIdea.delete({
        where: { id: input.id },
      });
    }),

  // Get lab statistics
  getLabStats: publicProcedure.query(async ({ ctx }) => {
    const [totalIdeas, totalVotes, totalMockups, recentIdeas] =
      await Promise.all([
        ctx.prisma.productIdea.count(),
        ctx.prisma.vote.count(),
        ctx.prisma.mockup.count(),
        ctx.prisma.productIdea.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
            },
          },
        }),
      ]);

    const categoryCounts = await ctx.prisma.productIdea.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
    });

    const statusCounts = await ctx.prisma.productIdea.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    return {
      totalIdeas,
      totalVotes,
      totalMockups,
      recentIdeas,
      categoryCounts,
      statusCounts,
    };
  }),
});

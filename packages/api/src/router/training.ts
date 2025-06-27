import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const trainingRouter = createTRPCRouter({
  // Get agent training history with performance data
  getAgentTrainingHistory: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        timeRange: z
          .enum(["week", "month", "quarter", "year"])
          .optional()
          .default("month"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { agentId, timeRange } = input;

      // Calculate date range based on input
      const now = new Date();
      const ranges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const agent = await ctx.prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          trainingEvents: {
            where: {
              createdAt: {
                gte: ranges[timeRange],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!agent) {
        throw new Error("Agent not found");
      }

      // Calculate performance metrics
      const events = agent.trainingEvents;
      const currentScore = events[0]?.scoreAfter || 0;
      const previousScore = events[events.length - 1]?.scoreBefore || 0;
      const totalChange = currentScore - previousScore;

      // Group events by week for graph data
      const weeklyData = events.reduce(
        (
          acc: Record<string, { date: string; score: number; events: number }>,
          event: any,
        ) => {
          const week = new Date(event.createdAt).toISOString().split("T")[0];
          if (!acc[week]) {
            acc[week] = { date: week, score: event.scoreAfter || 0, events: 0 };
          }
          acc[week].events += 1;
          acc[week].score = event.scoreAfter || acc[week].score;
          return acc;
        },
        {} as Record<string, { date: string; score: number; events: number }>,
      );

      return {
        agent,
        events,
        metrics: {
          currentScore,
          previousScore,
          totalChange,
          changePercentage: previousScore
            ? (totalChange / previousScore) * 100
            : 0,
        },
        graphData: (
          Object.values(weeklyData) as {
            date: string;
            score: number;
            events: number;
          }[]
        ).sort((a, b) => a.date.localeCompare(b.date)),
      };
    }),

  // Log a new training event
  logTrainingEvent: publicProcedure
    .input(
      z.object({
        agentId: z.string(),
        eventType: z.enum(["prompt_update", "fine_tune", "score_adjustment"]),
        scoreChange: z.number().optional(),
        scoreBefore: z.number().optional(),
        scoreAfter: z.number().optional(),
        metadata: z.record(z.any()).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.trainingEvent.create({
        data: {
          ...input,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    }),

  // Get improvement opportunities (agents with poor performance)
  getImprovementOpportunities: publicProcedure.query(async ({ ctx }) => {
    const agents = await ctx.prisma.agent.findMany({
      include: {
        trainingEvents: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    return agents
      .map((agent: any) => {
        const recentEvents = agent.trainingEvents;
        const currentScore = recentEvents[0]?.scoreAfter || 0;
        const previousScore = recentEvents[1]?.scoreAfter || 0;
        const trend = currentScore - previousScore;

        return {
          agent,
          currentScore,
          trend,
          needsAttention: currentScore < 0.7 || trend < -0.1,
          lastTrainingEvent: recentEvents[0],
        };
      })
      .filter((item: any) => item.needsAttention)
      .sort((a: any, b: any) => a.currentScore - b.currentScore);
  }),

  // Get all agents with basic info
  getAgents: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.agent.findMany({
      include: {
        _count: {
          select: {
            trainingEvents: true,
            assets: true,
          },
        },
      },
    });
  }),

  // Create a new agent
  createAgent: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.agent.create({
        data: input,
      });
    }),
});

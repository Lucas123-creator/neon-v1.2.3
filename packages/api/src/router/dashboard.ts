import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard KPIs and metrics
  getKPIs: publicProcedure
    .input(
      z.object({
        timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { timeRange } = input;

      // Calculate date range based on timeRange
      const now = new Date();
      const timeRanges = {
        "1h": new Date(now.getTime() - 60 * 60 * 1000),
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      // Mock data for now - replace with real database queries
      const kpis = {
        revenue: { value: 124567, change: 12.5, trend: "up", format: "currency" },
        conversions: { value: 2847, change: 8.2, trend: "up", format: "number" },
        activeAgents: { value: 12, change: 2, trend: "up", format: "number" },
        responseTime: { value: 2.3, change: -15, trend: "down", format: "time" },
      };

      return { kpis, timeRange };
    }),

  // Get agent status and performance
  getAgentStatus: publicProcedure.query(async ({ ctx }) => {
    // Mock agent data - replace with real database queries
    const agents = [
      { 
        id: 1, 
        name: "Content Agent", 
        status: "active", 
        performance: 94, 
        type: "content",
        lastActivity: "2 min ago",
        tasksCompleted: 156,
        efficiency: 98.2
      },
      { 
        id: 2, 
        name: "Email Agent", 
        status: "active", 
        performance: 87, 
        type: "email",
        lastActivity: "1 min ago",
        tasksCompleted: 89,
        efficiency: 92.1
      },
      { 
        id: 3, 
        name: "Support Agent", 
        status: "idle", 
        performance: 92, 
        type: "support",
        lastActivity: "5 min ago",
        tasksCompleted: 234,
        efficiency: 95.7
      },
      { 
        id: 4, 
        name: "Trend Agent", 
        status: "training", 
        performance: 78, 
        type: "trend",
        lastActivity: "10 min ago",
        tasksCompleted: 67,
        efficiency: 88.9
      },
    ];

    return { agents };
  }),

  // Get recent activity
  getRecentActivity: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      // Mock activity data - replace with real database queries
      const activities = [
        { 
          id: 1, 
          type: "campaign", 
          message: "Summer Sale campaign launched", 
          time: "2 min ago",
          icon: "Target",
          color: "neon-blue"
        },
        { 
          id: 2, 
          type: "content", 
          message: "Generated 15 social media posts", 
          time: "5 min ago",
          icon: "FileText",
          color: "neon-purple"
        },
        { 
          id: 3, 
          type: "support", 
          message: "Resolved 8 customer tickets", 
          time: "10 min ago",
          icon: "MessageSquare",
          color: "neon-green"
        },
        { 
          id: 4, 
          type: "trend", 
          message: "Detected viral hashtag trend", 
          time: "15 min ago",
          icon: "TrendingUp",
          color: "neon-pink"
        },
      ];

      return { activities: activities.slice(0, limit) };
    }),

  // Get system health metrics
  getSystemHealth: publicProcedure.query(async ({ ctx }) => {
    // Mock system health data - replace with real monitoring
    const systemHealth = {
      cpu: 23,
      memory: 67,
      storage: 45,
      network: 89
    };

    return { systemHealth };
  }),
});

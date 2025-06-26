import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
  // Get all system settings
  getSystemSettings: publicProcedure
    .input(
      z.object({
        category: z
          .enum(["ai_behavior", "api_keys", "features", "limits"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = input.category ? { category: input.category } : {};

      const settings = await ctx.prisma.setting.findMany({
        where,
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });

      // Group by category
      const grouped = settings.reduce(
        (acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = [];
          }
          acc[setting.category].push(setting);
          return acc;
        },
        {} as Record<string, typeof settings>,
      );

      return grouped;
    }),

  // Update a setting
  updateSetting: publicProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z
          .enum(["string", "number", "boolean", "json", "encrypted"])
          .optional(),
        category: z
          .enum(["ai_behavior", "api_keys", "features", "limits"])
          .optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { key, ...data } = input;

      return await ctx.prisma.setting.upsert({
        where: { key },
        update: data,
        create: {
          key,
          ...data,
          type: data.type || "string",
          category: data.category || "features",
        },
      });
    }),

  // Get feature flags
  getFeatureFlags: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.featureFlag.findMany({
      orderBy: {
        key: "asc",
      },
    });
  }),

  // Toggle feature flag
  toggleFeatureFlag: publicProcedure
    .input(
      z.object({
        key: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.featureFlag.upsert({
        where: { key: input.key },
        update: { enabled: input.enabled },
        create: {
          key: input.key,
          enabled: input.enabled,
        },
      });
    }),

  // Create new feature flag
  createFeatureFlag: publicProcedure
    .input(
      z.object({
        key: z.string(),
        enabled: z.boolean().default(false),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.featureFlag.create({
        data: input,
      });
    }),

  // Get API keys (masked for security)
  listKeys: publicProcedure.query(async ({ ctx }) => {
    const apiKeys = await ctx.prisma.setting.findMany({
      where: {
        category: "api_keys",
      },
      select: {
        id: true,
        key: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiKeys.map((key) => ({
      ...key,
      value: "••••••••", // Mask the actual value
      isSet: true,
    }));
  }),

  // Set encrypted API key
  setApiKey: publicProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, you'd encrypt the value here
      const encryptedValue = Buffer.from(input.value).toString("base64"); // Simple encoding for demo

      return await ctx.prisma.setting.upsert({
        where: { key: input.key },
        update: {
          value: encryptedValue,
          description: input.description,
        },
        create: {
          key: input.key,
          value: encryptedValue,
          type: "encrypted",
          category: "api_keys",
          description: input.description,
        },
      });
    }),

  // Delete a setting
  deleteSetting: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.setting.delete({
        where: { key: input.key },
      });
    }),

  // Get AI behavior settings specifically
  getAIBehaviorSettings: publicProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.setting.findMany({
      where: {
        category: "ai_behavior",
      },
    });

    // Convert to a more usable format with defaults
    const behaviorSettings = {
      temperature: 0.7,
      maxTokens: 1000,
      retryCount: 3,
      fallbackThreshold: 0.5,
      enableFallback: true,
      ...settings.reduce(
        (acc, setting) => {
          let value: any = setting.value;

          // Parse based on type
          switch (setting.type) {
            case "number":
              value = parseFloat(setting.value);
              break;
            case "boolean":
              value = setting.value === "true";
              break;
            case "json":
              try {
                value = JSON.parse(setting.value);
              } catch {
                value = setting.value;
              }
              break;
          }

          acc[setting.key] = value;
          return acc;
        },
        {} as Record<string, any>,
      ),
    };

    return behaviorSettings;
  }),

  // Bulk update AI behavior settings
  updateAIBehaviorSettings: publicProcedure
    .input(
      z.object({
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().min(1).max(4000).optional(),
        retryCount: z.number().min(0).max(10).optional(),
        fallbackThreshold: z.number().min(0).max(1).optional(),
        enableFallback: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates = Object.entries(input).map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "number" : "boolean",
        category: "ai_behavior",
      }));

      const results = await Promise.all(
        updates.map((update) =>
          ctx.prisma.setting.upsert({
            where: { key: update.key },
            update: {
              value: update.value,
              type: update.type,
            },
            create: {
              key: update.key,
              value: update.value,
              type: update.type,
              category: update.category,
            },
          }),
        ),
      );

      return results;
    }),
});

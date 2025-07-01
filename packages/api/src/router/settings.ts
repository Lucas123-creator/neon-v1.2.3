import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
  // Get user settings
  getUserSettings: publicProcedure.query(async ({ ctx }) => {
    // Mock user settings - replace with real database query
    const userSettings = {
      id: 1,
      email: "user@example.com",
      name: "John Doe",
      role: "admin",
      preferences: {
        theme: "dark",
        language: "en",
        timezone: "UTC",
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      integrations: {
        email: {
          provider: "sendgrid",
          apiKey: "***",
          connected: true
        },
        social: {
          twitter: { connected: true, username: "@example" },
          linkedin: { connected: false, username: "" },
          facebook: { connected: true, username: "example" }
        },
        analytics: {
          googleAnalytics: { connected: true, trackingId: "GA-123456" },
          facebookPixel: { connected: false, pixelId: "" }
        }
      },
      billing: {
        plan: "pro",
        status: "active",
        nextBilling: "2024-07-15",
        usage: {
          agents: 4,
          campaigns: 12,
          storage: "2.5GB"
        }
      }
    };

    return { userSettings };
  }),

  // Update user settings
  updateUserSettings: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
        preferences: z.object({
          theme: z.enum(["light", "dark", "auto"]).optional(),
          language: z.string().optional(),
          timezone: z.string().optional(),
          notifications: z.object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
            sms: z.boolean().optional(),
          }).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mock settings update - replace with real database update
      const updatedSettings = {
        id: 1,
        email: "user@example.com",
        name: input.name || "John Doe",
        role: "admin",
        preferences: {
          theme: input.preferences?.theme || "dark",
          language: input.preferences?.language || "en",
          timezone: input.preferences?.timezone || "UTC",
          notifications: {
            email: input.preferences?.notifications?.email ?? true,
            push: input.preferences?.notifications?.push ?? true,
            sms: input.preferences?.notifications?.sms ?? false
          }
        },
        integrations: {
          email: {
            provider: "sendgrid",
            apiKey: "***",
            connected: true
          },
          social: {
            twitter: { connected: true, username: "@example" },
            linkedin: { connected: false, username: "" },
            facebook: { connected: true, username: "example" }
          },
          analytics: {
            googleAnalytics: { connected: true, trackingId: "GA-123456" },
            facebookPixel: { connected: false, pixelId: "" }
          }
        },
        billing: {
          plan: "pro",
          status: "active",
          nextBilling: "2024-07-15",
          usage: {
            agents: 4,
            campaigns: 12,
            storage: "2.5GB"
          }
        }
      };

      return { userSettings: updatedSettings };
    }),

  // Get integration settings
  getIntegrationSettings: publicProcedure.query(async ({ ctx }) => {
    // Mock integration settings - replace with real database query
    const integrations = {
      email: {
        provider: "sendgrid",
        apiKey: "***",
        connected: true,
        status: "active",
        lastSync: "2 min ago"
      },
      social: {
        twitter: { 
          connected: true, 
          username: "@example",
          status: "active",
          lastSync: "5 min ago"
        },
        linkedin: { 
          connected: false, 
          username: "",
          status: "disconnected",
          lastSync: null
        },
        facebook: { 
          connected: true, 
          username: "example",
          status: "active",
          lastSync: "1 min ago"
        }
      },
      analytics: {
        googleAnalytics: { 
          connected: true, 
          trackingId: "GA-123456",
          status: "active",
          lastSync: "10 min ago"
        },
        facebookPixel: { 
          connected: false, 
          pixelId: "",
          status: "disconnected",
          lastSync: null
        }
      }
    };

    return { integrations };
  }),

  // Update integration settings
  updateIntegration: publicProcedure
    .input(
      z.object({
        type: z.enum(["email", "social", "analytics"]),
        provider: z.string(),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { type, provider, config } = input;

      // Mock integration update - replace with real database update
      const updatedIntegration = {
        type,
        provider,
        config,
        connected: true,
        status: "active",
        lastSync: "Just now"
      };

      return { integration: updatedIntegration };
    }),

  // Get billing information
  getBillingInfo: publicProcedure.query(async ({ ctx }) => {
    // Mock billing information - replace with real database query
    const billing = {
      plan: "pro",
      status: "active",
      nextBilling: "2024-07-15",
      amount: 99.00,
      currency: "USD",
      usage: {
        agents: 4,
        campaigns: 12,
        storage: "2.5GB",
        limits: {
          agents: 10,
          campaigns: 50,
          storage: "10GB"
        }
      },
      invoices: [
        {
          id: "INV-001",
          date: "2024-06-15",
          amount: 99.00,
          status: "paid"
        },
        {
          id: "INV-002",
          date: "2024-05-15",
          amount: 99.00,
          status: "paid"
        }
      ]
    };

    return { billing };
  }),

  // Update billing plan
  updateBillingPlan: publicProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "pro", "enterprise"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { plan } = input;

      // Mock billing plan update - replace with real billing update
      const updatedBilling = {
        plan,
        status: "active",
        nextBilling: "2024-07-15",
        amount: plan === "starter" ? 29.00 : plan === "pro" ? 99.00 : 299.00,
        currency: "USD",
        usage: {
          agents: 4,
          campaigns: 12,
          storage: "2.5GB",
          limits: {
            agents: plan === "starter" ? 3 : plan === "pro" ? 10 : 50,
            campaigns: plan === "starter" ? 10 : plan === "pro" ? 50 : 200,
            storage: plan === "starter" ? "5GB" : plan === "pro" ? "10GB" : "100GB"
          }
        }
      };

      return { billing: updatedBilling };
    }),

  // Get system settings
  getSystemSettings: publicProcedure.query(async ({ ctx }) => {
    // Mock system settings - replace with real database query
    const systemSettings = {
      maintenance: {
        enabled: false,
        scheduledTime: "2024-07-01T02:00:00Z",
        duration: "2 hours"
      },
      security: {
        twoFactorAuth: true,
        sessionTimeout: 3600,
        ipWhitelist: ["192.168.1.0/24"]
      },
      performance: {
        cacheEnabled: true,
        compressionEnabled: true,
        cdnEnabled: true
      }
    };

    return { systemSettings };
  }),

  // Update system settings
  updateSystemSettings: publicProcedure
    .input(
      z.object({
        maintenance: z.object({
          enabled: z.boolean().optional(),
          scheduledTime: z.string().optional(),
          duration: z.string().optional(),
        }).optional(),
        security: z.object({
          twoFactorAuth: z.boolean().optional(),
          sessionTimeout: z.number().optional(),
          ipWhitelist: z.array(z.string()).optional(),
        }).optional(),
        performance: z.object({
          cacheEnabled: z.boolean().optional(),
          compressionEnabled: z.boolean().optional(),
          cdnEnabled: z.boolean().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mock system settings update - replace with real database update
      const updatedSystemSettings = {
        maintenance: {
          enabled: input.maintenance?.enabled ?? false,
          scheduledTime: input.maintenance?.scheduledTime || "2024-07-01T02:00:00Z",
          duration: input.maintenance?.duration || "2 hours"
        },
        security: {
          twoFactorAuth: input.security?.twoFactorAuth ?? true,
          sessionTimeout: input.security?.sessionTimeout || 3600,
          ipWhitelist: input.security?.ipWhitelist || ["192.168.1.0/24"]
        },
        performance: {
          cacheEnabled: input.performance?.cacheEnabled ?? true,
          compressionEnabled: input.performance?.compressionEnabled ?? true,
          cdnEnabled: input.performance?.cdnEnabled ?? true
        }
      };

      return { systemSettings: updatedSystemSettings };
    }),
});

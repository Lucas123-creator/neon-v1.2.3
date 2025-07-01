import { createTRPCRouter } from "./trpc";
import { dashboardRouter } from "./dashboard";
import { campaignsRouter } from "./campaigns";
import { contentRouter } from "./content";
import { agentsRouter } from "./agents";
import { analyticsRouter } from "./analytics";
import { settingsRouter } from "./settings";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  campaigns: campaignsRouter,
  content: contentRouter,
  agents: agentsRouter,
  analytics: analyticsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

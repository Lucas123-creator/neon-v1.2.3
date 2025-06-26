import { createTRPCRouter } from "./trpc";
import { trainingRouter } from "./router/training";
import { assetsRouter } from "./router/assets";
import { settingsRouter } from "./router/settings";

export const appRouter = createTRPCRouter({
  training: trainingRouter,
  assets: assetsRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;

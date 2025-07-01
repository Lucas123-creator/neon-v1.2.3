import { createRouter } from "./trpc";
import { trainingRouter } from "./router/training";
import { assetsRouter } from "./router/assets";
import { settingsRouter } from "./router/settings";
import { insightsRouter } from "./router/insights";
import { labRouter } from "./router/lab";
import { feedbackRouter } from "./router/feedback";

export const appRouter = createRouter({
  training: trainingRouter,
  assets: assetsRouter,
  settings: settingsRouter,
  insights: insightsRouter,
  lab: labRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;

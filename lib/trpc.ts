// Mock tRPC setup for development
// This will be replaced with real tRPC integration later

import { createTRPCReact } from '@trpc/react-query';

// Define a basic AppRouter type for now to avoid conflicts
export type AppRouter = {
  training: any;
  assets: any;
  settings: any;
  insights: any;
  lab: any;
  feedback: any;
};

export const api = createTRPCReact<AppRouter>(); 
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "../../../packages/api/src/router";

export const trpc = createTRPCReact<AppRouter>();

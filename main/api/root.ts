import { createTRPCRouter } from "./trpc";
import { trackRouter } from "./routers/track-router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: trackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

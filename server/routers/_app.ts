// server/routers/_app.ts

import { router } from '../trpc';
import { postRouter } from './post';
import { categoryRouter } from './category'; // 1. Import the category router

// This is the main router for your entire app.
export const appRouter = router({
  post: postRouter,
  category: categoryRouter, // 2. Add the category router here
});

// Export type definition of API
export type AppRouter = typeof appRouter;
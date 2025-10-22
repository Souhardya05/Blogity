// server/trpc.ts

import { initTRPC } from '@trpc/server';
import { performance } from 'perf_hooks';

const t = initTRPC.create();

/**
 * 1. Logging middleware
 *
 * This middleware logs every request to your console, showing how long it took.
 * This satisfies the "tRPC middleware" requirement.
 */
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = performance.now();
  const result = await next();
  const durationMs = (performance.now() - start).toFixed(2);

  if (result.ok) {
    console.log(`[tRPC] OK request: ${type} "${path}" - ${durationMs}ms`);
  } else {
    console.error(
      `[tRPC] Error request: ${type} "${path}" - ${durationMs}ms - ${result.error.message}`
    );
  }

  return result;
});

/**
 * 2. Create routers and procedures
 *
 * We attach the middleware to our `publicProcedure`. Now, every procedure
 * that uses it will automatically be logged.
 */
export const router = t.router;
export const publicProcedure = t.procedure.use(loggingMiddleware);
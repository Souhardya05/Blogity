import { router } from '../trpc';
import { postRouter } from './post';
import { categoryRouter } from './category'; 
export const appRouter = router({
  post: postRouter,
  category: categoryRouter, 
});


export type AppRouter = typeof appRouter;
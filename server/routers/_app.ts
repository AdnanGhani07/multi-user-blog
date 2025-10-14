import { router } from '../trpc';
import { postsRouter } from './posts';
import { categoriesRouter } from './categories';
// When you create more routers (e.g., for users), you'll import them here.


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 *
 * It combines all your sub-routers into a single API, namespacing them
 * for clarity on the client-side. For example, procedures from `postsRouter`
 * will be available under `trpc.posts.someProcedure`.
 */
export const appRouter = router({
  posts: postsRouter,
  categories: categoriesRouter,
});

// Export only the TYPE of the router.
// This is crucial for providing end-to-end type safety and autocompletion
// on the client-side, without exposing any server-side logic.
export type AppRouter = typeof appRouter;

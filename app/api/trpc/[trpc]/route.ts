import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';

/**
 * This is the Next.js App Router handler that exposes your tRPC API.
 *
 * It uses a generic handler function that is compatible with the Web Fetch API,
 * which is what Next.js Route Handlers are built on.
 *
 * @param req The incoming HTTP request from the client.
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    /**
     * This function creates the context for every single API request.
     * The context is where you can pass down things like database connections,
     * authentication status, and other request-specific data to your tRPC procedures.
     */
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            );
          }
        : undefined,
  });

// tRPC can handle both GET and POST requests.
// We export the same handler for both methods to cover all tRPC operations.
// - GET is typically used for queries.
// - POST is typically used for mutations.
export { handler as GET, handler as POST };

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/routers/_app';

// This is the typed client hook we'll use in our components.
export const trpc = createTRPCReact<AppRouter>({});
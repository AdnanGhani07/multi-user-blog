import { initTRPC } from '@trpc/server';
import { db } from '@/db'; // <-- This now correctly points to the root `db` folder

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
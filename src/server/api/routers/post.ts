import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  // The app does not currently have a 'Post' Prisma model. Keep the endpoints
  // for demo purposes but return null / stub data to avoid runtime errors.
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement real Post model or remove this route
      return { id: "stub", name: input.name, createdById: ctx.auth.userId };
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    // No posts table — return null
    return null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

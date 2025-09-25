import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { answerQuestion } from "@/server/qa";
import { z } from "zod";

export const qaRouter = createTRPCRouter({
    ask: protectedProcedure.input(z.object({ projectId: z.string(), question: z.string() })).mutation(async ({ input, ctx }) => {
        const project = await ctx.db.project.findUnique({ where: { id: input.projectId } });
        if (!project) throw new Error("Project not found");

        const { answer, citations } = await answerQuestion(input.projectId, input.question);

        // Save answer
        const saved = await ctx.db.answer.create({
            data: {
                question: input.question,
                answer,
                citations: JSON.stringify(citations),
                // set foreign keys directly to match Prisma schema
                projectId: project.id,
                createdById: ctx.auth.userId ?? undefined,
            },
        });

        return { answer: saved };
    }),

    list: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ input, ctx }) => {
        const answers = await ctx.db.answer.findMany({ where: { projectId: input.projectId } });
        return answers;
    }),
});

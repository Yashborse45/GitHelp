import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listRepoFiles } from "@/server/github";
import { ingestFilesToPinecone } from "@/server/rag";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ name: z.string(), repoUrl: z.string(), token: z.string().optional() }))
        .mutation(async ({ input, ctx }) => {
            // Parse owner/repo from URL (naive)
            const url = input.repoUrl.replace(/\.git$/, "");
            const parts = url.split("/").filter(Boolean);
            const owner = parts[parts.length - 2];
            const repo = parts[parts.length - 1];

            if (!owner || !repo) {
                throw new Error("Invalid repository URL. Expected format: https://github.com/owner/repo");
            }

            // Now that we've validated owner/repo are present, TypeScript can treat them as strings
            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    repoUrl: input.repoUrl,
                    repoOwner: owner as string,
                    repoName: repo as string,
                    githubToken: input.token,
                    ownerId: ctx.auth.userId,
                },
            });

            return project;
        }),

    ingest: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const project = await ctx.db.project.findUnique({ where: { id: input.projectId } });
            if (!project) throw new Error("Project not found");

            // Already filtered (github.ts applies shouldIgnore & size guard). These are the files we will process.
            const files = await listRepoFiles(project.repoOwner, project.repoName, project.githubToken || undefined);
            const totalFiles = files.length;

            const { processedFiles } = await ingestFilesToPinecone(files, project.id);

            return { ok: true, totalFiles, processedFiles };
        }),

    // Preflight to get total filtered files before kicking off ingestion so UI can show "Processing X files..."
    ingestPlan: protectedProcedure
        .input(z.object({ projectId: z.string() }))
        .query(async ({ input, ctx }) => {
            const project = await ctx.db.project.findUnique({ where: { id: input.projectId } });
            if (!project) throw new Error("Project not found");
            const files = await listRepoFiles(project.repoOwner, project.repoName, project.githubToken || undefined);
            return { totalFiles: files.length };
        }),

    list: protectedProcedure.query(async ({ ctx }) => {
        const projects = await ctx.db.project.findMany({ where: { ownerId: ctx.auth.userId } });
        return projects;
    }),
});

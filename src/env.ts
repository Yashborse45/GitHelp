import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const dev = process.env.NODE_ENV !== "production";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        CLERK_SECRET_KEY: dev ? z.string().optional() : z.string(),
        CLERK_PUBLISHABLE_KEY: dev ? z.string().optional() : z.string(),
        PINECONE_API_KEY: dev ? z.string().optional() : z.string(),
        PINECONE_ENV: dev ? z.string().optional() : z.string(),
        PINECONE_INDEX: z.string().optional(),
        GEMINI_API_KEY: dev ? z.string().optional() : z.string(),
        GCP_PROJECT: z.string().optional(),
        GEMINI_LOCATION: z.string().optional(),
        GEMINI_EMBEDDING_MODEL: z.string().optional(),
        GEMINI_CHAT_MODEL: z.string().optional(),
        GITHUB_TOKEN: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: dev ? z.string().optional() : z.string(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        PINECONE_API_KEY: process.env.PINECONE_API_KEY,
        PINECONE_ENV: process.env.PINECONE_ENV,
        PINECONE_INDEX: process.env.PINECONE_INDEX,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        GCP_PROJECT: process.env.GCP_PROJECT,
        GEMINI_LOCATION: process.env.GEMINI_LOCATION,
        GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL,
        GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});

export const isDev = env.NODE_ENV === "development";

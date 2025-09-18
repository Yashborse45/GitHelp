GitHelp RAG / Ingestion Developer Notes

Overview
- Backend: Next.js (T3 stack), Prisma (Supabase), tRPC
- RAG: OpenAI embeddings + LLM (placeholder), Pinecone vector DB
- GitHub ingestion: Octokit

Files added
- prisma/schema.prisma: Project, Commit, Answer models
- src/server/github.ts: GitHub listing + file fetch helpers
- src/server/rag.ts: chunking + embeddings + Pinecone upsert
- src/server/qa.ts: retrieval + LLM answer generation
- src/server/api/routers/project.ts: create/project ingestion endpoints
- src/server/api/routers/qa.ts: ask/list answers
- src/pages/projects/[id].tsx: frontend project UI
- src/components/create-project.tsx: project creation form

Required env vars
- DATABASE_URL (Postgres / Supabase)
- GITHUB_TOKEN (optional, or pass per project)
- OPENAI_API_KEY
- PINECONE_API_KEY
- PINECONE_ENV
- PINECONE_INDEX

Quick local steps
1. Install packages: npm install
2. Generate Prisma client & migrate:
   npx prisma generate
   npx prisma migrate dev --name add_projects_commits_answers
3. Start dev server:
   npm run dev

Notes
- The RAG and QA code uses the OpenAI and Pinecone SDKs — ensure they're installed and env vars set. The code is intended as a starting point and may need batching/robustness improvements for large repos.
- When deploying to Vercel, set env vars in the project settings and ensure your Supabase database is accessible.

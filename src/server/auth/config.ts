/**
 * This project migrated from NextAuth to Clerk for authentication. This file previously
 * exported a NextAuth config object; that's no longer needed. Keep a lightweight
 * helper here for server code that previously relied on NextAuth types.
 *
 * If you need to map Clerk users to a Prisma `User` row, implement that logic in
 * src/server/auth/withClerkUser.ts (or similar). For now, keep this file as a no-op
 * placeholder to avoid leftover imports causing type errors.
 */

// Placeholder export – other parts of the codebase import `authConfig`; keep the
// symbol but make it inert. Replace or remove usages across the codebase as we
// finish the Clerk migration.
export const authConfig: Record<string, unknown> = {};

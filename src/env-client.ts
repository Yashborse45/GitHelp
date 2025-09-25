// Client-safe environment accessor. Only export NEXT_PUBLIC_* vars here.
// Prevent importing server-only secrets into the browser bundle.

export const clientEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
} as const;

export function assertClientEnv() {
    if (!clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        // Non-fatal: warn in dev so auth pages can show a friendly message.
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('[env-client] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
        }
    }
    return clientEnv;
}

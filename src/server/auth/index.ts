import { auth as clerkAuth } from "@clerk/nextjs/server";

// Simple wrapper that mirrors the previous `auth()` usage. Clerk's server `auth()` returns
// an object with userId and sessionId when a user is authenticated.
export const auth = async () => {
    // clerkAuth is synchronous and reads cookies; return a small object for compatibility
    const res = clerkAuth();
    return res;
};

export { clerkAuth as handlers };

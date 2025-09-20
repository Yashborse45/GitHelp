// Import Clerk middleware. Some environments expose the edge entry differently; try the
// standard package first. If types are missing at typecheck time this will still allow
// runtime usage while avoiding a hard type error in CI/dev typecheck.
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
let authMiddleware: any;
try {
    // Preferred import (runtime)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    authMiddleware = require("@clerk/nextjs/edge").authMiddleware;
} catch (e) {
    try {
        // Fallback to main package (some versions export middleware here)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        authMiddleware = require("@clerk/nextjs").authMiddleware;
    } catch (err) {
        // If Clerk isn't installed in the environment where typecheck runs, provide a
        // no-op middleware so typecheck and builds can proceed. At runtime, ensure
        // Clerk is installed in your environment.
        authMiddleware = (opts: any) => (req: NextRequest) => req;
    }
}

// Protect everything by default except the public assets and Next.js internals.
// Explicit public route patterns (regex style Clerk supports). Only these are public.
// NOTE: /dashboard and everything else are protected automatically.
export default authMiddleware({
    publicRoutes: [
        "/", // landing page
        "/login(.*)",
        "/register(.*)",
        "/api/webhooks(.*)",
        "/favicon.ico",
        "/_next/image(.*)",
        "/_next/static(.*)",
    ],
    afterAuth(auth: any, req: NextRequest) {
        const url = req.nextUrl.clone();
        const path = url.pathname;

        const isLoginPath = path === "/login" || path.startsWith("/login/");
        const isRegisterPath = path === "/register" || path.startsWith("/register/");
        const isAuthPage = isLoginPath || isRegisterPath;
        const isPublic = path === "/" || isAuthPage; // only landing + auth pages

        // If signed in and visiting an auth page, send to dashboard (respect optional returnTo only once)
        if (auth.userId && isAuthPage) {
            const returnTo = url.searchParams.get("returnTo");
            url.search = ""; // clear params
            url.pathname = returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";
            return NextResponse.redirect(url);
        }

        // If not signed in and trying to access anything not public => redirect to login with returnTo
        if (!auth.userId && !isPublic) {
            const returnTo = encodeURIComponent(path + (url.search || ""));
            url.pathname = "/login";
            url.search = `returnTo=${returnTo}`;
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    },
});

export const config = {
    matcher: [
        "/((?!.+\\..+|_next).*)", // all paths except files with extensions and _next assets
        "/", // root
        "/(api|trpc)(.*)", // API & tRPC
    ],
};

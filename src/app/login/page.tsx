"use client"

import { clientEnv } from "@/env-client";
import { useToast } from "@/hooks/use-toast";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LoginPage() {
  const search = useSearchParams();
  const { toast } = useToast();
  const shownRef = useRef(false);

  const returnTo = search?.get("returnTo");

  useEffect(() => {
    if (returnTo && !shownRef.current) {
      shownRef.current = true;
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view that page.",
      });
    }
  }, [returnTo, toast]);

  const missingKey = !clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (missingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-sm text-destructive max-w-sm">
          Clerk publishable key missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.local and restart the dev server.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <SignIn
          redirectUrl={returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard"}
          routing="hash"
        />
      </div>
    </div>
  );
}

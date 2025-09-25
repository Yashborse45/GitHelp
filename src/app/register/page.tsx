"use client"

import { clientEnv } from "@/env-client";
import { useToast } from "@/hooks/use-toast";
import { SignUp } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function RegisterPage() {
  const { toast } = useToast();
  const shownRef = useRef(false);

  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true;
      toast({ title: "Create your account" });
    }
  }, [toast]);

  if (!clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
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
        <SignUp
          redirectUrl="/dashboard"
          routing="hash"
        />
      </div>
    </div>
  );
}

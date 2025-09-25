"use client"

import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

import { DashboardContent } from "@/components/dashboard-content"
import { Sidebar } from "@/components/sidebar"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  // Client-side guard to avoid any flash of protected content if server redirect is bypassed momentarily.
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      })
      router.replace("/login")
    }
  }, [isLoaded, isSignedIn, router, toast])

  // While auth state resolving OR redirecting, render minimal placeholder (no protected data).
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Checking authentication...
      </div>
    )
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-background" />
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-gradient-primary opacity-3 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-primary opacity-5 rounded-full blur-3xl" />

      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
      />

      <main className="flex-1 overflow-auto relative z-10 bg-background/80 backdrop-blur-sm">
        <DashboardContent activeView={activeView} selectedProject={selectedProject} />
      </main>
    </div>
  )
}

"use client"

import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { DashboardContent } from "@/components/dashboard-content"
import { Sidebar } from "@/components/sidebar"
import { api } from "@/trpc/react"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [userTouchedSelection, setUserTouchedSelection] = useState(false)
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const {
    data: projectsData,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
    refetch: refetchProjects,
  } = api.project.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  const projects = useMemo(() => projectsData ?? [], [projectsData])
  const combinedProjectsLoading = projectsLoading || projectsFetching

  const handleProjectChange = useCallback(
    (projectId: string | null) => {
      setUserTouchedSelection(true)
      setSelectedProjectId(projectId)
    },
    [setSelectedProjectId],
  )

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

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId(null)
      return
    }

    if (!userTouchedSelection && !selectedProjectId) {
      setSelectedProjectId(projects[0]?.id ?? null)
      return
    }

    if (selectedProjectId && !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? null)
    }
  }, [projects, selectedProjectId, userTouchedSelection])

  const handleProjectCreated = useCallback(
    async (projectId: string) => {
      setUserTouchedSelection(true)
      setSelectedProjectId(projectId)
      setActiveView("dashboard")
      await refetchProjects()
    },
    [refetchProjects],
  )

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
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChange}
        projects={projects}
        projectsLoading={combinedProjectsLoading}
        onRefreshProjects={() => void refetchProjects()}
      />

      <main className="flex-1 overflow-auto relative z-10 bg-background/80 backdrop-blur-sm">
        <DashboardContent
          activeView={activeView}
          selectedProjectId={selectedProjectId}
          projects={projects}
          projectsLoading={combinedProjectsLoading}
          onProjectCreated={handleProjectCreated}
          onChangeView={setActiveView}
        />
      </main>
    </div>
  )
}

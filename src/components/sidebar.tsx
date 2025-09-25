"use client"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  selectedProjectId: string | null
  onProjectChange: (projectId: string | null) => void
  projects: Array<{ id: string; name: string }>
  projectsLoading?: boolean
  onRefreshProjects?: () => void
}

export function Sidebar({
  activeView,
  onViewChange,
  selectedProjectId,
  onProjectChange,
  projects,
  projectsLoading,
  onRefreshProjects,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleDashboardClick = () => {
    onViewChange("dashboard")
  }

  const handleDashboardDoubleClick = () => {
    if (activeView === "dashboard") {
      onViewChange("")
    }
  }

  const handleQAClick = () => {
    onViewChange("qa")
  }

  const handleQADoubleClick = () => {
    if (activeView === "qa") {
      onViewChange("")
    }
  }

  const handleProjectClick = (projectId: string) => {
    if (selectedProjectId === projectId) {
      onProjectChange(null)
    } else {
      onProjectChange(projectId)
    }
  }

  return (
    <div
      className={cn(
        "border-r border-border bg-background flex flex-col h-screen relative z-20 shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            {!isCollapsed && <span className="text-xl font-bold text-foreground">GitHelp</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <nav className="space-y-2">
          <button
            onClick={handleDashboardClick}
            onDoubleClick={handleDashboardDoubleClick}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
              activeView === "dashboard" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
            )}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
          </button>

          <button
            onClick={handleQAClick}
            onDoubleClick={handleQADoubleClick}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
              activeView === "qa" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
            )}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Q&A</span>}
          </button>
        </nav>
      </div>

      {/* Projects List */}
      {!isCollapsed && (
        <div className="flex-1 px-4">
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Your Projects</h3>
              {onRefreshProjects && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={projectsLoading}
                  onClick={() => onRefreshProjects?.()}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8 8 0 006.582 9H4m16 11v-5h-.581M4.063 14a8 8 0 0013.356 2H20"
                    />
                  </svg>
                  <span className="sr-only">Refresh projects</span>
                </Button>
              )}
            </div>
            <div className="space-y-1">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)
              ) : projects.length ? (
                projects.map((project) => {
                  const initial = project.name?.trim()?.[0]?.toUpperCase() ?? "?"
                  const isSelected = selectedProjectId === project.id
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-2",
                        "hover:bg-muted hover:text-foreground",
                        isSelected ? "bg-primary text-primary-foreground" : "text-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center text-xs font-medium flex-shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {initial}
                      </div>
                      <span className="truncate">{project.name}</span>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/80">No projects yet</p>
                  <p className="mt-1">Create a project to start ingesting a repository.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        {!isCollapsed && (
          <Button
            onClick={() => onViewChange("create-project")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </Button>
        )}

        {/* User Profile */}
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.imageUrl || "/placeholder.svg?height=32&width=32"}
                    alt={user?.fullName || user?.username || "User"}
                  />
                  <AvatarFallback>
                    {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {!isLoaded ? "Loading..." : user?.fullName || user?.username || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {!isLoaded
                      ? "Fetching user…"
                      : user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={async () => {
                        try {
                          await signOut({ redirectUrl: "/" })
                        } catch (e) {
                          console.error("Sign out failed", e)
                          router.push("/")
                        }
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                        />
                      </svg>
                      {isSignedIn ? "Log Out" : "Sign In"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.imageUrl || "/placeholder.svg?height=32&width=32"}
                  alt={user?.fullName || user?.username || "User"}
                />
                <AvatarFallback>
                  {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

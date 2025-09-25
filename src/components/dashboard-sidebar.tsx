"use client"

import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  return (
    <div className="w-64 bg-background border-r border-border flex flex-col h-screen">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <h1 className="text-xl font-bold text-foreground">GitHelp</h1>
        </div>
      </div>

      <div className="p-4">
        <nav className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md bg-primary text-primary-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v6" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">Q&A</span>
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + Create Project
        </Button>
      </div>
    </div>
  )
}

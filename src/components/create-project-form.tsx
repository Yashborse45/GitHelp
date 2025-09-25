"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { RouterOutputs } from "@/trpc/react"
import { api } from "@/trpc/react"
import { useMemo, useState } from "react"

interface CreateProjectFormProps {
  onSuccess?: (project: RouterOutputs["project"]["create"]) => void | Promise<void>
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const { toast } = useToast()

  const squares = useMemo(() => Array.from({ length: 16 }, () => Math.random() > 0.3), [])

  const createProject = api.project.create.useMutation({
    onSuccess: async (project) => {
      toast({
        title: "Project linked",
        description: `${project.name} is now connected to GitHub. Trigger an ingestion to start answering questions.`,
      })
      setProjectName("")
      setGithubUrl("")
      setGithubToken("")
      if (onSuccess) {
        await onSuccess(project)
      }
    },
    onError: (error) => {
      toast({
        title: "Unable to create project",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const isSubmitting = createProject.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = projectName.trim()
    const trimmedUrl = githubUrl.trim()
    const trimmedToken = githubToken.trim()

    if (!trimmedName || !trimmedUrl) {
      toast({
        title: "Missing information",
        description: "Please provide a project name and GitHub repository URL.",
        variant: "destructive",
      })
      return
    }

    createProject.mutate({
      name: trimmedName,
      repoUrl: trimmedUrl,
      token: trimmedToken ? trimmedToken : undefined,
    })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full flex items-center gap-16">
        {/* Illustration */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            {/* Person illustration */}
            <div className="relative">
              {/* Head */}
              <div className="w-16 h-16 bg-pink-300 rounded-full relative mb-4 mx-auto">
                {/* Hair */}
                <div className="absolute -top-2 -left-2 w-20 h-12 bg-primary rounded-full"></div>
              </div>

              {/* Laptop */}
              <div className="w-32 h-20 bg-gray-700 rounded-lg relative mx-auto">
                {/* Screen */}
                <div className="w-28 h-16 bg-gray-800 rounded-t-lg absolute top-1 left-2">
                  <div className="w-3 h-3 bg-primary rounded-full absolute top-6 left-12"></div>
                </div>
                {/* Base */}
                <div className="w-36 h-4 bg-gray-600 rounded-lg absolute -bottom-2 -left-2"></div>
              </div>
            </div>

            {/* Blue squares pattern */}
            <div className="absolute -right-8 top-0">
              <div className="grid grid-cols-4 gap-1">
                {squares.map((isPrimary, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${isPrimary ? "bg-primary" : "bg-primary/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Link your GitHub Repository</h1>
            <p className="text-muted-foreground">Enter the URL of your repository to link it to GitHelp.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-sm font-medium">
                Project Name
              </Label>
              <Input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full"
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="text-sm font-medium">
                Github URL
              </Label>
              <Input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full"
                placeholder="https://github.com/username/repository"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubToken" className="text-sm font-medium">
                GitHub Token (Optional)
              </Label>
              <Input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full"
                placeholder="Enter your GitHub token"
              />
              <p className="text-xs text-muted-foreground">
                Provide a personal access token if the repository is private. GitHelp never stores it in plain text.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
            >
              {isSubmitting ? "Linking…" : "Create project"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

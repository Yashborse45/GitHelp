"use client"

import { useEffect, useMemo, useState, type KeyboardEvent } from "react"

import { CreateProjectForm } from "@/components/create-project-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { RouterOutputs } from "@/trpc/react"
import { api } from "@/trpc/react"

interface DashboardContentProps {
  activeView: string
  selectedProjectId: string | null
  projects: Project[]
  projectsLoading: boolean
  onProjectCreated: (projectId: string) => void | Promise<void>
  onChangeView: (view: string) => void
}

type Project = RouterOutputs["project"]["list"][number]
type SavedAnswer = RouterOutputs["qa"]["list"][number]
type AskAnswer = RouterOutputs["qa"]["ask"]["answer"]

export function DashboardContent({
  activeView,
  selectedProjectId,
  projects,
  projectsLoading,
  onProjectCreated,
  onChangeView,
}: DashboardContentProps) {
  const [question, setQuestion] = useState("")

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  )

  const {
    data: savedAnswersData,
    isLoading: savedAnswersLoading,
    isFetching: savedAnswersFetching,
    refetch: refetchSavedAnswers,
  } = api.qa.list.useQuery(
    { projectId: selectedProjectId ?? "" },
    { enabled: Boolean(selectedProjectId) },
  )

  const savedAnswers = savedAnswersData ?? []
  const answersLoading = savedAnswersLoading || savedAnswersFetching

  const qaMutation = api.qa.ask.useMutation({
    onSuccess: async () => {
      await refetchSavedAnswers()
    },
  })

  useEffect(() => {
    qaMutation.reset()
    setQuestion("")
  }, [selectedProjectId, qaMutation])

  const isAsking = qaMutation.isPending
  const latestAnswer = qaMutation.data?.answer
  const askError = qaMutation.error?.message

  const handleAsk = () => {
    if (!selectedProjectId || !question.trim()) return
    qaMutation.mutate({ projectId: selectedProjectId, question: question.trim() })
  }

  const handleQuestionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleAsk()
    }
  }

  if (activeView === "create-project") {
    return (
      <CreateProjectForm
        onSuccess={async (project) => {
          await onProjectCreated(project.id)
        }}
      />
    )
  }

  if (projectsLoading && !projects.length) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!projectsLoading && !projects.length) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">You don&apos;t have any projects yet</h2>
          <p className="mt-2 max-w-sm text-sm">
            Connect a GitHub repository to start ingesting commits and asking GitHelp questions about your codebase.
          </p>
          <Button className="mt-6" onClick={() => onChangeView("create-project")}>
            Create a project
          </Button>
        </div>
      </div>
    )
  }

  if (activeView === "qa") {
    if (!selectedProject) {
      return <SelectProjectEmptyState onCreateProject={() => onChangeView("create-project")} />
    }

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
          <ProjectHeader project={selectedProject} />
          <AskSection
            project={selectedProject}
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            onQuestionKeyDown={handleQuestionKeyDown}
            disableAsk={!question.trim() || !selectedProjectId || isAsking}
            isAsking={isAsking}
            errorMessage={askError}
            latestAnswer={latestAnswer}
          />
          <section className="space-y-4">
            <header>
              <h2 className="text-lg font-semibold text-foreground">Saved questions</h2>
              <p className="text-sm text-muted-foreground">
                Every answer is stored so your team can revisit helpful context later.
              </p>
            </header>
            <SavedAnswersList answers={savedAnswers} isLoading={answersLoading} />
          </section>
        </div>
      </div>
    )
  }

  if ((activeView === "dashboard" || (!activeView && selectedProject)) && selectedProject) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
          <ProjectHeader project={selectedProject} />
          <AskSection
            project={selectedProject}
            question={question}
            onQuestionChange={setQuestion}
            onAsk={handleAsk}
            onQuestionKeyDown={handleQuestionKeyDown}
            disableAsk={!question.trim() || !selectedProjectId || isAsking}
            isAsking={isAsking}
            errorMessage={askError}
            latestAnswer={latestAnswer}
          />
          <section className="space-y-4">
            <header>
              <h2 className="text-lg font-semibold text-foreground">Recent answers</h2>
              <p className="text-sm text-muted-foreground">A quick snapshot of the latest GitHelp conversations.</p>
            </header>
            <SavedAnswersList answers={savedAnswers} isLoading={answersLoading} limit={3} />
          </section>
        </div>
      </div>
    )
  }

  return <SelectProjectEmptyState onCreateProject={() => onChangeView("create-project")} />
}

interface AskSectionProps {
  project: Project
  question: string
  onQuestionChange: (value: string) => void
  onAsk: () => void
  onQuestionKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  disableAsk: boolean
  isAsking: boolean
  errorMessage?: string
  latestAnswer?: AskAnswer
}

function AskSection({
  project,
  question,
  onQuestionChange,
  onAsk,
  onQuestionKeyDown,
  disableAsk,
  isAsking,
  errorMessage,
  latestAnswer,
}: AskSectionProps) {
  const placeholder = `Ask something about ${project.name || "this repo"}…`

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Ask a question</h1>
        <p className="text-sm text-muted-foreground">
          GitHelp searches the ingested repository along with recent commits to craft an answer.
        </p>
      </div>
      <div className="space-y-2">
        <Input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={onQuestionKeyDown}
          placeholder={placeholder}
          className="w-full max-w-2xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onAsk} disabled={disableAsk} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isAsking ? "Thinking…" : "Ask GitHelp!"}
          </Button>
          {errorMessage && <span className="text-sm text-destructive">{errorMessage}</span>}
        </div>
      </div>
      {(isAsking || latestAnswer) && (
        <div className="rounded-md border border-border bg-card/60 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold text-foreground">Answer</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {isAsking ? "Generating…" : latestAnswer?.answer || ""}
          </p>
          <CitationsList citationsJson={latestAnswer?.citations ?? null} />
        </div>
      )}
    </section>
  )
}

function ProjectHeader({ project }: { project: Project }) {
  return (
    <Alert className="border-primary/20 bg-primary/10 dark:border-primary/70 dark:bg-primary/5">
      <AlertTitle className="text-sm font-semibold text-primary-foreground/90">
        {project.name} is connected to GitHub
      </AlertTitle>
      <AlertDescription className="text-sm text-primary-foreground/80">
        {project.repoOwner}/{project.repoName}
      </AlertDescription>
    </Alert>
  )
}

interface SavedAnswersListProps {
  answers: SavedAnswer[]
  isLoading: boolean
  limit?: number
}

function SavedAnswersList({ answers, isLoading, limit }: SavedAnswersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit ?? 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const items = typeof limit === "number" ? answers.slice(0, limit) : answers

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No questions have been asked for this project yet.</p>
  }

  return (
    <div className="space-y-4">
      {items.map((answer) => {
        const preview = truncate(answer.answer, 280)
        const createdAt = formatAnswerTimestamp(answer.createdAt)
        return (
          <article
            key={answer.id}
            className="rounded-lg border border-border bg-card/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{answer.question}</h3>
              {createdAt && <span className="text-xs text-muted-foreground">{createdAt}</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{preview}</p>
            <CitationsList citationsJson={answer.citations} />
          </article>
        )
      })}
    </div>
  )
}

function SelectProjectEmptyState({ onCreateProject }: { onCreateProject?: () => void }) {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">Select a project to get started</h2>
        <p className="mt-2 max-w-sm text-sm">
          Choose a repository from the sidebar or create a new project to ingest a GitHub repo.
        </p>
        {onCreateProject && (
          <Button className="mt-4" onClick={onCreateProject}>
            Create a project
          </Button>
        )}
      </div>
    </div>
  )
}

function CitationsList({ citationsJson }: { citationsJson: string | null }) {
  if (!citationsJson) return null

  let parsed: Array<{ path: string; chunkIndex: number; excerpt?: string }> = []
  try {
    parsed = JSON.parse(citationsJson)
  } catch (error) {
    console.warn("Unable to parse citations", error)
    return null
  }

  if (!parsed.length) return null

  return (
    <div className="mt-3 space-y-1 text-xs font-mono text-muted-foreground/80">
      <h4 className="font-semibold uppercase tracking-wide text-[0.65rem] text-muted-foreground">Citations</h4>
      {parsed.map((citation, index) => (
        <div key={`${citation.path}-${citation.chunkIndex}-${index}`} className="truncate">
          <span className="text-foreground/80">{citation.path}</span>
          <span className="text-muted-foreground">#{citation.chunkIndex}</span>
          {citation.excerpt && <span className="ml-1 text-muted-foreground/70">- {truncate(citation.excerpt, 80)}</span>}
        </div>
      ))}
    </div>
  )
}

function truncate(value: string | null | undefined, limit: number) {
  if (!value) return ""
  if (value.length <= limit) return value
  return `${value.slice(0, limit - 1)}…`
}

function formatAnswerTimestamp(value: Date | string | null | undefined) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleString()
}

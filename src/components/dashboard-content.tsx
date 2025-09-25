"use client"

import { CommitCard } from "@/components/commit-card"
import { CreateProjectForm } from "@/components/create-project-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/trpc/react"
import { useState } from "react"

// Mock commit data
const mockCommits = [
  {
    author: "Yash Borse",
    message: "Add support for more LLM models",
    pullRequest: "#186",
    changes: [
      "+ Added support for AWS Bedrock models.",
      "+ Added support for GPT-4 variants gpt-4o and gpt-4-turbo.",
    ],
    timestamp: "about 1 year ago",
  },
  {
    author: "Yash Borse",
    message: "Update README.md",
    changes: ["+ Added a test change to the README file."],
    timestamp: "about 1 year ago",
  },
  {
    author: "Elliott Chong",
    message: "Merge pull request #25 from nicoletto-dev/main Update typos on homepage",
    changes: ["+ Fixed a typo in the marketing text of the homepage."],
    timestamp: "about 1 year ago",
  },
]

const savedQuestions = [
  {
    id: 1,
    question: "Where do I change the pdf loading logic?",
    timestamp: "10/17/2024",
    preview:
      "You're looking to change how the PDF is loaded, right? Let's dive into the code! The 'PDFViewer' component currently uses Google Docs Viewer to...",
    author: "John Doe",
  },
  {
    id: 2,
    question: "How do I add authentication to my app?",
    timestamp: "10/16/2024",
    preview:
      "To add authentication, you'll want to use a library like NextAuth.js or implement your own auth system. Here's how to get started...",
    author: "Jane Smith",
  },
]

interface DashboardContentProps {
  activeView: string
  selectedProject: number | null
}

export function DashboardContent({ activeView, selectedProject }: DashboardContentProps) {
  // Local state for Q&A interaction
  const [question, setQuestion] = useState("")
  const [showAnswerBox, setShowAnswerBox] = useState(false)
  const qaMutation = api.qa.ask.useMutation({
    onSuccess: () => setShowAnswerBox(true),
  })

  const loading = qaMutation.status === "pending"
  const error = qaMutation.status === "error" ? qaMutation.error : null

  const handleAsk = () => {
    if (!selectedProject || !question.trim()) return
    qaMutation.mutate({ projectId: String(selectedProject), question })
  }

  if (activeView === "create-project") {
    return <CreateProjectForm />
  }

  if (activeView === "qa") {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ask a question</h1>
          <div className="mb-4 w-full max-w-2xl space-y-2">
            <Input
              placeholder="Ask something about this repo..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAsk()
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                disabled={!question.trim() || loading || !selectedProject}
                onClick={handleAsk}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Thinking..." : "Ask GitHelp!"}
              </Button>
              {error && <span className="text-destructive text-sm">{error.message}</span>}
            </div>
            {showAnswerBox && (
              <div className="mt-4 border border-border rounded-md p-4 bg-card/50 backdrop-blur">
                <h3 className="text-sm font-semibold mb-2">Answer</h3>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {qaMutation.data?.answer?.answer || (loading ? "Generating..." : "")}
                </p>
                {qaMutation.data?.answer?.citations && (
                  <CitationsList citationsJson={qaMutation.data.answer.citations} />
                )}
              </div>
            )}
          </div>
        </div>

        {selectedProject && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Commits</h2>
            <div>
              {mockCommits.map((commit, index) => (
                <CommitCard
                  key={index}
                  author={commit.author}
                  message={commit.message}
                  pullRequest={commit.pullRequest}
                  changes={commit.changes}
                  timestamp={commit.timestamp}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Saved Questions</h2>
          <div className="space-y-4">
            {savedQuestions.map((question) => (
              <div key={question.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={question.author} />
                    <AvatarFallback>
                      {question.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-foreground">{question.question}</h3>
                      <span className="text-xs text-muted-foreground">{question.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{question.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (selectedProject && !activeView) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <Alert className="border-primary/20 bg-primary/10 dark:border-primary/700 dark:bg-primary-950 mb-6">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <AlertDescription className="text-primary-foreground dark:text-primary-foreground/80 flex items-center">
              This project is linked to
              <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </AlertDescription>
          </Alert>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ask a question</h1>
          <div className="mb-4 w-full max-w-2xl space-y-2">
            <Input
              placeholder="Ask something about this repo..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAsk()
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                disabled={!question.trim() || loading || !selectedProject}
                onClick={handleAsk}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Thinking..." : "Ask GitHelp!"}
              </Button>
              {error && <span className="text-destructive text-sm">{error.message}</span>}
            </div>
            {showAnswerBox && (
              <div className="mt-4 border border-border rounded-md p-4 bg-card/50 backdrop-blur">
                <h3 className="text-sm font-semibold mb-2">Answer</h3>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {qaMutation.data?.answer?.answer || (loading ? "Generating..." : "")}
                </p>
                {qaMutation.data?.answer?.citations && (
                  <CitationsList citationsJson={qaMutation.data.answer.citations} />
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Commits</h2>
          <div>
            {mockCommits.map((commit, index) => (
              <CommitCard
                key={index}
                author={commit.author}
                message={commit.message}
                pullRequest={commit.pullRequest}
                changes={commit.changes}
                timestamp={commit.timestamp}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Dashboard view (when activeView is "dashboard")
  if (activeView === "dashboard") {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <Alert className="border-primary/20 bg-primary/10 dark:border-primary/700 dark:bg-primary-950 mb-6">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <AlertDescription className="text-primary-foreground dark:text-primary-foreground/80 flex items-center">
              This project is linked to
              <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </AlertDescription>
          </Alert>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ask a question</h1>
          <div className="mb-4">
            <Input
              placeholder="Which file should I edit to change the home page?"
              className="w-full max-w-2xl mb-4"
              defaultValue="Which file should I edit to change the home page?"
            />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Ask GitHelp!</Button>
          </div>
        </div>

        {selectedProject && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Commits</h2>
            <div>
              {mockCommits.map((commit, index) => (
                <CommitCard
                  key={index}
                  author={commit.author}
                  message={commit.message}
                  pullRequest={commit.pullRequest}
                  changes={commit.changes}
                  timestamp={commit.timestamp}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">Welcome to GitHelp</h2>
          <p className="text-muted-foreground">Select a project or navigate to get started</p>
        </div>
      </div>
    </div>
  )
}

function CitationsList({ citationsJson }: { citationsJson: string | null }) {
  if (!citationsJson) return null
  let parsed: Array<{ path: string; chunkIndex: number; excerpt?: string }> = []
  try {
    parsed = JSON.parse(citationsJson)
  } catch {
    return null
  }
  if (!parsed.length) return null
  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium mb-1 text-muted-foreground">Citations</h4>
      <ul className="space-y-1 text-xs font-mono">
        {parsed.map((c, i) => (
          <li key={i} className="truncate">
            <span className="text-foreground/80">{c.path}</span>
            <span className="text-muted-foreground">#{c.chunkIndex}</span>
            {c.excerpt && <span className="ml-1 text-muted-foreground/70">- {c.excerpt.slice(0, 80)}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

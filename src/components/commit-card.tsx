import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CommitCardProps {
  author: string
  message: string
  pullRequest?: string
  changes: string[]
  timestamp?: string
}

export function CommitCard({ author, message, pullRequest, changes, timestamp }: CommitCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <svg className="h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-foreground">{author}</span>
              <span className="text-muted-foreground">committed</span>
              {timestamp && <span className="text-muted-foreground">{timestamp}</span>}
            </div>
            <h3 className="font-medium text-foreground mt-1">
              {message} {pullRequest && <span className="text-primary">({pullRequest})</span>}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {changes.map((change, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start">
              <span className="mr-2">•</span>
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

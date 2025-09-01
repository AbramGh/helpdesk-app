import Link from "next/link"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function MyWorkQueueWidget({ instance }: WidgetProps) {
  const myIssues = [
    {
      id: "HD-004",
      title: "Update user permissions system",
      priority: "high",
      status: "in-progress",
      dueDate: "Today",
    },
    {
      id: "HD-005",
      title: "Fix mobile responsive issues",
      priority: "medium",
      status: "open",
      dueDate: "Tomorrow",
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <WidgetCardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold leading-tight tracking-normal">
          <Users className="h-5 w-5" />
          My Work Queue
        </CardTitle>
        <CardDescription>Issues assigned to you</CardDescription>
      </WidgetCardHeader>
      <WidgetCardContent className="flex-1 overflow-auto">
        <div className="space-y-3">
          {myIssues.map((issue) => (
            <Link 
              key={issue.id} 
              href={`/issues/${issue.id.toLowerCase()}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-muted-foreground">{issue.id}</span>
                  <Badge variant="outline" size="sm">
                    {issue.priority}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm">{issue.title}</h4>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  {issue.status}
                </Badge>
                <p className="text-xs text-muted-foreground">{issue.dueDate}</p>
              </div>
            </Link>
          ))}
        </div>
      </WidgetCardContent>
    </div>
  )
}

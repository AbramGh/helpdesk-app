import Link from "next/link"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Inbox, Plus, Filter } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function TeamInboxWidget({ instance }: WidgetProps) {
  const issues = [
    {
      id: "HD-001",
      title: "Login page not loading for some users",
      priority: "high",
      assignee: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
      status: "open",
      created: "2 hours ago",
    },
    {
      id: "HD-002",
      title: "Email notifications not being sent",
      priority: "medium",
      assignee: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      status: "in-progress",
      created: "4 hours ago",
    },
    {
      id: "HD-003",
      title: "Dashboard loading slowly",
      priority: "low",
      assignee: null,
      status: "open",
      created: "1 day ago",
    },
  ]

  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  }

  const statusColors = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    done: "bg-green-100 text-green-800 border-green-200",
  }

  return (
    <div className="h-full flex flex-col">
      <WidgetCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold leading-tight tracking-normal">
              <Inbox className="h-5 w-5" />
              Team Inbox
            </CardTitle>
            <CardDescription>Recent issues requiring attention</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" asChild>
              <Link href="/issues/new">
                <Plus className="h-4 w-4 mr-2" />
                New Issue
              </Link>
            </Button>
          </div>
        </div>
      </WidgetCardHeader>
      <WidgetCardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id.toLowerCase()}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{issue.id}</span>
                    <Badge variant="outline" className={priorityColors[issue.priority as keyof typeof priorityColors]}>
                      {issue.priority}
                    </Badge>
                    <Badge variant="outline" className={statusColors[issue.status as keyof typeof statusColors]}>
                      {issue.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm">{issue.title}</h4>
                  <p className="text-xs text-muted-foreground">{issue.created}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {issue.assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{issue.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </WidgetCardContent>
    </div>
  )
}

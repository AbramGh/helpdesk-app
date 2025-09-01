import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Paperclip, Download } from "lucide-react"
import Link from "next/link"

export default function IssueDetailPortalPage({ params }: { params: { id: string } }) {
  const issue = {
    id: params.id,
    title: "Login page not loading",
    status: "in-progress",
    priority: "high",
    created: "2024-01-15T10:30:00Z",
    updated: "2024-01-16T14:20:00Z",
    description:
      "When I try to access the login page, it shows a blank white screen. This started happening yesterday around 3 PM. I've tried clearing my browser cache and using different browsers, but the issue persists.",
    assignee: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    attachments: [
      { name: "screenshot.png", size: "245 KB", url: "#" },
      { name: "error-log.txt", size: "12 KB", url: "#" },
    ],
  }

  const comments = [
    {
      id: 1,
      author: "Sarah Johnson",
      role: "Support Agent",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
      content:
        "Hi! Thanks for reporting this issue. I can see the problem and we're working on a fix. The login service had an issue with the latest deployment. We expect to have this resolved within the next 2 hours.",
      timestamp: "2024-01-16T09:15:00Z",
    },
    {
      id: 2,
      author: "You",
      role: "Client",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AC",
      content: "Thank you for the quick response! Is there a workaround I can use in the meantime?",
      timestamp: "2024-01-16T09:30:00Z",
    },
    {
      id: 3,
      author: "Sarah Johnson",
      role: "Support Agent",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
      content:
        "Yes! You can access the system directly through this temporary link: https://app-backup.acme.com/login - this will work until we fix the main login page.",
      timestamp: "2024-01-16T09:45:00Z",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portal
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Issue #{issue.id}</h1>
              <p className="text-sm text-muted-foreground">Created {new Date(issue.created).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Issue details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(issue.status)}
                    <CardTitle className="text-xl">{issue.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Assigned to {issue.assignee.name}</span>
                    <span>Updated {new Date(issue.updated).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                  <Badge variant={issue.status === "done" ? "default" : "secondary"}>
                    {issue.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed mb-4">{issue.description}</p>

              {issue.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Attachments</h4>
                  <div className="space-y-2">
                    {issue.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-md">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground">{attachment.size}</span>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{comment.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                  {index < comments.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add comment */}
          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Add a comment or provide additional information..." className="min-h-[100px]" />
              <div className="flex justify-end">
                <Button>Post Comment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

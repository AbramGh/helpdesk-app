import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ClientPortalPage() {
  const issues = [
    {
      id: "ISS-001",
      title: "Login page not loading",
      status: "in-progress",
      priority: "high",
      created: "2024-01-15",
      updated: "2024-01-16",
    },
    {
      id: "ISS-002",
      title: "Email notifications not working",
      status: "open",
      priority: "medium",
      created: "2024-01-14",
      updated: "2024-01-14",
    },
    {
      id: "ISS-003",
      title: "Dashboard loading slowly",
      status: "done",
      priority: "low",
      created: "2024-01-10",
      updated: "2024-01-12",
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Support Portal</h1>
              <p className="text-sm text-muted-foreground">Acme Corporation</p>
            </div>
            <Button asChild>
              <Link href="/portal/issues/new">
                <Plus className="mr-2 h-4 w-4" />
                New Issue
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search your issues..." className="pl-10" />
          </div>
        </div>

        {/* Issues list */}
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(issue.status)}
                      <Link
                        href={`/portal/issues/${issue.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {issue.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>#{issue.id}</span>
                      <span>Created {issue.created}</span>
                      <span>Updated {issue.updated}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                    <Badge variant={issue.status === "done" ? "default" : "secondary"}>
                      {issue.status.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {issues.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No issues found</h3>
              <p className="text-muted-foreground mb-4">You haven't submitted any support requests yet.</p>
              <Button asChild>
                <Link href="/portal/issues/new">Create your first issue</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

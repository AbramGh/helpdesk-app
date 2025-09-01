"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, MoreHorizontal, Clock, AlertTriangle, CheckCircle, User, Calendar } from "lucide-react"
import Link from "next/link"

const mockIssues = [
  {
    id: "HD-001",
    title: "Login page not loading for some users",
    description: "Multiple users reporting that the login page fails to load completely...",
    status: "open",
    priority: "high",
    assignee: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
    reporter: { name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "2 hours ago",
    updatedAt: "1 hour ago",
    commentsCount: 3,
    organization: "Acme Corp",
  },
  {
    id: "HD-002",
    title: "Email notifications not being sent",
    description: "Users are not receiving email notifications for new messages...",
    status: "in-progress",
    priority: "medium",
    assignee: { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    reporter: { name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "4 hours ago",
    updatedAt: "30 minutes ago",
    commentsCount: 7,
    organization: "TechStart Inc",
  },
  {
    id: "HD-003",
    title: "Dashboard loading slowly",
    description: "The main dashboard takes more than 10 seconds to load...",
    status: "open",
    priority: "low",
    assignee: null,
    reporter: { name: "Bob Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "1 day ago",
    updatedAt: "1 day ago",
    commentsCount: 1,
    organization: "Acme Corp",
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

const statusIcons = {
  open: Clock,
  "in-progress": AlertTriangle,
  done: CheckCircle,
}

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HD</span>
            </div>
            <h1 className="text-xl font-semibold">Helpdesk Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              Settings
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <main className="p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Issues</h2>
              <p className="text-muted-foreground">Manage and track all support issues</p>
            </div>
            <Button asChild>
              <Link href="/issues/new">
                <Plus className="mr-2 h-4 w-4" />
                New Issue
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const StatusIcon = statusIcons[issue.status as keyof typeof statusIcons]

              return (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Issue Header */}
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/issues/${issue.id}`}
                            className="font-mono text-sm text-muted-foreground hover:text-primary"
                          >
                            {issue.id}
                          </Link>
                          <Badge
                            variant="outline"
                            className={priorityColors[issue.priority as keyof typeof priorityColors]}
                          >
                            {issue.priority}
                          </Badge>
                          <Badge variant="outline" className={statusColors[issue.status as keyof typeof statusColors]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {issue.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{issue.organization}</span>
                        </div>

                        {/* Issue Title & Description */}
                        <div>
                          <Link href={`/issues/${issue.id}`} className="text-lg font-medium hover:text-primary">
                            {issue.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
                        </div>

                        {/* Issue Meta */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Reported by {issue.reporter.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created {issue.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{issue.commentsCount} comments</span>
                          </div>
                        </div>
                      </div>

                      {/* Assignee & Actions */}
                      <div className="flex items-center gap-3">
                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {issue.assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-right">
                              <p className="text-sm font-medium">{issue.assignee.name}</p>
                              <p className="text-xs text-muted-foreground">Assignee</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Unassigned</p>
                            <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                              Assign
                            </Button>
                          </div>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredIssues.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No issues found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

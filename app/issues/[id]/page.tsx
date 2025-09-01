"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Edit,
  Send,
} from "lucide-react"
import Link from "next/link"

const mockIssue = {
  id: "HD-001",
  title: "Login page not loading for some users",
  description: `Multiple users are reporting that the login page fails to load completely. The page appears to start loading but then gets stuck with a white screen.

**Steps to reproduce:**
1. Navigate to /login
2. Wait for page to load
3. Page remains white/blank

**Expected behavior:**
Login form should display properly

**Actual behavior:**
Page shows white screen after initial loading

**Browser info:**
- Chrome 118.0.5993.88
- Firefox 119.0
- Safari 17.0

**Additional context:**
This seems to affect about 15% of users based on our analytics. The issue started appearing after the recent deployment on October 25th.`,
  status: "open",
  priority: "high",
  assignee: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
  reporter: { name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
  createdAt: "2 hours ago",
  updatedAt: "1 hour ago",
  organization: "Acme Corp",
}

const mockComments = [
  {
    id: "1",
    content: "I can reproduce this issue. It seems to be related to the new authentication middleware we deployed.",
    author: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "1 hour ago",
    isInternal: true,
  },
  {
    id: "2",
    content: "Thanks for the quick response! Is there an estimated timeline for the fix?",
    author: { name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "45 minutes ago",
    isInternal: false,
  },
  {
    id: "3",
    content: "Working on a fix now. Should have this resolved within the next 2 hours.",
    author: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32" },
    createdAt: "30 minutes ago",
    isInternal: true,
  },
]

const statusColors = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  done: "bg-green-100 text-green-800 border-green-200",
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
}

const statusIcons = {
  open: Clock,
  "in-progress": AlertTriangle,
  done: CheckCircle,
}

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(mockIssue.status)
  const [priority, setPriority] = useState(mockIssue.priority)

  const StatusIcon = statusIcons[status as keyof typeof statusIcons]

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    // TODO: Implement comment submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setNewComment("")
    setIsSubmitting(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    // TODO: Implement status update API call
  }

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority)
    // TODO: Implement priority update API call
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/issues">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Issues
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HD</span>
              </div>
              <h1 className="text-xl font-semibold">Issue {mockIssue.id}</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Issue Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground">{mockIssue.id}</span>
                        <Badge variant="outline" className={priorityColors[priority as keyof typeof priorityColors]}>
                          {priority}
                        </Badge>
                        <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{mockIssue.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Reported by {mockIssue.reporter.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created {mockIssue.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{mockIssue.description}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({mockComments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockComments.map((comment, index) => (
                    <div key={comment.id}>
                      <div className="flex gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {comment.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                            {comment.isInternal && (
                              <Badge variant="secondary" className="text-xs">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
                        </div>
                      </div>
                      {index < mockComments.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}

                  {/* Add Comment Form */}
                  <Separator />
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-20"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach files
                      </Button>
                      <Button type="submit" disabled={!newComment.trim() || isSubmitting} size="sm">
                        {isSubmitting ? (
                          "Posting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post comment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Issue Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <Select value={priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={mockIssue.assignee.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {mockIssue.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{mockIssue.assignee.name}</p>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Organization</label>
                    <p className="text-sm mt-1">{mockIssue.organization}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p>
                          <strong>John Doe</strong> created this issue
                        </p>
                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p>
                          <strong>Sarah Chen</strong> was assigned
                        </p>
                        <p className="text-muted-foreground text-xs">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-gray-400 rounded-full mt-2" />
                      <div>
                        <p>
                          <strong>Sarah Chen</strong> added a comment
                        </p>
                        <p className="text-muted-foreground text-xs">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

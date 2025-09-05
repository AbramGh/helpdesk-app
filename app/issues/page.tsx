"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, MoreHorizontal, Clock, AlertTriangle, CheckCircle, User, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"
import { CategoryBadge } from "@/components/categories/category-badge"

interface Category {
  id: string
  name: string
  prefix: string
  color: string | null
}

interface Ticket {
  id: string
  number: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  category: Category | null
  _count: {
    comments: number
  }
}

export default function IssuesPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  useEffect(() => {
    fetchTickets()
    fetchCategories()
  }, [])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter)
      
      const response = await fetch(`/api/tickets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter, categoryFilter])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return "destructive"
      case 'in_progress':
        return "secondary"
      case 'resolved':
        return "default"
      case 'closed':
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return "destructive"
      case 'high':
        return "destructive"
      case 'medium':
        return "secondary"
      case 'low':
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || ticket.priority.toLowerCase() === priorityFilter.toLowerCase()
    
    return matchesSearch && matchesPriority
  })

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">
            Track and manage support tickets
          </p>
        </div>
        <Button asChild>
          <Link href="/issues/new">
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {tickets.length === 0 
                ? "No issues have been created yet. Create your first issue to get started."
                : "No issues match your current filters. Try adjusting your search criteria."
              }
            </p>
            <Button asChild>
              <Link href="/issues/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Issue
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/issues/${ticket.id}`}
                        className="font-semibold text-lg hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {ticket.category && (
                          <CategoryBadge category={ticket.category} />
                        )}
                        <Badge variant={getStatusColor(ticket.status)} className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="font-mono font-medium">{ticket.number}</span>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.author.name || ticket.author.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ticket.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket._count.comments} comments
                      </div>
                    </div>

                    {ticket.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
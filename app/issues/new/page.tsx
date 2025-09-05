"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CategorySelector } from "@/components/categories/category-selector"

export default function NewIssuePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    categoryId: undefined as string | undefined
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For now, we'll use a mock user ID - in a real app this would come from auth
      const payload = {
        ...formData,
        authorId: "mock-user-id" // This should come from your auth system
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const ticket = await response.json()
        toast({
          title: "Success",
          description: `Ticket ${ticket.number} created successfully`
        })
        router.push(`/issues/${ticket.id}`)
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/issues" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Issue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input 
                      id="title" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Brief description of the issue" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <CategorySelector
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({...formData, categoryId: value})}
                      placeholder="Select category..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Category determines ticket numbering (e.g., WEB-001)
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => 
                        setFormData({...formData, priority: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-Generated Number</Label>
                    <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground">
                      {formData.categoryId ? "Will be auto-assigned" : "Select category first"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ticket number will be generated automatically
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed description of the issue..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent" type="button">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating..." : "Create Issue"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/issues">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Title</h4>
                <p className="text-muted-foreground">Be specific and concise. Include the main problem or request.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-muted-foreground">
                  Include steps to reproduce, expected behavior, and any error messages.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Priority</h4>
                <p className="text-muted-foreground">
                  <span className="font-medium text-red-600">Urgent:</span> System down
                  <br />
                  <span className="font-medium text-orange-600">High:</span> Major feature broken
                  <br />
                  <span className="font-medium text-yellow-600">Medium:</span> Minor issues
                  <br />
                  <span className="font-medium text-green-600">Low:</span> Enhancements
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </form>
    </div>
  )
}

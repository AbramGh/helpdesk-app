import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

export default function NewIssuePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/issues" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Link>
      </div>

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
                  <Input id="title" placeholder="Brief description of the issue" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the issue..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labels">Labels</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">bug</Badge>
                    <Badge variant="secondary">frontend</Badge>
                    <Button variant="outline" size="sm">
                      + Add Label
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Create Issue
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
    </div>
  )
}

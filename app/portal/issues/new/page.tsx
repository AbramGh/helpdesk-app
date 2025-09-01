import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"

export default function NewIssuePortalPage() {
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
              <h1 className="text-xl font-semibold">Submit New Issue</h1>
              <p className="text-sm text-muted-foreground">Describe your problem and we'll help you resolve it</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Subject *</Label>
                <Input id="title" placeholder="Brief description of your issue" className="text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="How urgent is this issue?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General question or minor issue</SelectItem>
                    <SelectItem value="medium">Medium - Issue affecting some functionality</SelectItem>
                    <SelectItem value="high">High - Issue blocking important work</SelectItem>
                    <SelectItem value="urgent">Urgent - System completely unusable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide as much detail as possible:&#10;- What were you trying to do?&#10;- What happened instead?&#10;- What did you expect to happen?&#10;- Any error messages you saw?"
                  className="min-h-[150px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <FileUpload />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Submit Issue
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/portal">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

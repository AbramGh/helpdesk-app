import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Clock, CheckCircle, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Team Inbox */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Team Inbox</CardTitle>
            <CardDescription>Recent issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "HD-001",
                  title: "Login page not loading",
                  priority: "high",
                  assignee: "John Doe",
                  time: "2 hours ago",
                },
                {
                  id: "HD-002",
                  title: "Email notifications delayed",
                  priority: "medium",
                  assignee: "Jane Smith",
                  time: "4 hours ago",
                },
                {
                  id: "HD-003",
                  title: "Dashboard performance issues",
                  priority: "high",
                  assignee: "Mike Johnson",
                  time: "6 hours ago",
                },
                {
                  id: "HD-004",
                  title: "User profile update failing",
                  priority: "low",
                  assignee: "Sarah Wilson",
                  time: "1 day ago",
                },
              ].map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{issue.id}</span>
                      <Badge
                        variant={
                          issue.priority === "high"
                            ? "destructive"
                            : issue.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {issue.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Assigned to {issue.assignee} • {issue.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Work & SLA At Risk */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Work</CardTitle>
              <CardDescription>Issues assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "HD-005", title: "API rate limiting implementation", status: "in-progress" },
                  { id: "HD-006", title: "Database backup automation", status: "open" },
                  { id: "HD-007", title: "Security audit findings", status: "in-progress" },
                ].map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{issue.id}</p>
                      <p className="text-xs text-muted-foreground">{issue.title}</p>
                    </div>
                    <Badge variant={issue.status === "in-progress" ? "default" : "secondary"}>{issue.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>SLA At Risk</span>
              </CardTitle>
              <CardDescription>Issues approaching SLA breach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "HD-008", title: "Payment gateway timeout", timeLeft: "2 hours" },
                  { id: "HD-009", title: "Mobile app crash reports", timeLeft: "4 hours" },
                ].map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-2 border rounded border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{issue.id}</p>
                      <p className="text-xs text-muted-foreground">{issue.title}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {issue.timeLeft}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

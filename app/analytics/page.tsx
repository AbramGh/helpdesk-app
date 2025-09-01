"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target,
  Download,
  Calendar
} from "lucide-react"

const mockAnalytics = {
  overview: {
    totalIssues: 1247,
    resolvedIssues: 1098,
    avgResolutionTime: "18.2 hours",
    customerSatisfaction: 4.3
  },
  trends: [
    { period: "This Week", issues: 89, change: "+12%", trend: "up" },
    { period: "Last Week", issues: 79, change: "-5%", trend: "down" },
    { period: "This Month", issues: 342, change: "+8%", trend: "up" },
    { period: "Last Month", issues: 316, change: "+15%", trend: "up" }
  ],
  categories: [
    { name: "Technical Issues", count: 456, percentage: 36.6 },
    { name: "Account Problems", count: 298, percentage: 23.9 },
    { name: "Billing Questions", count: 187, percentage: 15.0 },
    { name: "Feature Requests", count: 156, percentage: 12.5 },
    { name: "Other", count: 150, percentage: 12.0 }
  ],
  agents: [
    { name: "Sarah Chen", resolved: 156, avgTime: "16.2h", rating: 4.8 },
    { name: "Mike Johnson", resolved: 134, avgTime: "18.5h", rating: 4.6 },
    { name: "Emily Davis", resolved: 98, avgTime: "20.1h", rating: 4.4 },
    { name: "Alex Wilson", resolved: 87, avgTime: "15.8h", rating: 4.7 }
  ]
}

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">Performance insights and trends</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalIssues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((mockAnalytics.overview.resolvedIssues / mockAnalytics.overview.totalIssues) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {mockAnalytics.overview.resolvedIssues} of {mockAnalytics.overview.totalIssues} resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">-2.3h</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.customerSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2</span> from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Issue Trends
              </CardTitle>
              <CardDescription>Issue volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{trend.period}</p>
                      <p className="text-sm text-muted-foreground">{trend.issues} issues</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trend.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        trend.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {trend.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issue Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Categories</CardTitle>
              <CardDescription>Distribution by issue type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.count} ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Individual agent metrics and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mockAnalytics.agents.map((agent, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{agent.name}</h4>
                    <Badge variant="secondary">
                      ⭐ {agent.rating}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolved:</span>
                      <span className="font-medium">{agent.resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Time:</span>
                      <span className="font-medium">{agent.avgTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


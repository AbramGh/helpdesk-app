import { CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function SLAMonitoringWidget({ instance }: WidgetProps) {
  const slaMetrics = [
    { label: "Response Time", value: "2.3h", target: "< 4h", status: "good" },
    { label: "Resolution Time", value: "18.5h", target: "< 24h", status: "good" },
    { label: "First Contact Resolution", value: "68%", target: "> 60%", status: "good" },
    { label: "Customer Satisfaction", value: "4.2/5", target: "> 4.0", status: "good" },
  ]

  return (
    <div className="h-full flex flex-col">
      <WidgetCardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold leading-tight tracking-normal">
          <TrendingUp className="h-5 w-5" />
          SLA Monitoring
        </CardTitle>
        <CardDescription>Service level performance metrics</CardDescription>
      </WidgetCardHeader>
      <WidgetCardContent className="flex-1 overflow-auto">
        <div className="space-y-4">
          {slaMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-xs text-muted-foreground">Target: {metric.target}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{metric.value}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  On Track
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </WidgetCardContent>
    </div>
  )
}

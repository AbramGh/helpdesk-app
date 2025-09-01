import { CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function ResolvedTodayWidget({ instance }: WidgetProps) {
  return (
    <>
      <WidgetCardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold leading-tight tracking-normal text-muted-foreground">
            Resolved Today
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      </WidgetCardHeader>
      <WidgetCardContent>
        <div className="text-2xl font-bold">8</div>
        <p className="text-xs text-muted-foreground">+3 from yesterday</p>
      </WidgetCardContent>
    </>
  )
}

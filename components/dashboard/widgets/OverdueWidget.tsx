import { CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function OverdueWidget({ instance }: WidgetProps) {
  return (
    <>
      <WidgetCardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold leading-tight tracking-normal text-muted-foreground">
            Overdue
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
      </WidgetCardHeader>
      <WidgetCardContent>
        <div className="text-2xl font-bold">3</div>
        <p className="text-xs text-muted-foreground">-1 from yesterday</p>
      </WidgetCardContent>
    </>
  )
}

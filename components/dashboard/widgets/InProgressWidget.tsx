import { CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function InProgressWidget({ instance }: WidgetProps) {
  return (
    <>
      <WidgetCardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold leading-tight tracking-normal text-muted-foreground">
            In Progress
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </div>
      </WidgetCardHeader>
      <WidgetCardContent>
        <div className="text-2xl font-bold">12</div>
        <p className="text-xs text-muted-foreground">+4 from yesterday</p>
      </WidgetCardContent>
    </>
  )
}

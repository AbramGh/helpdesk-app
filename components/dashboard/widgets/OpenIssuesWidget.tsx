import { CardTitle } from "@/components/ui/card"
import { Inbox } from "lucide-react"
import { WidgetProps } from "@/types/dashboard"
import { WidgetCardHeader, WidgetCardContent } from "../WidgetCard"

export function OpenIssuesWidget({ instance }: WidgetProps) {
  return (
    <>
      <WidgetCardHeader>
        <div className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold leading-tight tracking-normal text-muted-foreground">
            Open Issues
          </CardTitle>
          <Inbox className="h-4 w-4 text-blue-600" />
        </div>
      </WidgetCardHeader>
      <WidgetCardContent>
        <div className="text-2xl font-bold">23</div>
        <p className="text-xs text-muted-foreground">+2 from yesterday</p>
      </WidgetCardContent>
    </>
  )
}

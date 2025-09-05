import { NextResponse } from "next/server"
import { notificationSettingsSchema } from "@/lib/validation/settings"
import { getOrgId, getUserId, requirePermission } from "@/lib/auth"

export async function GET() {
  try {
    const organizationId = await getOrgId()
    
    const mockData = {
      id: "1",
      organizationId,
      emailEnabled: true,
      events: {
        newTicket: true,
        ticketAssigned: true,
        ticketReply: true,
        statusChanged: true,
        slaBreach: true,
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Failed to fetch notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    const userId = await getUserId()
    
    const payload = await req.json()
    const parsed = notificationSettingsSchema.parse(payload)

    console.log("Saving notification settings:", parsed)

    return NextResponse.json({ 
      id: "1",
      organizationId,
      ...parsed,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save notification settings:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}


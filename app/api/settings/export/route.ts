import { NextResponse } from "next/server"
import { requirePermission, getOrgId } from "@/lib/auth"

export async function GET() {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    
    // Mock settings export
    const mockSettings = {
      general: {
        companyName: "Agnus Cloud",
        supportEmail: "support@agnuscloud.com",
        timezone: "UTC",
        defaultLanguage: "en",
        autoAssignEnabled: false
      },
      tickets: {
        defaultStatus: "OPEN",
        defaultPriority: "MEDIUM",
        autoCloseAfterDays: 30
      },
      notifications: {
        emailEnabled: true,
        events: {
          newTicket: true,
          ticketAssigned: true,
          ticketReply: true
        }
      },
      exportedAt: new Date().toISOString(),
      organizationId
    }
    
    return new NextResponse(JSON.stringify(mockSettings, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="helpdesk-settings-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error("Failed to export settings:", error)
    return NextResponse.json({ error: "Failed to export settings" }, { status: 500 })
  }
}


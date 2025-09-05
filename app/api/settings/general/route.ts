import { NextResponse } from "next/server"
import { generalSettingsSchema } from "@/lib/validation/settings"
import { prisma } from "@/lib/prisma"
import { getOrgId, getUserId, requirePermission } from "@/lib/auth"

export async function GET() {
  try {
    const organizationId = await getOrgId()
    
    // Return mock data for now - replace with actual database query
    const mockData = {
      id: "1",
      organizationId,
      companyName: "Agnus Cloud",
      supportEmail: "support@agnuscloud.com",
      replyToEmail: null,
      welcomeMessage: "Welcome to our helpdesk! We're here to help you with any questions or issues.",
      timezone: "UTC",
      defaultLanguage: "en",
      autoAssignEnabled: false,
      businessHours: {
        monday: { enabled: true, start: "09:00", end: "17:00" },
        tuesday: { enabled: true, start: "09:00", end: "17:00" },
        wednesday: { enabled: true, start: "09:00", end: "17:00" },
        thursday: { enabled: true, start: "09:00", end: "17:00" },
        friday: { enabled: true, start: "09:00", end: "17:00" },
        saturday: { enabled: false, start: "09:00", end: "17:00" },
        sunday: { enabled: false, start: "09:00", end: "17:00" },
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Failed to fetch general settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    const userId = await getUserId()
    
    const payload = await req.json()
    const parsed = generalSettingsSchema.parse(payload)

    // Mock save - replace with actual database operations
    console.log("Saving general settings:", parsed)

    return NextResponse.json({ 
      id: "1",
      organizationId,
      ...parsed,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save general settings:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}


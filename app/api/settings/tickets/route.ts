import { NextResponse } from "next/server"
import { ticketSettingsSchema } from "@/lib/validation/settings"
import { getOrgId, getUserId, requirePermission } from "@/lib/auth"

export async function GET() {
  try {
    const organizationId = await getOrgId()
    
    // Return mock data for now
    const mockData = {
      id: "1",
      organizationId,
      defaultStatus: "OPEN",
      defaultPriority: "MEDIUM",
      autoCloseAfterDays: 30,
      maxAttachmentSize: 10,
      allowedAttachmentTypes: ["pdf", "doc", "docx", "txt", "jpg", "png"],
      requireCategoryOnCreate: false,
      allowPublicSubmission: true,
      enableCaptcha: false,
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Failed to fetch ticket settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    const userId = await getUserId()
    
    const payload = await req.json()
    const parsed = ticketSettingsSchema.parse(payload)

    console.log("Saving ticket settings:", parsed)

    return NextResponse.json({ 
      id: "1",
      organizationId,
      ...parsed,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save ticket settings:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}


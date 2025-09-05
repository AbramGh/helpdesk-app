import { NextResponse } from "next/server"
import { automationSettingsSchema } from "@/lib/validation/settings"
import { getOrgId, getUserId, requirePermission } from "@/lib/auth"

export async function GET() {
  try {
    const organizationId = await getOrgId()
    
    const mockData = {
      id: "1",
      organizationId,
      assignmentPolicy: "MANUAL",
      enableAutoRouting: false,
      enableAutoTags: false,
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Failed to fetch automation settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    const userId = await getUserId()
    
    const payload = await req.json()
    const parsed = automationSettingsSchema.parse(payload)

    console.log("Saving automation settings:", parsed)

    return NextResponse.json({ 
      id: "1",
      organizationId,
      ...parsed,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save automation settings:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}


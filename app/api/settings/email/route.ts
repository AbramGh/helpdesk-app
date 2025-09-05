import { NextResponse } from "next/server"
import { emailConfigSchema } from "@/lib/validation/settings"
import { getOrgId, getUserId, requirePermission } from "@/lib/auth"

export async function GET() {
  try {
    const organizationId = await getOrgId()
    
    const mockData = {
      id: "1",
      organizationId,
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: "",
      fromName: "Helpdesk Support",
      fromEmail: "",
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Failed to fetch email settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.manage")
    const organizationId = await getOrgId()
    const userId = await getUserId()
    
    const payload = await req.json()
    
    // Remove password from validation since we don't store it
    const { smtpPass, ...payloadWithoutPassword } = payload
    
    // Create a schema without password requirement for saving
    const saveSchema = emailConfigSchema.omit({ smtpPass: true })
    const parsed = saveSchema.parse(payloadWithoutPassword)

    console.log("Saving email settings:", parsed)

    return NextResponse.json({ 
      id: "1",
      organizationId,
      ...parsed,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to save email settings:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

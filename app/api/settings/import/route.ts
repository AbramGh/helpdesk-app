import { NextResponse } from "next/server"
import { requirePermission, getUserId, getOrgId } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await requirePermission("settings.manage")
    const userId = await getUserId()
    const organizationId = await getOrgId()
    
    const settings = await req.json()
    
    // Validate imported settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 })
    }
    
    console.log(`Importing settings for organization ${organizationId} by user ${userId}`)
    console.log("Settings to import:", settings)
    
    // Mock import process
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return NextResponse.json({ 
      success: true,
      message: "Settings imported successfully",
      importedSections: Object.keys(settings).filter(key => key !== 'exportedAt' && key !== 'organizationId')
    })
  } catch (error) {
    console.error("Failed to import settings:", error)
    return NextResponse.json({ error: "Failed to import settings" }, { status: 500 })
  }
}


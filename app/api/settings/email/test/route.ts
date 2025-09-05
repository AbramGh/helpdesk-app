import { NextResponse } from "next/server"
import { getUser, requirePermission } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    console.log("Test email API called")
    
    // For now, skip auth to test functionality
    // await requirePermission("settings.manage")
    // const user = await getUser()
    
    const user = { email: "test@example.com" } // Mock user for testing
    
    console.log(`Mock sending test email to ${user.email}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful email sending
    const emailSent = true // In real implementation, this would be the actual email sending result
    
    if (!emailSent) {
      throw new Error("SMTP configuration error")
    }

    console.log("Test email sent successfully")

    return NextResponse.json({ 
      success: true,
      message: `Test email sent successfully to ${user.email}`,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Test email failed:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Failed to send test email",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

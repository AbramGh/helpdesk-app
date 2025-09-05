import { NextResponse } from "next/server"
import { sendEmail, testSmtpConnection, type EmailConfig } from "@/lib/email"

export async function POST(req: Request) {
  try {
    console.log("🚀 Real SMTP test email API called")
    
    const body = await req.json()
    const { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName, toEmail, smtpSecure } = body
    
    console.log("📧 SMTP Config received:", {
      smtpHost,
      smtpPort,
      smtpSecure: smtpSecure ?? true,
      smtpUser: smtpUser ? "[REDACTED]" : "not provided",
      fromEmail,
      fromName: fromName || "Helpdesk Support",
      toEmail
    })
    
    // Validate required fields
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail || !toEmail) {
      return NextResponse.json({
        success: false,
        error: "Missing required SMTP configuration fields",
        required: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "fromEmail", "toEmail"]
      }, { status: 400 })
    }
    
    const emailConfig: EmailConfig = {
      smtpHost,
      smtpPort: parseInt(smtpPort.toString()),
      smtpSecure: smtpSecure ?? (parseInt(smtpPort.toString()) === 465),
      smtpUser,
      smtpPass,
      fromName: fromName || "Helpdesk Support",
      fromEmail
    }

    console.log("🔍 Step 1: Testing SMTP connection...")
    
    // Test SMTP connection first
    const connectionTest = await testSmtpConnection(emailConfig)
    
    if (!connectionTest.success) {
      console.error("❌ SMTP connection failed:", connectionTest.message)
      return NextResponse.json({
        success: false,
        error: connectionTest.message,
        details: connectionTest.details
      }, { status: 400 })
    }

    console.log("✅ Step 1 Complete: SMTP connection successful")
    console.log("📤 Step 2: Sending actual test email...")

    // Send actual test email
    const emailMessage = {
      to: toEmail,
      subject: "Helpdesk SMTP Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">SMTP Test Successful</h2>
          <p>Your helpdesk SMTP configuration is working correctly.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #374151;">Test Configuration Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; font-weight: bold;">SMTP Host:</td><td style="padding: 5px 0;">${smtpHost}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Port:</td><td style="padding: 5px 0;">${smtpPort}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Security:</td><td style="padding: 5px 0;">${emailConfig.smtpSecure ? 'SSL/TLS' : 'STARTTLS'}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">From Address:</td><td style="padding: 5px 0;">${fromEmail}</td></tr>
              <tr><td style="padding: 5px 0; font-weight: bold;">Test Time:</td><td style="padding: 5px 0;">${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          
          <p style="color: #059669; font-weight: bold; margin: 20px 0;">
            Your helpdesk is ready to send email notifications.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated test email from your helpdesk system.
          </p>
        </div>
      `,
      text: `SMTP Test Successful

Your helpdesk SMTP configuration is working correctly.

Test Configuration Details:
- SMTP Host: ${smtpHost}
- Port: ${smtpPort}
- Security: ${emailConfig.smtpSecure ? 'SSL/TLS' : 'STARTTLS'}
- From Address: ${fromEmail}
- Test Time: ${new Date().toLocaleString()}

Your helpdesk is ready to send email notifications.

This is an automated test email from your helpdesk system.`
    }

    const emailSent = await sendEmail(emailConfig, emailMessage)
    
    if (emailSent) {
      console.log("✅ Step 2 Complete: Test email sent successfully!")
      
      const testResult = {
        smtpConnection: "✅ Connected successfully",
        authentication: "✅ Authentication successful", 
        emailSent: "✅ Test email sent successfully",
        recipient: toEmail,
        timestamp: new Date().toISOString()
      }
      
      return NextResponse.json({ 
        success: true,
        message: `Test email sent successfully to ${toEmail}. Please check your inbox.`,
        details: testResult
      })
    }
    
  } catch (error: any) {
    console.error("❌ Real SMTP test failed:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Failed to send test email",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

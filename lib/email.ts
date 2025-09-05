import nodemailer from 'nodemailer'

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPass: string
  fromName: string
  fromEmail: string
}

export interface EmailMessage {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail(config: EmailConfig, message: EmailMessage): Promise<boolean> {
  try {
    console.log(`Creating SMTP transporter for ${config.smtpHost}:${config.smtpPort}`)
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports like 587
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      // Additional options for better compatibility with various SMTP servers
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
        ciphers: 'SSLv3' // Support older SSL versions if needed
      },
      // Enable STARTTLS for port 587
      requireTLS: config.smtpPort === 587,
      // Debug options
      debug: true,
      logger: true
    })

    console.log('Verifying SMTP connection...')
    
    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')

    // Send email
    console.log(`Sending email from ${config.fromEmail} to ${message.to}`)
    
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return true
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message)
    throw new Error(`SMTP Error: ${error.message}`)
  }
}

export async function testSmtpConnection(config: EmailConfig): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports like 587
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: config.smtpPort === 587,
      debug: true,
      logger: true
    })

    console.log('Testing SMTP connection...')
    await transporter.verify()
    
    return {
      success: true,
      message: 'SMTP connection successful',
      details: {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: 'verified'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `SMTP connection failed: ${error.message}`,
      details: {
        host: config.smtpHost,
        port: config.smtpPort,
        error: error.code || error.message
      }
    }
  }
}

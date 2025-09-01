import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { InjectQueue } from "@nestjs/bull"
import type { Queue } from "bull"

export interface EmailJob {
  to: string
  subject: string
  html: string
  text?: string
}

@Injectable()
export class EmailService {
  private emailQueue: Queue

  constructor(private configService: ConfigService) {
    this.emailQueue = InjectQueue("email")
  }

  async sendMagicLink(email: string, magicUrl: string, name?: string): Promise<void> {
    const subject = "Sign in to Helpdesk"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Sign in to Helpdesk</h2>
        <p>Hello${name ? ` ${name}` : ""},</p>
        <p>Click the link below to sign in to your account:</p>
        <p>
          <a href="${magicUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Sign In
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `

    const text = `
      Sign in to Helpdesk
      
      Hello${name ? ` ${name}` : ""},
      
      Click the link below to sign in to your account:
      ${magicUrl}
      
      This link will expire in 15 minutes.
      
      If you didn't request this, you can safely ignore this email.
    `

    await this.emailQueue.add("send", {
      to: email,
      subject,
      html,
      text,
    })
  }
}

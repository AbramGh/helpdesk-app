import { Process, Processor } from "@nestjs/bull"
import type { Job } from "bull"
import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import type { EmailJob } from "./email.service"

@Processor("email")
@Injectable()
export class EmailProcessor {
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get("SMTP_HOST"),
      port: this.configService.get("SMTP_PORT"),
      secure: this.configService.get("SMTP_SECURE") === "true",
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASS"),
      },
    })
  }

  @Process("send")
  async sendEmail(job: Job<EmailJob>) {
    const { to, subject, html, text } = job.data

    try {
      await this.transporter.sendMail({
        from: this.configService.get("SMTP_FROM"),
        to,
        subject,
        html,
        text,
      })

      console.log(`Email sent successfully to ${to}`)
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error)
      throw error
    }
  }
}

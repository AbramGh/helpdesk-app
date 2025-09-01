import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get("SMTP_HOST", "localhost"),
      port: this.configService.get("SMTP_PORT", 1025),
      secure: false,
      auth: this.configService.get("SMTP_USER")
        ? {
            user: this.configService.get("SMTP_USER"),
            pass: this.configService.get("SMTP_PASS"),
          }
        : undefined,
    })
  }

  async sendIssueCreatedEmail(to: string, data: any) {
    const subject = `New Issue Created: ${data.issueTitle}`
    const html = this.getIssueCreatedTemplate(data)

    return this.sendEmail(to, subject, html)
  }

  async sendStatusChangedEmail(to: string, data: any) {
    const subject = `Issue Status Updated: ${data.issueTitle}`
    const html = this.getStatusChangedTemplate(data)

    return this.sendEmail(to, subject, html)
  }

  async sendCommentAddedEmail(to: string, data: any) {
    const subject = `New Comment: ${data.issueTitle}`
    const html = this.getCommentAddedTemplate(data)

    return this.sendEmail(to, subject, html)
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get("FROM_EMAIL", "noreply@helpdesk.com"),
        to,
        subject,
        html,
      })

      console.log("Email sent:", info.messageId)
      return info
    } catch (error) {
      console.error("Email send error:", error)
      throw error
    }
  }

  private getIssueCreatedTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Issue Created</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .priority-high { color: #dc3545; font-weight: bold; }
            .priority-medium { color: #fd7e14; font-weight: bold; }
            .priority-low { color: #28a745; font-weight: bold; }
            .priority-urgent { color: #dc3545; font-weight: bold; background: #fff5f5; padding: 2px 8px; border-radius: 4px; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Issue Created</h2>
            </div>
            <p>A new issue has been created and requires your attention:</p>
            <h3>${data.issueTitle}</h3>
            <p><strong>Priority:</strong> <span class="priority-${data.priority}">${data.priority.toUpperCase()}</span></p>
            <p><strong>Created by:</strong> ${data.createdBy}</p>
            <a href="${this.configService.get("WEB_URL", "http://localhost:3000")}/issues/${data.issueId}" class="button">
              View Issue
            </a>
            <hr>
            <p><small>This is an automated message from your helpdesk system.</small></p>
          </div>
        </body>
      </html>
    `
  }

  private getStatusChangedTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Issue Status Updated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .status-change { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Issue Status Updated</h2>
            </div>
            <p>The status of an issue has been updated:</p>
            <h3>${data.issueTitle}</h3>
            <div class="status-change">
              <p><strong>Status changed from:</strong> ${data.oldStatus} → ${data.newStatus}</p>
              <p><strong>Updated by:</strong> ${data.changedBy}</p>
            </div>
            <a href="${this.configService.get("WEB_URL", "http://localhost:3000")}/issues/${data.issueId}" class="button">
              View Issue
            </a>
            <hr>
            <p><small>This is an automated message from your helpdesk system.</small></p>
          </div>
        </body>
      </html>
    `
  }

  private getCommentAddedTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Comment Added</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .comment { background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Comment Added</h2>
            </div>
            <p>A new comment has been added to an issue:</p>
            <h3>${data.issueTitle}</h3>
            <div class="comment">
              <p><strong>${data.commentAuthor} commented:</strong></p>
              <p>${data.commentPreview}${data.commentPreview.length >= 100 ? "..." : ""}</p>
            </div>
            <a href="${this.configService.get("WEB_URL", "http://localhost:3000")}/issues/${data.issueId}" class="button">
              View Issue
            </a>
            <hr>
            <p><small>This is an automated message from your helpdesk system.</small></p>
          </div>
        </body>
      </html>
    `
  }
}

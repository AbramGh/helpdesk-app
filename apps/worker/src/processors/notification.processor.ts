import { Process, Processor } from "@nestjs/bull"
import type { Job } from "bull"
import { Injectable } from "@nestjs/common"
import type { EmailService } from "../../../api/src/notifications/email.service"
import type { WebhookService } from "../../../api/src/notifications/webhook.service"
import type { PrismaService } from "../../../api/src/prisma/prisma.service"

@Processor("notifications")
@Injectable()
export class NotificationProcessor {
  constructor(
    private emailService: EmailService,
    private webhookService: WebhookService,
    private prisma: PrismaService,
  ) {}

  @Process("send-email")
  async handleSendEmail(job: Job) {
    const { type, recipientId, issueId, data } = job.data

    try {
      // Get recipient email
      const recipient = await this.prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true, emailNotifications: true },
      })

      if (!recipient || !recipient.emailNotifications) {
        return { skipped: true, reason: "Email notifications disabled" }
      }

      // Send appropriate email based on notification type
      switch (type) {
        case "issue_created":
          await this.emailService.sendIssueCreatedEmail(recipient.email, { ...data, issueId })
          break
        case "status_changed":
          await this.emailService.sendStatusChangedEmail(recipient.email, { ...data, issueId })
          break
        case "comment_added":
          await this.emailService.sendCommentAddedEmail(recipient.email, { ...data, issueId })
          break
        default:
          console.log(`Unknown notification type: ${type}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Email notification error:", error)
      throw error
    }
  }

  @Process("send-webhook")
  async handleSendWebhook(job: Job) {
    const { type, issueId, data } = job.data

    try {
      // Get issue with organization info
      const issue = await this.prisma.issue.findUnique({
        where: { id: issueId },
        include: {
          organization: true,
          createdBy: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      })

      if (!issue) {
        return { skipped: true, reason: "Issue not found" }
      }

      // Send appropriate webhook based on notification type
      switch (type) {
        case "issue_created":
          await this.webhookService.sendIssueCreatedWebhook(issue.organizationId, issue)
          break
        case "status_changed":
          await this.webhookService.sendStatusChangedWebhook(
            issue.organizationId,
            issue,
            data.oldStatus,
            data.newStatus,
          )
          break
        case "comment_added":
          await this.webhookService.sendCommentAddedWebhook(issue.organizationId, issue, data)
          break
        default:
          console.log(`Unknown webhook type: ${type}`)
      }

      return { success: true }
    } catch (error) {
      console.error("Webhook notification error:", error)
      throw error
    }
  }
}

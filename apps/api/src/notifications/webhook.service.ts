import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { PrismaService } from "../prisma/prisma.service"
import axios from "axios"

export interface WebhookPayload {
  event: string
  timestamp: string
  data: Record<string, any>
}

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async sendWebhook(organizationId: string, payload: WebhookPayload) {
    // Get active webhooks for the organization
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        organizationId,
        active: true,
      },
    })

    const results = []

    for (const webhook of webhooks) {
      try {
        const response = await axios.post(webhook.url, payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": webhook.secret,
            "User-Agent": "Helpdesk-Webhook/1.0",
          },
          timeout: 10000,
        })

        // Log successful webhook delivery
        await this.prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event: payload.event,
            payload: payload,
            status: "success",
            responseStatus: response.status,
            responseBody: response.data,
          },
        })

        results.push({ webhookId: webhook.id, success: true })
      } catch (error) {
        // Log failed webhook delivery
        await this.prisma.webhookLog.create({
          data: {
            webhookId: webhook.id,
            event: payload.event,
            payload: payload,
            status: "failed",
            error: error.message,
            responseStatus: error.response?.status,
            responseBody: error.response?.data,
          },
        })

        results.push({ webhookId: webhook.id, success: false, error: error.message })
      }
    }

    return results
  }

  async createWebhookPayload(event: string, data: any): Promise<WebhookPayload> {
    return {
      event,
      timestamp: new Date().toISOString(),
      data,
    }
  }

  // Specific webhook methods for different events
  async sendIssueCreatedWebhook(organizationId: string, issueData: any) {
    const payload = await this.createWebhookPayload("issue.created", {
      issue: issueData,
    })
    return this.sendWebhook(organizationId, payload)
  }

  async sendIssueUpdatedWebhook(organizationId: string, issueData: any, changes: any) {
    const payload = await this.createWebhookPayload("issue.updated", {
      issue: issueData,
      changes,
    })
    return this.sendWebhook(organizationId, payload)
  }

  async sendCommentAddedWebhook(organizationId: string, issueData: any, commentData: any) {
    const payload = await this.createWebhookPayload("comment.added", {
      issue: issueData,
      comment: commentData,
    })
    return this.sendWebhook(organizationId, payload)
  }

  async sendStatusChangedWebhook(organizationId: string, issueData: any, oldStatus: string, newStatus: string) {
    const payload = await this.createWebhookPayload("status.changed", {
      issue: issueData,
      oldStatus,
      newStatus,
    })
    return this.sendWebhook(organizationId, payload)
  }
}

import { Injectable } from "@nestjs/common"
import { Queue } from "bull"
import type { PrismaService } from "../prisma/prisma.service"
import type { EmailService } from "./email.service"
import type { WebhookService } from "./webhook.service"

export interface NotificationData {
  type: "issue_created" | "issue_updated" | "issue_assigned" | "comment_added" | "status_changed"
  recipientId: string
  issueId: string
  data: Record<string, any>
}

@Injectable()
export class NotificationsService {
  private notificationQueue: Queue

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private webhookService: WebhookService,
  ) {
    this.notificationQueue = new Queue("notifications")
  }

  async createNotification(data: NotificationData) {
    // Store notification in database
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        recipientId: data.recipientId,
        issueId: data.issueId,
        data: data.data,
        read: false,
      },
    })

    // Queue email notification
    await this.notificationQueue.add("send-email", {
      notificationId: notification.id,
      ...data,
    })

    // Queue webhook notification
    await this.notificationQueue.add("send-webhook", {
      notificationId: notification.id,
      ...data,
    })

    return notification
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await this.prisma.notification.count({
      where: { recipientId: userId },
    })

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: { read: true },
    })
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: { read: true },
    })
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    })
  }

  // Helper methods for common notification types
  async notifyIssueCreated(issueId: string, createdBy: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        assignee: true,
        organization: {
          include: {
            members: {
              where: {
                role: { in: ["owner", "member"] },
              },
            },
          },
        },
      },
    })

    if (!issue) return

    // Notify assignee if assigned
    if (issue.assigneeId && issue.assigneeId !== createdBy) {
      await this.createNotification({
        type: "issue_created",
        recipientId: issue.assigneeId,
        issueId: issue.id,
        data: {
          issueTitle: issue.title,
          priority: issue.priority,
          createdBy: createdBy,
        },
      })
    }

    // Notify organization members
    for (const member of issue.organization.members) {
      if (member.userId !== createdBy && member.userId !== issue.assigneeId) {
        await this.createNotification({
          type: "issue_created",
          recipientId: member.userId,
          issueId: issue.id,
          data: {
            issueTitle: issue.title,
            priority: issue.priority,
            createdBy: createdBy,
          },
        })
      }
    }
  }

  async notifyStatusChanged(issueId: string, oldStatus: string, newStatus: string, changedBy: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        createdBy: true,
        assignee: true,
      },
    })

    if (!issue) return

    const recipients = [issue.createdById, issue.assigneeId].filter(
      (id): id is string => id !== null && id !== changedBy,
    )

    for (const recipientId of recipients) {
      await this.createNotification({
        type: "status_changed",
        recipientId,
        issueId: issue.id,
        data: {
          issueTitle: issue.title,
          oldStatus,
          newStatus,
          changedBy,
        },
      })
    }
  }

  async notifyCommentAdded(issueId: string, commentId: string, authorId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        createdBy: true,
        assignee: true,
        comments: {
          where: { id: commentId },
          include: { author: true },
        },
      },
    })

    if (!issue || !issue.comments[0]) return

    const comment = issue.comments[0]
    const recipients = [issue.createdById, issue.assigneeId].filter(
      (id): id is string => id !== null && id !== authorId,
    )

    for (const recipientId of recipients) {
      await this.createNotification({
        type: "comment_added",
        recipientId,
        issueId: issue.id,
        data: {
          issueTitle: issue.title,
          commentAuthor: comment.author.name,
          commentPreview: comment.content.substring(0, 100),
        },
      })
    }
  }
}

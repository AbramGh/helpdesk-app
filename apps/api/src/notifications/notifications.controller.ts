import { Controller, Get, Post, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { NotificationsService } from "./notifications.service"
import type { Request } from "express"

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  async getNotifications(req: Request, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notificationsService.getNotifications(req.user.id, Number(page), Number(limit))
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(req: Request) {
    const count = await this.notificationsService.getUnreadCount(req.user.id)
    return { count }
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(req: Request, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id)
  }

  @Post("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(req: Request) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }
}

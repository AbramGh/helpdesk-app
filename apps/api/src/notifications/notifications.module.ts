import { Module } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { NotificationsController } from "./notifications.controller"
import { EmailService } from "./email.service"
import { WebhookService } from "./webhook.service"
import { PrismaModule } from "../prisma/prisma.module"
import { BullModule } from "@nestjs/bull"

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: "notifications",
    }),
    BullModule.registerQueue({
      name: "webhooks",
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, WebhookService],
  exports: [NotificationsService, EmailService, WebhookService],
})
export class NotificationsModule {}

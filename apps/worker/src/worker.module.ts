import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { BullModule } from "@nestjs/bullmq"
import { PrismaModule } from "./prisma/prisma.module"
import { NotificationModule } from "./notification/notification.module"
import { SlaModule } from "./sla/sla.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    PrismaModule,
    NotificationModule,
    SlaModule,
  ],
})
export class WorkerModule {}

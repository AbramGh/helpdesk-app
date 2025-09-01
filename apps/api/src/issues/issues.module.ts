import { Module } from "@nestjs/common"
import { IssuesController } from "./issues.controller"
import { IssuesService } from "./issues.service"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}

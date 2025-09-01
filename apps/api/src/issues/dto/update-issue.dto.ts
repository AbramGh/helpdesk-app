import { PartialType } from "@nestjs/swagger"
import { IsOptional, IsEnum } from "class-validator"
import { CreateIssueDto } from "./create-issue.dto"
import { IssueStatus } from "@prisma/client"

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus
}

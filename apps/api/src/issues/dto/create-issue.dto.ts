import { IsString, IsOptional, IsUUID, IsEnum, MaxLength } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IssuePriority } from "@prisma/client"

export class CreateIssueDto {
  @ApiProperty({ description: "Issue title", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ description: "Issue description" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: "Organization ID" })
  @IsUUID()
  organizationId: string

  @ApiPropertyOptional({ description: "Assignee user ID" })
  @IsOptional()
  @IsUUID()
  assigneeId?: string

  @ApiPropertyOptional({
    description: "Issue priority",
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority = IssuePriority.MEDIUM
}

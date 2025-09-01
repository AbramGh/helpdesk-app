import { IsOptional, IsUUID, IsEnum, IsString, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { IssueStatus, IssuePriority } from "@prisma/client"

export class IssueFiltersDto {
  @ApiPropertyOptional({ description: "Organization ID" })
  @IsOptional()
  @IsUUID()
  organizationId?: string

  @ApiPropertyOptional({ description: "Issue status", enum: IssueStatus })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus

  @ApiPropertyOptional({ description: "Issue priority", enum: IssuePriority })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority

  @ApiPropertyOptional({ description: "Assignee user ID" })
  @IsOptional()
  @IsUUID()
  assigneeId?: string

  @ApiPropertyOptional({ description: "Reporter user ID" })
  @IsOptional()
  @IsUUID()
  reporterId?: string

  @ApiPropertyOptional({ description: "Search query" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: "Page number", minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: "Items per page", minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}

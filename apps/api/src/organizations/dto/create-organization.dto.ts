import { IsString, IsOptional, MaxLength, Matches } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateOrganizationDto {
  @ApiProperty({ description: "Organization name", maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({
    description: "Organization slug (URL-friendly identifier)",
    pattern: "^[a-z0-9-]+$",
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug: string

  @ApiPropertyOptional({ description: "Organization description" })
  @IsOptional()
  @IsString()
  description?: string
}

import { IsString, IsOptional, MaxLength, IsUrl } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiPropertyOptional({ description: "User name", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ description: "User avatar URL" })
  @IsOptional()
  @IsUrl()
  avatar?: string
}

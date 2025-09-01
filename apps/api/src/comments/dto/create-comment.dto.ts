import { IsString, IsUUID, MaxLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateCommentDto {
  @ApiProperty({ description: "Comment content", maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  content: string

  @ApiProperty({ description: "Issue ID" })
  @IsUUID()
  issueId: string
}

import { IsEmail, IsEnum } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { OrganizationRole } from "@prisma/client"

export class InviteMemberDto {
  @ApiProperty({ description: "Email of user to invite" })
  @IsEmail()
  email: string

  @ApiProperty({
    description: "Role to assign to the invited user",
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER,
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole = OrganizationRole.MEMBER
}

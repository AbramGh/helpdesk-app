import { Controller, Get, Patch, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { UsersService } from "./users.service"
import type { UpdateUserDto } from "./dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { User } from "@prisma/client"

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  getProfile(user: User) {
    return this.usersService.findProfile(user)
  }

  @Patch("profile")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  updateProfile(updateUserDto: UpdateUserDto, user: User) {
    return this.usersService.updateProfile(user, updateUserDto)
  }

  @Get("organization/:organizationId")
  @ApiOperation({ summary: "Get users in organization" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  @ApiResponse({ status: 403, description: "No access to organization" })
  getUsersByOrganization(organizationId: string, user: User) {
    return this.usersService.findByOrganization(organizationId, user)
  }
}

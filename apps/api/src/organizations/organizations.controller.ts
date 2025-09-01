import { Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { OrganizationsService } from "./organizations.service"
import type { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from "./dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { User } from "@prisma/client"

@ApiTags("organizations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({ status: 201, description: "Organization created successfully" })
  @ApiResponse({ status: 409, description: "Organization slug already taken" })
  create(createOrganizationDto: CreateOrganizationDto, user: User) {
    return this.organizationsService.create(createOrganizationDto, user)
  }

  @Get()
  @ApiOperation({ summary: "Get all organizations for current user" })
  @ApiResponse({ status: 200, description: "Organizations retrieved successfully" })
  findAll(user: User) {
    return this.organizationsService.findAll(user)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiResponse({ status: 200, description: "Organization retrieved successfully" })
  @ApiResponse({ status: 403, description: "No access to organization" })
  findOne(@Param('id') id: string, user: User) {
    return this.organizationsService.findOne(id, user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update organization" })
  @ApiResponse({ status: 200, description: "Organization updated successfully" })
  @ApiResponse({ status: 403, description: "Only owners can update organization" })
  update(@Param('id') id: string, updateOrganizationDto: UpdateOrganizationDto, user: User) {
    return this.organizationsService.update(id, updateOrganizationDto, user)
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Invite member to organization" })
  @ApiResponse({ status: 201, description: "Member invited successfully" })
  @ApiResponse({ status: 403, description: "No permission to invite members" })
  inviteMember(@Param('id') id: string, inviteMemberDto: InviteMemberDto, user: User) {
    return this.organizationsService.inviteMember(id, inviteMemberDto, user)
  }

  @Delete(":id/members/:memberId")
  @ApiOperation({ summary: "Remove member from organization" })
  @ApiResponse({ status: 200, description: "Member removed successfully" })
  @ApiResponse({ status: 403, description: "Only owners can remove members" })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, user: User) {
    return this.organizationsService.removeMember(id, memberId, user)
  }
}

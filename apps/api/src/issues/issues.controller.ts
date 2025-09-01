import { Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { IssuesService } from "./issues.service"
import type { CreateIssueDto, UpdateIssueDto, IssueFiltersDto } from "./dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { GetUser } from "../auth/decorators/get-user.decorator"
import type { User } from "@prisma/client"

@ApiTags("issues")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("issues")
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new issue" })
  @ApiResponse({ status: 201, description: "Issue created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - No access to organization" })
  create(createIssueDto: CreateIssueDto, @GetUser() user: User) {
    return this.issuesService.create(createIssueDto, user)
  }

  @Get()
  @ApiOperation({ summary: "Get all issues with filters" })
  @ApiResponse({ status: 200, description: "Issues retrieved successfully" })
  findAll(filters: IssueFiltersDto, @GetUser() user: User) {
    return this.issuesService.findAll(filters, user)
  }

  @Get("search")
  @ApiOperation({ summary: "Full-text search issues" })
  @ApiResponse({ status: 200, description: "Search results retrieved successfully" })
  search(query: string, organizationId: string, @GetUser() user: User) {
    return this.issuesService.searchFullText(query, organizationId, user)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get issue by ID" })
  @ApiResponse({ status: 200, description: "Issue retrieved successfully" })
  @ApiResponse({ status: 404, description: "Issue not found" })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.issuesService.findOne(id, user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update issue" })
  @ApiResponse({ status: 200, description: "Issue updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - No permission to update" })
  update(@Param('id') id: string, updateIssueDto: UpdateIssueDto, @GetUser() user: User) {
    return this.issuesService.update(id, updateIssueDto, user)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete issue" })
  @ApiResponse({ status: 200, description: "Issue deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - No permission to delete" })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.issuesService.remove(id, user)
  }
}

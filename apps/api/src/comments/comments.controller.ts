import { Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { CommentsService } from "./comments.service"
import type { CreateCommentDto, UpdateCommentDto } from "./dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { User } from "@prisma/client"

@ApiTags("comments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new comment" })
  @ApiResponse({ status: 201, description: "Comment created successfully" })
  @ApiResponse({ status: 403, description: "No access to issue" })
  create(createCommentDto: CreateCommentDto, user: User) {
    return this.commentsService.create(createCommentDto, user)
  }

  @Get("issue/:issueId")
  @ApiOperation({ summary: "Get comments for an issue" })
  @ApiResponse({ status: 200, description: "Comments retrieved successfully" })
  findByIssue(@Param('issueId') issueId: string, user: User) {
    return this.commentsService.findByIssue(issueId, user)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update comment" })
  @ApiResponse({ status: 200, description: "Comment updated successfully" })
  @ApiResponse({ status: 403, description: "Can only update own comments" })
  update(@Param('id') id: string, updateCommentDto: UpdateCommentDto, user: User) {
    return this.commentsService.update(id, updateCommentDto, user)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete comment" })
  @ApiResponse({ status: 200, description: "Comment deleted successfully" })
  @ApiResponse({ status: 403, description: "No permission to delete comment" })
  remove(@Param('id') id: string, user: User) {
    return this.commentsService.remove(id, user)
  }
}

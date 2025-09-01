import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateCommentDto, UpdateCommentDto } from "./dto"
import type { User, Comment } from "@prisma/client"

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const { issueId, content } = createCommentDto

    // Verify user has access to the issue
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: { organization: true },
    })

    if (!issue) {
      throw new NotFoundException("Issue not found")
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: issue.organizationId,
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this issue")
    }

    return this.prisma.comment.create({
      data: {
        content,
        issueId,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })
  }

  async findByIssue(issueId: string, user: User) {
    // Verify user has access to the issue
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    })

    if (!issue) {
      throw new NotFoundException("Issue not found")
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: issue.organizationId,
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this issue")
    }

    return this.prisma.comment.findMany({
      where: { issueId },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { issue: true },
    })

    if (!comment) {
      throw new NotFoundException("Comment not found")
    }

    // Only the author can update their comment
    if (comment.authorId !== user.id) {
      throw new ForbiddenException("You can only update your own comments")
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        issue: { include: { organization: true } },
        author: true,
      },
    })

    if (!comment) {
      throw new NotFoundException("Comment not found")
    }

    // Author can delete their own comment, or org owners/members can delete any comment
    const canDelete = comment.authorId === user.id

    if (!canDelete) {
      const membership = await this.prisma.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: comment.issue.organizationId,
          role: { in: ["OWNER", "MEMBER"] },
        },
      })

      if (!membership) {
        throw new ForbiddenException("You do not have permission to delete this comment")
      }
    }

    await this.prisma.comment.delete({
      where: { id },
    })
  }
}

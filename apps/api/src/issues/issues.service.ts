import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateIssueDto, UpdateIssueDto, IssueFiltersDto } from "./dto"
import { type User, type Issue, IssueStatus } from "@prisma/client"

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createIssueDto: CreateIssueDto, user: User): Promise<Issue> {
    const { organizationId, assigneeId, ...issueData } = createIssueDto

    // Verify user has access to organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this organization")
    }

    // Generate issue number
    const lastIssue = await this.prisma.issue.findFirst({
      where: { organizationId },
      orderBy: { issueNumber: "desc" },
    })

    const issueNumber = (lastIssue?.issueNumber || 0) + 1

    return this.prisma.issue.create({
      data: {
        ...issueData,
        issueNumber,
        organizationId,
        reporterId: user.id,
        assigneeId: assigneeId || null,
        status: IssueStatus.OPEN,
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    })
  }

  async findAll(filters: IssueFiltersDto, user: User) {
    const { organizationId, status, priority, assigneeId, reporterId, search, page = 1, limit = 20 } = filters

    // Verify user has access to organization
    if (organizationId) {
      const membership = await this.prisma.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId,
        },
      })

      if (!membership) {
        throw new ForbiddenException("You do not have access to this organization")
      }
    }

    const where: any = {}

    if (organizationId) {
      where.organizationId = organizationId
    } else {
      // If no specific org, show issues from user's organizations
      const userOrgs = await this.prisma.organizationMember.findMany({
        where: { userId: user.id },
        select: { organizationId: true },
      })
      where.organizationId = { in: userOrgs.map((org) => org.organizationId) }
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assigneeId) where.assigneeId = assigneeId
    if (reporterId) where.reporterId = reporterId

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [issues, total] = await Promise.all([
      this.prisma.issue.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.issue.count({ where }),
    ])

    return {
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string, user: User): Promise<Issue> {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        attachments: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    })

    if (!issue) {
      throw new NotFoundException("Issue not found")
    }

    // Verify user has access to organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: issue.organizationId,
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this issue")
    }

    return issue
  }

  async update(id: string, updateIssueDto: UpdateIssueDto, user: User): Promise<Issue> {
    const issue = await this.findOne(id, user)

    // Check if user can update this issue
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: issue.organizationId,
      },
    })

    if (!membership || (membership.role === "CLIENT" && issue.reporterId !== user.id)) {
      throw new ForbiddenException("You do not have permission to update this issue")
    }

    return this.prisma.issue.update({
      where: { id },
      data: updateIssueDto,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    })
  }

  async remove(id: string, user: User): Promise<void> {
    const issue = await this.findOne(id, user)

    // Only owners and members can delete issues
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: issue.organizationId,
      },
    })

    if (!membership || membership.role === "CLIENT") {
      throw new ForbiddenException("You do not have permission to delete this issue")
    }

    await this.prisma.issue.delete({
      where: { id },
    })
  }

  async searchFullText(query: string, organizationId: string, user: User) {
    // Verify user has access to organization
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this organization")
    }

    return this.prisma.$queryRaw`
      SELECT 
        id, title, description, status, priority, "issueNumber",
        ts_rank(search_vector, plainto_tsquery('helpdesk_search', ${query})) as rank
      FROM issues 
      WHERE 
        "organizationId" = ${organizationId}
        AND search_vector @@ plainto_tsquery('helpdesk_search', ${query})
      ORDER BY rank DESC, "createdAt" DESC
      LIMIT 50
    `
  }
}

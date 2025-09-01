import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from "./dto"
import { type User, type Organization, OrganizationRole } from "@prisma/client"

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto, user: User): Promise<Organization> {
    const { slug, ...orgData } = createOrganizationDto

    // Check if slug is already taken
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      throw new ConflictException("Organization slug is already taken")
    }

    // Create organization and add user as owner
    return this.prisma.organization.create({
      data: {
        ...orgData,
        slug,
        members: {
          create: {
            userId: user.id,
            role: OrganizationRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { issues: true, members: true },
        },
      },
    })
  }

  async findAll(user: User) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            _count: {
              select: { issues: true, members: true },
            },
          },
        },
      },
    })

    return memberships.map((membership) => ({
      ...membership.organization,
      role: membership.role,
    }))
  }

  async findOne(id: string, user: User): Promise<Organization> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
      },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            },
            _count: {
              select: { issues: true, members: true },
            },
          },
        },
      },
    })

    if (!membership) {
      throw new ForbiddenException("You do not have access to this organization")
    }

    return {
      ...membership.organization,
      userRole: membership.role,
    } as any
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto, user: User): Promise<Organization> {
    // Check if user is owner
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
        role: OrganizationRole.OWNER,
      },
    })

    if (!membership) {
      throw new ForbiddenException("Only organization owners can update organization details")
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { issues: true, members: true },
        },
      },
    })
  }

  async inviteMember(id: string, inviteMemberDto: InviteMemberDto, user: User) {
    // Check if user is owner or member
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
        role: { in: [OrganizationRole.OWNER, OrganizationRole.MEMBER] },
      },
    })

    if (!membership) {
      throw new ForbiddenException("Only owners and members can invite new members")
    }

    const { email, role } = inviteMemberDto

    // Find user by email
    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!invitedUser) {
      throw new NotFoundException("User not found")
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: invitedUser.id,
        organizationId: id,
      },
    })

    if (existingMembership) {
      throw new ConflictException("User is already a member of this organization")
    }

    // Only owners can invite other owners
    if (role === OrganizationRole.OWNER && membership.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException("Only owners can invite other owners")
    }

    return this.prisma.organizationMember.create({
      data: {
        userId: invitedUser.id,
        organizationId: id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })
  }

  async removeMember(id: string, memberId: string, user: User) {
    // Check if user is owner
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: id,
        role: OrganizationRole.OWNER,
      },
    })

    if (!membership) {
      throw new ForbiddenException("Only organization owners can remove members")
    }

    // Cannot remove yourself if you're the only owner
    if (memberId === user.id) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId: id,
          role: OrganizationRole.OWNER,
        },
      })

      if (ownerCount === 1) {
        throw new ForbiddenException("Cannot remove the last owner from organization")
      }
    }

    await this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId: id,
        },
      },
    })
  }
}

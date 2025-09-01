import { Injectable, ForbiddenException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { UpdateUserDto } from "./dto"
import type { User } from "@prisma/client"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findProfile(user: User) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        organizations: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    })
  }

  async updateProfile(user: User, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findByOrganization(organizationId: string, user: User) {
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

    return this.prisma.user.findMany({
      where: {
        organizations: {
          some: { organizationId },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        organizations: {
          where: { organizationId },
          select: { role: true },
        },
      },
    })
  }
}

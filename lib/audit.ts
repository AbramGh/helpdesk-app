import { prisma } from "./prisma"

export async function logAudit({
  organizationId,
  userId,
  area,
  action,
  before,
  after,
}: {
  organizationId: string
  userId: string
  area: string
  action: string
  before?: any
  after?: any
}) {
  try {
    await prisma.auditLog.create({
      data: { organizationId, userId, area, action, before, after },
    })
  } catch (error) {
    console.error("Failed to log audit:", error)
    // Don't throw - audit logging should not break the main flow
  }
}


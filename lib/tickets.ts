import { prisma } from './prisma'
import { generateTicketNumber, generateGenericTicketNumber } from './categories'

export interface CreateTicketData {
  title: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  authorId: string
  categoryId?: string
}

export async function createTicket(data: CreateTicketData) {
  // Generate ticket number based on category
  const number = data.categoryId 
    ? await generateTicketNumber(data.categoryId)
    : await generateGenericTicketNumber()

  // Create the ticket
  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      number,
      priority: data.priority || 'MEDIUM'
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          prefix: true,
          color: true
        }
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  return ticket
}

export async function getTickets(filters?: {
  status?: string
  categoryId?: string
  authorId?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}
  
  if (filters?.status) {
    where.status = filters.status
  }
  
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }
  
  if (filters?.authorId) {
    where.authorId = filters.authorId
  }

  return await prisma.ticket.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          prefix: true,
          color: true
        }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit,
    skip: filters?.offset
  })
}

export async function getTicketByNumber(number: string) {
  return await prisma.ticket.findUnique({
    where: { number },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          prefix: true,
          color: true
        }
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

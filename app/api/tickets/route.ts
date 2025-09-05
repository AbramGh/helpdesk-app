import { NextResponse } from "next/server"
import { createTicket, getTickets } from "@/lib/tickets"
import { z } from "zod"

const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  authorId: z.string(),
  categoryId: z.string().optional()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    const authorId = searchParams.get('authorId') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const tickets = await getTickets({
      status,
      categoryId,
      authorId,
      limit,
      offset
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const parsed = createTicketSchema.parse(data)
    
    const ticket = await createTicket(parsed)
    return NextResponse.json(ticket, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create ticket:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create ticket' }, 
      { status: 400 }
    )
  }
}

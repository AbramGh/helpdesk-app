import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
  active: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, events, secret, active } = webhookSchema.parse(body)

    // TODO: Get organization ID from authenticated user
    const organizationId = "org-1" // This should come from auth context

    const webhook = await prisma.webhook.create({
      data: {
        organizationId,
        url,
        events,
        secret: secret || generateSecret(),
        active,
      },
    })

    return NextResponse.json(webhook)
  } catch (error) {
    console.error("Webhook creation error:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get organization ID from authenticated user
    const organizationId = "org-1" // This should come from auth context

    const webhooks = await prisma.webhook.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("Webhook fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
  }
}

function generateSecret(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

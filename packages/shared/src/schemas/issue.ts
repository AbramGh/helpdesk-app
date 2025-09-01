import { z } from "zod"

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  urgency: z.enum(["low", "medium", "high"]),
  channel: z.enum(["email", "web", "api", "phone"]),
  clientId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
})

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["open", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  assigneeId: z.string().uuid().optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
  isInternal: z.boolean().default(false),
})

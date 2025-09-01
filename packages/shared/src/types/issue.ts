export interface Issue {
  id: string
  number: string
  title: string
  description?: string
  status: IssueStatus
  priority: IssuePriority
  urgency: IssueUrgency
  channel: IssueChannel
  assigneeId?: string
  clientId?: string
  organizationId: string
  createdById: string
  slaDueAt?: Date
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum IssueStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum IssuePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum IssueUrgency {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum IssueChannel {
  EMAIL = "email",
  WEB = "web",
  API = "api",
  PHONE = "phone",
}

export interface Comment {
  id: string
  content: string
  issueId: string
  authorId: string
  isInternal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  issueId?: string
  commentId?: string
  uploadedById: string
  createdAt: Date
}

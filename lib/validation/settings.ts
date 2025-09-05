import { z } from "zod"

// General Settings Schema
export const generalSettingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  supportEmail: z.string().email("Invalid email address"),
  supportPhone: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  businessHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  workingDays: z.array(z.number().min(0).max(6)),
  allowPublicRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
})

// Ticket Settings Schema
export const ticketSettingsSchema = z.object({
  defaultPriority: z.enum(["low", "medium", "high", "urgent"]),
  autoAssignment: z.boolean(),
  allowCustomerReplies: z.boolean(),
  autoCloseAfterDays: z.number().min(0).max(365),
  requireApprovalForClose: z.boolean(),
  ticketNumberPrefix: z.string().max(10),
  enableSLA: z.boolean(),
  slaResponseTime: z.number().min(1), // hours
  slaResolutionTime: z.number().min(1), // hours
})

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  browserNotifications: z.boolean(),
  notifyOnNewTicket: z.boolean(),
  notifyOnTicketUpdate: z.boolean(),
  notifyOnTicketAssignment: z.boolean(),
  notifyOnTicketEscalation: z.boolean(),
  digestFrequency: z.enum(["never", "daily", "weekly"]),
})

// Email Template Schema
export const emailTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  type: z.enum(["ticket_created", "ticket_updated", "ticket_resolved", "welcome"]),
  isActive: z.boolean(),
})

// Brand Theme Schema
export const brandThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  theme: z.enum(["light", "dark", "system"]),
  sidebarWidth: z.enum(["16rem", "19rem", "22rem"]),
  headerStyle: z.enum(["minimal", "standard", "compact"]),
  fontFamily: z.enum(["inter", "roboto", "system"]),
  fontSize: z.enum(["small", "medium", "large"]),
})

// Email Configuration Schema
export const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1).max(65535),
  smtpSecure: z.boolean(),
  smtpUser: z.string().min(1, "SMTP user is required"),
  smtpPass: z.string().min(1, "SMTP password is required"),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Invalid from email address"),
})

// Advanced Settings Schema
export const advancedSettingsSchema = z.object({
  enableLogging: z.boolean(),
  logLevel: z.enum(["error", "warn", "info", "debug"]),
  enableAnalytics: z.boolean(),
  dataRetentionDays: z.number().min(30).max(2555), // 7 years max
  enableBackups: z.boolean(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]),
  maxFileUploadSize: z.number().min(1).max(100), // MB
  allowedFileTypes: z.array(z.string()),
  enableApiAccess: z.boolean(),
  apiRateLimit: z.number().min(10).max(10000), // requests per hour
})

// Automation Settings Schema  
export const automationSettingsSchema = z.object({
  autoAssignNewTickets: z.boolean(),
  autoEscalateOverdueTickets: z.boolean(),
  escalationThresholdHours: z.number().min(1).max(168), // 1 week max
  autoCloseResolvedTickets: z.boolean(),
  autoCloseThresholdDays: z.number().min(1).max(90),
  enableSmartRouting: z.boolean(),
  enableAutoResponder: z.boolean(),
  autoResponderMessage: z.string().optional(),
})

export type GeneralSettings = z.infer<typeof generalSettingsSchema>
export type TicketSettings = z.infer<typeof ticketSettingsSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type EmailTemplate = z.infer<typeof emailTemplateSchema>
export type BrandTheme = z.infer<typeof brandThemeSchema>
export type EmailConfig = z.infer<typeof emailConfigSchema>
export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>
export type AutomationSettings = z.infer<typeof automationSettingsSchema>


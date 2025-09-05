"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Palette, 
  Database, 
  Users,
  Save,
  RefreshCw,
  Clock,
  FileText,
  Zap,
  Globe,
  Eye,
  AlertTriangle,
  CheckCircle,
  Upload,
  TestTube,
  Calendar
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GeneralSettings {
  companyName: string
  supportEmail: string
  replyToEmail?: string
  welcomeMessage?: string
  timezone: string
  defaultLanguage: string
  autoAssignEnabled: boolean
  businessHours?: Record<string, { enabled: boolean; start: string; end: string }>
}

interface TicketSettings {
  defaultStatus: string
  defaultPriority: string
  autoCloseAfterDays: number
  maxAttachmentSize: number
  allowedAttachmentTypes: string[]
  requireCategoryOnCreate: boolean
  allowPublicSubmission: boolean
  enableCaptcha: boolean
}

interface NotificationSettings {
  emailEnabled: boolean
  events: {
    newTicket: boolean
    ticketAssigned: boolean
    ticketReply: boolean
    statusChanged: boolean
    slaBreach: boolean
  }
}

interface SLASettings {
  enabled: boolean
  businessHoursOnly: boolean
  targets: Array<{
    priority: string
    firstResponseHours: number
    resolutionHours: number
  }>
}

interface BrandTheme {
  // Brand Identity
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  
  // Layout Theme
  theme: 'light' | 'dark' | 'auto'
  sidebarWidth: 'narrow' | 'normal' | 'wide'
  headerStyle: 'minimal' | 'standard' | 'prominent'
  
  // Typography
  fontFamily: 'system' | 'inter' | 'roboto' | 'open-sans'
  fontSize: 'small' | 'medium' | 'large'
}

interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  fromName: string
  fromEmail: string
}

interface SecuritySettings {
  mfaRequired: boolean
  dataRetentionDays: number
  ipAllowlist?: string
  auditLogRetentionDays: number
}

interface AutomationSettings {
  assignmentPolicy: string
  enableAutoRouting: boolean
  enableAutoTags: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // General Settings State
  const [general, setGeneral] = useState<GeneralSettings>({
    companyName: "",
    supportEmail: "support@agnuscloud.com",
    replyToEmail: "",
    welcomeMessage: "",
    timezone: "UTC",
    defaultLanguage: "en",
    autoAssignEnabled: false,
    businessHours: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "09:00", end: "17:00" },
      sunday: { enabled: false, start: "09:00", end: "17:00" },
    }
  })

  // Ticket Settings State
  const [tickets, setTickets] = useState<TicketSettings>({
    defaultStatus: "OPEN",
    defaultPriority: "MEDIUM",
    autoCloseAfterDays: 30,
    maxAttachmentSize: 10,
    allowedAttachmentTypes: ["pdf", "doc", "docx", "txt", "jpg", "png"],
    requireCategoryOnCreate: false,
    allowPublicSubmission: true,
    enableCaptcha: false,
  })

  // Notification Settings State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailEnabled: true,
    events: {
      newTicket: true,
      ticketAssigned: true,
      ticketReply: true,
      statusChanged: true,
      slaBreach: true,
    }
  })

  // SLA Settings State
  const [sla, setSla] = useState<SLASettings>({
    enabled: false,
    businessHoursOnly: true,
    targets: [
      { priority: "LOW", firstResponseHours: 24, resolutionHours: 72 },
      { priority: "MEDIUM", firstResponseHours: 8, resolutionHours: 24 },
      { priority: "HIGH", firstResponseHours: 4, resolutionHours: 8 },
      { priority: "URGENT", firstResponseHours: 1, resolutionHours: 4 },
    ]
  })

  // Brand Theme State
  const [theme, setTheme] = useState<BrandTheme>({
    // Brand Identity
    primaryColor: "#3b82f6",
    secondaryColor: "#f1f5f9",
    logoUrl: "",
    
    // Layout Theme
    theme: "light",
    sidebarWidth: "normal",
    headerStyle: "standard",
    
    // Typography
    fontFamily: "inter",
    fontSize: "medium",
  })

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false, // Default false for port 587 (STARTTLS)
    smtpUser: "",
    fromName: "",
    fromEmail: "",
  })
  
  const [smtpPassword, setSmtpPassword] = useState("")
  const [testEmailAddress, setTestEmailAddress] = useState("")

  // Security Settings State
  const [security, setSecurity] = useState<SecuritySettings>({
    mfaRequired: false,
    dataRetentionDays: 2555, // 7 years
    ipAllowlist: "",
    auditLogRetentionDays: 365,
  })

  // Automation Settings State
  const [automation, setAutomation] = useState<AutomationSettings>({
    assignmentPolicy: "MANUAL",
    enableAutoRouting: false,
    enableAutoTags: false,
  })

  const [testEmailSending, setTestEmailSending] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{ event: string; subject: string; content: string } | null>(null)
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] })
  const [showCreateRole, setShowCreateRole] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    loadAllSettings()
  }, [])

  const loadAllSettings = async () => {
    try {
      // Load general settings
      const generalRes = await fetch("/api/settings/general")
      if (generalRes.ok) {
        const generalData = await generalRes.json()
        setGeneral(generalData)
      }

      // Load ticket settings
      const ticketRes = await fetch("/api/settings/tickets")
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json()
        setTickets(ticketData)
      }

      // Load notification settings
      const notificationRes = await fetch("/api/settings/notifications")
      if (notificationRes.ok) {
        const notificationData = await notificationRes.json()
        setNotifications(notificationData)
      }

      // Load other settings...
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const saveSettings = async (section: string, data: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been updated successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  const sendTestEmail = async () => {
    setTestEmailSending(true)
    console.log("Sending test email with SMTP configuration...")
    
    try {
      if (!smtpPassword) {
        throw new Error("Please enter your SMTP password first")
      }
      
      if (!testEmailAddress) {
        throw new Error("Please enter a test email address")
      }

      const testConfig = {
        smtpHost: emailConfig.smtpHost,
        smtpPort: emailConfig.smtpPort,
        smtpSecure: emailConfig.smtpPort === 465, // Auto-detect: 465 = SSL, 587 = STARTTLS
        smtpUser: emailConfig.smtpUser,
        smtpPass: smtpPassword,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        toEmail: testEmailAddress
      }

      const response = await fetch("/api/settings/email/test-with-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testConfig),
      })

      console.log("Test email response status:", response.status)
      
      const data = await response.json()
      console.log("Test email response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send test email`)
      }

      if (data.success) {
        toast({
          title: "Test email sent",
          description: data.message || "SMTP configuration validated and test email sent.",
        })
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("Test email error:", error)
      toast({
        title: "Test email failed",
        description: error.message || "Failed to validate SMTP configuration.",
        variant: "destructive",
      })
    } finally {
      setTestEmailSending(false)
    }
  }

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/settings/appearance/logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload logo")
      }

      const data = await response.json()
      setTheme({ ...theme, logoUrl: data.url })

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const saveEmailTemplate = async (event: string, subject: string, content: string) => {
    try {
      const response = await fetch(`/api/settings/notifications/templates/${event}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          htmlContent: content,
          textContent: content.replace(/<[^>]*>/g, ""), // Strip HTML for text version
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save template")
      }

      toast({
        title: "Template saved",
        description: `Email template for ${event.replace(/([A-Z])/g, ' $1').trim()} has been updated.`,
      })
      setEditingTemplate(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const createCustomRole = async () => {
    try {
      const response = await fetch("/api/settings/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      })

      if (!response.ok) {
        throw new Error("Failed to create role")
      }

      toast({
        title: "Role created",
        description: `Custom role "${newRole.name}" has been created successfully.`,
      })
      setShowCreateRole(false)
      setNewRole({ name: "", permissions: [] })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetToDefaults = async (section: string) => {
    try {
      const response = await fetch(`/api/settings/${section}/reset`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to reset settings")
      }

      toast({
        title: "Settings reset",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been reset to defaults.`,
      })
      
      // Reload settings
      await loadAllSettings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportSettings = async () => {
    try {
      const response = await fetch("/api/settings/export")
      if (!response.ok) {
        throw new Error("Failed to export settings")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `helpdesk-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Settings exported",
        description: "Your settings have been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const importSettings = async (file: File) => {
    try {
      const text = await file.text()
      const settings = JSON.parse(text)

      const response = await fetch("/api/settings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to import settings")
      }

      toast({
        title: "Settings imported",
        description: "Your settings have been imported successfully.",
      })
      
      // Reload settings
      await loadAllSettings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import settings. Please check the file format.",
        variant: "destructive",
      })
    }
  }

  const performBackup = async () => {
    try {
      const response = await fetch("/api/settings/backup", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create backup")
      }

      toast({
        title: "Backup created",
        description: "System backup has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch("/api/settings/cache/clear", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to clear cache")
      }

      toast({
        title: "Cache cleared",
        description: "System cache has been cleared successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      })
    }
  }

  const weekdays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your helpdesk configuration and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic configuration for your helpdesk system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={general.companyName}
                      onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email *</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={general.supportEmail}
                      onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                      placeholder="support@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reply-to-email">Reply-To Email</Label>
                  <Input
                    id="reply-to-email"
                    type="email"
                    value={general.replyToEmail || ""}
                    onChange={(e) => setGeneral({ ...general, replyToEmail: e.target.value })}
                    placeholder="Optional reply-to address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea 
                    id="welcome-message" 
                    value={general.welcomeMessage || ""}
                    onChange={(e) => setGeneral({ ...general, welcomeMessage: e.target.value })}
                    placeholder="Welcome message for the client portal"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={general.timezone} onValueChange={(value: string) => setGeneral({ ...general, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/Amsterdam">Central European Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={general.defaultLanguage} onValueChange={(value: string) => setGeneral({ ...general, defaultLanguage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="nl">Dutch</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-assignment" 
                    checked={general.autoAssignEnabled}
                    onCheckedChange={(checked: boolean) => setGeneral({ ...general, autoAssignEnabled: checked })}
                  />
                  <Label htmlFor="auto-assignment">Enable automatic ticket assignment</Label>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Business Hours</Label>
                  <div className="space-y-3">
                    {weekdays.map((day) => (
                      <div key={day.key} className="flex items-center space-x-4">
                        <div className="w-20">
                          <Checkbox
                            id={`${day.key}-enabled`}
                            checked={general.businessHours?.[day.key]?.enabled || false}
                            onCheckedChange={(checked) => {
                              const newBusinessHours = { ...general.businessHours }
                              if (!newBusinessHours[day.key]) {
                                newBusinessHours[day.key] = { enabled: false, start: "09:00", end: "17:00" }
                              }
                              newBusinessHours[day.key].enabled = checked as boolean
                              setGeneral({ ...general, businessHours: newBusinessHours })
                            }}
                          />
                          <Label htmlFor={`${day.key}-enabled`} className="ml-2 text-sm">
                            {day.label}
                          </Label>
                        </div>
                        {general.businessHours?.[day.key]?.enabled && (
                          <>
                            <Input
                              type="time"
                              value={general.businessHours[day.key].start}
                              onChange={(e) => {
                                const newBusinessHours = { ...general.businessHours }
                                newBusinessHours[day.key].start = e.target.value
                                setGeneral({ ...general, businessHours: newBusinessHours })
                              }}
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={general.businessHours[day.key].end}
                              onChange={(e) => {
                                const newBusinessHours = { ...general.businessHours }
                                newBusinessHours[day.key].end = e.target.value
                                setGeneral({ ...general, businessHours: newBusinessHours })
                              }}
                              className="w-32"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("general", general)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ticket Settings
                </CardTitle>
                <CardDescription>
                  Configure default ticket behavior and constraints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-status">Default Status</Label>
                    <Select value={tickets.defaultStatus} onValueChange={(value) => setTickets({ ...tickets, defaultStatus: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-priority">Default Priority</Label>
                    <Select value={tickets.defaultPriority} onValueChange={(value) => setTickets({ ...tickets, defaultPriority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-close-days">Auto-close after (days)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[tickets.autoCloseAfterDays]}
                      onValueChange={(value) => setTickets({ ...tickets, autoCloseAfterDays: value[0] })}
                      max={365}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Never</span>
                      <span>{tickets.autoCloseAfterDays} days</span>
                      <span>1 year</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-attachment-size">Max Attachment Size (MB)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[tickets.maxAttachmentSize]}
                      onValueChange={(value) => setTickets({ ...tickets, maxAttachmentSize: value[0] })}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1 MB</span>
                      <span>{tickets.maxAttachmentSize} MB</span>
                      <span>100 MB</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-category"
                      checked={tickets.requireCategoryOnCreate}
                      onCheckedChange={(checked) => setTickets({ ...tickets, requireCategoryOnCreate: checked })}
                    />
                    <Label htmlFor="require-category">Require category when creating tickets</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-public"
                      checked={tickets.allowPublicSubmission}
                      onCheckedChange={(checked) => setTickets({ ...tickets, allowPublicSubmission: checked })}
                    />
                    <Label htmlFor="allow-public">Allow public ticket submission</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-captcha"
                      checked={tickets.enableCaptcha}
                      onCheckedChange={(checked) => setTickets({ ...tickets, enableCaptcha: checked })}
                    />
                    <Label htmlFor="enable-captcha">Enable CAPTCHA for public submissions</Label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("tickets", tickets)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Ticket Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SLA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  SLA Settings
                </CardTitle>
                <CardDescription>
                  Configure service level agreement targets and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable SLA Monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Track response and resolution times
                    </p>
                  </div>
                  <Switch
                    checked={sla.enabled}
                    onCheckedChange={(checked) => setSla({ ...sla, enabled: checked })}
                  />
                </div>

                {sla.enabled && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="business-hours-only"
                        checked={sla.businessHoursOnly}
                        onCheckedChange={(checked) => setSla({ ...sla, businessHoursOnly: checked })}
                      />
                      <Label htmlFor="business-hours-only">
                        Calculate SLA only during business hours
                      </Label>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-medium">SLA Targets by Priority</Label>
                      <div className="space-y-4">
                        {sla.targets.map((target, index) => (
                          <Card key={target.priority}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge variant={
                                  target.priority === 'URGENT' ? 'destructive' :
                                  target.priority === 'HIGH' ? 'default' :
                                  target.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                }>
                                  {target.priority}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>First Response (hours)</Label>
                                  <Input
                                    type="number"
                                    value={target.firstResponseHours}
                                    onChange={(e) => {
                                      const newTargets = [...sla.targets]
                                      newTargets[index].firstResponseHours = parseInt(e.target.value) || 0
                                      setSla({ ...sla, targets: newTargets })
                                    }}
                                    min="1"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Resolution (hours)</Label>
                                  <Input
                                    type="number"
                                    value={target.resolutionHours}
                                    onChange={(e) => {
                                      const newTargets = [...sla.targets]
                                      newTargets[index].resolutionHours = parseInt(e.target.value) || 0
                                      setSla({ ...sla, targets: newTargets })
                                    }}
                                    min="1"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("sla", sla)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save SLA Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how notifications are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                    </div>
                    <Switch 
                    checked={notifications.emailEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailEnabled: checked })}
                    />
                  </div>
                  
                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Email Events</Label>
                  <div className="space-y-4">
                    {Object.entries(notifications.events).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                          <Label className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {key === 'newTicket' && 'When a new ticket is created'}
                            {key === 'ticketAssigned' && 'When a ticket is assigned to an agent'}
                            {key === 'ticketReply' && 'When someone replies to a ticket'}
                            {key === 'statusChanged' && 'When ticket status changes'}
                            {key === 'slaBreach' && 'When SLA targets are breached'}
                          </p>
                    </div>
                    <Switch 
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            setNotifications({
                              ...notifications,
                              events: { ...notifications.events, [key]: checked }
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Email Templates</Label>
                  <div className="grid gap-4">
                    {Object.keys(notifications.events).map((eventKey) => (
                      <div key={eventKey} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                          <p className="font-medium capitalize">
                            {eventKey.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Customize the email template for this event
                          </p>
                      </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingTemplate({ 
                                event: eventKey, 
                                subject: `New ${eventKey.replace(/([A-Z])/g, ' $1').trim()}`, 
                                content: `<p>Dear \{\{user.name\}\},</p><p>This is regarding ticket #\{\{ticket.number\}\}: \{\{ticket.title\}\}</p><p>Best regards,<br>\{\{company.name\}\} Support Team</p>` 
                              })}
                            >
                              Edit Template
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Email Template</DialogTitle>
                              <DialogDescription>
                                Customize the email template for {eventKey.replace(/([A-Z])/g, ' $1').trim()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="template-subject">Subject</Label>
                                <Input
                                  id="template-subject"
                                  value={editingTemplate?.subject || ""}
                                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                  placeholder="Email subject line"
                                />
                    </div>
                              <div className="space-y-2">
                                <Label htmlFor="template-content">Content</Label>
                                <Textarea
                                  id="template-content"
                                  value={editingTemplate?.content || ""}
                                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                                  placeholder="Email content (HTML supported)"
                                  rows={10}
                                />
                      </div>
                              <div className="text-sm text-muted-foreground">
                                Available variables: {`{{ticket.number}}, {{ticket.title}}, {{user.name}}, {{company.name}}`}
                    </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => setEditingTemplate(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => editingTemplate && saveEmailTemplate(editingTemplate.event, editingTemplate.subject, editingTemplate.content)}
                                  disabled={!editingTemplate?.subject || !editingTemplate?.content}
                                >
                                  Save Template
                                </Button>
                  </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("notifications", notifications)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings for outbound email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host *</Label>
                    <Input
                      id="smtp-host"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port *</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={emailConfig.smtpPort}
                      onChange={(e) => {
                        const port = parseInt(e.target.value) || 587
                        setEmailConfig({ 
                          ...emailConfig, 
                          smtpPort: port,
                          smtpSecure: port === 465 // Auto-set security based on port
                        })
                      }}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp-secure"
                    checked={emailConfig.smtpSecure}
                    onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, smtpSecure: checked })}
                  />
                  <Label htmlFor="smtp-secure">Use SSL/TLS encryption</Label>
                  <p className="text-xs text-muted-foreground ml-2">
                    (Port 465: SSL, Port 587: STARTTLS)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username *</Label>
                  <Input
                    id="smtp-user"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password *</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="Enter SMTP password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password is only used for testing and not saved
                  </p>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name *</Label>
                    <Input
                      id="from-name"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      placeholder="Support Team"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email *</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      placeholder="support@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Test Email Address *</Label>
                    <Input
                      id="test-email"
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Enter your email to receive test"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your email address to receive the test email
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      onClick={sendTestEmail}
                      disabled={testEmailSending || !emailConfig.smtpHost || !smtpPassword || !testEmailAddress}
                      className={testEmailSending ? "animate-pulse" : ""}
                    >
                      <Mail className={`h-4 w-4 mr-2 ${testEmailSending ? "animate-spin" : ""}`} />
                      {testEmailSending ? "Sending Test Email..." : "Send Test Email"}
                    </Button>
                  </div>
                  
                  {testEmailSending && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                      <span>Connecting to {emailConfig.smtpHost} and sending test email...</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg border">
                    <div className="font-medium text-gray-900 mb-1">Email Test Information:</div>
                    <div>This will connect to your SMTP server and send a real test email to verify your configuration.</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("email", emailConfig)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Users & Roles */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users & Roles
                </CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                    <div>
                      <p className="font-medium">Administrator</p>
                        <p className="text-sm text-muted-foreground">
                          Full system access and management capabilities
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">System Role</Badge>
                          <span className="text-xs text-muted-foreground">3 users</span>
                    </div>
                  </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Permissions
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    <div>
                      <p className="font-medium">Agent</p>
                        <p className="text-sm text-muted-foreground">
                          Can view, create, and respond to tickets
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">System Role</Badge>
                          <span className="text-xs text-muted-foreground">8 users</span>
                    </div>
                  </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Permissions
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-600" />
                      </div>
                    <div>
                      <p className="font-medium">Client</p>
                        <p className="text-sm text-muted-foreground">
                          Can submit tickets and view their own issues
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">System Role</Badge>
                          <span className="text-xs text-muted-foreground">142 users</span>
                    </div>
                  </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Permissions
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Create Custom Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Role</DialogTitle>
                        <DialogDescription>
                          Define a new role with specific permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input
                            id="role-name"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            placeholder="Enter role name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Permissions</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["view_tickets", "create_tickets", "edit_tickets", "delete_tickets", "manage_users", "manage_settings"].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission}
                                  checked={newRole.permissions.includes(permission)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setNewRole({ ...newRole, permissions: [...newRole.permissions, permission] })
                                    } else {
                                      setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission) })
                                    }
                                  }}
                                />
                                <Label htmlFor={permission} className="text-sm capitalize">
                                  {permission.replace(/_/g, ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={createCustomRole}
                            disabled={!newRole.name || newRole.permissions.length === 0}
                          >
                            Create Role
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => window.open('/admin/users', '_blank')}>
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and data retention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Multi-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Force all users to enable MFA for enhanced security
                    </p>
                  </div>
                  <Switch
                    checked={security.mfaRequired}
                    onCheckedChange={(checked) => setSecurity({ ...security, mfaRequired: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention (days)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[security.dataRetentionDays]}
                        onValueChange={(value) => setSecurity({ ...security, dataRetentionDays: value[0] })}
                        max={3650}
                        min={30}
                        step={30}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>30 days</span>
                        <span>{security.dataRetentionDays} days ({Math.round(security.dataRetentionDays / 365 * 10) / 10} years)</span>
                        <span>10 years</span>
                    </div>
                  </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically delete closed tickets after this period
                    </p>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[security.auditLogRetentionDays]}
                        onValueChange={(value) => setSecurity({ ...security, auditLogRetentionDays: value[0] })}
                        max={2555}
                        min={30}
                        step={30}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>30 days</span>
                        <span>{security.auditLogRetentionDays} days</span>
                        <span>7 years</span>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ip-allowlist">IP Allowlist (Admin Access)</Label>
                    <Textarea
                      id="ip-allowlist"
                      value={security.ipAllowlist || ""}
                      onChange={(e) => setSecurity({ ...security, ipAllowlist: e.target.value })}
                      placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      One IP address or CIDR block per line. Leave empty to allow all IPs.
                    </p>
                    </div>
                  </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">System Operations</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Backup & Export
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" onClick={performBackup} className="w-full">
                          Create System Backup
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportSettings} className="w-full">
                          Export Settings
                        </Button>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            id="import-settings"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) importSettings(file)
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('import-settings')?.click()}
                            className="w-full"
                          >
                            Import Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          System Maintenance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" onClick={clearCache} className="w-full">
                          Clear System Cache
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              Reset to Defaults
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will reset all settings to their default values. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => resetToDefaults("security")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Reset All Settings
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("security", security)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                      {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
              {/* Brand Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                    Brand Identity
                </CardTitle>
                  <CardDescription>
                    Set your company logo and brand colors
                  </CardDescription>
              </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                        <div className="w-20 h-12 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                          {theme.logoUrl ? (
                            <img src={theme.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          )}
                    </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) uploadLogo(file)
                            }}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            disabled={uploadingLogo}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingLogo ? "Uploading..." : "Upload Logo"}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 200x60px, PNG or SVG
                          </p>
                        </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                          <div 
                            className="w-10 h-10 rounded border border-input"
                            style={{ backgroundColor: theme.primaryColor }}
                          ></div>
                          <Input
                            id="primary-color"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                            placeholder="#3b82f6"
                          />
                    </div>
                        <p className="text-xs text-muted-foreground">
                          Used for buttons, links, and highlights
                        </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                          <div 
                            className="w-10 h-10 rounded border border-input"
                            style={{ backgroundColor: theme.secondaryColor }}
                          ></div>
                          <Input
                            id="secondary-color"
                            value={theme.secondaryColor}
                            onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                            placeholder="#f1f5f9"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used for backgrounds and subtle elements
                        </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Layout & Theme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Layout & Theme
                </CardTitle>
                  <CardDescription>
                    Configure the overall layout and appearance
                  </CardDescription>
              </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Theme Mode</Label>
                      <Select value={theme.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => setTheme({ ...theme, theme: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Controls the overall color scheme
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Sidebar Width</Label>
                      <Select value={theme.sidebarWidth} onValueChange={(value: 'narrow' | 'normal' | 'wide') => setTheme({ ...theme, sidebarWidth: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Narrow (16rem)</SelectItem>
                          <SelectItem value="normal">Normal (19rem)</SelectItem>
                          <SelectItem value="wide">Wide (22rem)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Width of the navigation sidebar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Header Style</Label>
                      <Select value={theme.headerStyle} onValueChange={(value: 'minimal' | 'standard' | 'prominent') => setTheme({ ...theme, headerStyle: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="prominent">Prominent</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Header height and prominence
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Typography
                  </CardTitle>
                  <CardDescription>
                    Choose fonts and text sizes for the interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select value={theme.fontFamily} onValueChange={(value: 'system' | 'inter' | 'roboto' | 'open-sans') => setTheme({ ...theme, fontFamily: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="open-sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Font used throughout the interface
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select value={theme.fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => setTheme({ ...theme, fontSize: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Base font size for all text
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your changes will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="space-y-3">
                        {/* Header Preview */}
                        <div className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: theme.primaryColor }}>
                    <div className="flex items-center space-x-3">
                            {theme.logoUrl ? (
                              <img src={theme.logoUrl} alt="Logo" className="h-6" />
                            ) : (
                              <div className="h-6 w-6 bg-white/20 rounded"></div>
                            )}
                            <span className="text-white font-medium">Helpdesk</span>
                      </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white/20 rounded"></div>
                            <div className="w-6 h-6 bg-white/20 rounded"></div>
                      </div>
                    </div>
                        
                        {/* Content Preview */}
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-foreground/10 rounded"></div>
                            <div className="h-3 bg-foreground/10 rounded w-3/4"></div>
                            <div className="h-3 bg-foreground/10 rounded w-1/2"></div>
                            <div className="h-3 bg-foreground/10 rounded w-2/3"></div>
                          </div>
                          <div className="col-span-3 space-y-2">
                            <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
                            <div className="h-3 bg-foreground/10 rounded w-full"></div>
                            <div className="h-3 bg-foreground/10 rounded w-5/6"></div>
                            <div className="h-3 bg-foreground/10 rounded w-3/4"></div>
                          </div>
                  </div>
                  
                        {/* Button Preview */}
                        <div className="flex space-x-2">
                          <div 
                            className="px-4 py-2 rounded text-white text-sm"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            Primary Button
                      </div>
                          <div className="px-4 py-2 rounded border text-sm">
                            Secondary Button
                      </div>
                    </div>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings("appearance", theme)} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </div>
          </TabsContent>


          {/* Automation Settings */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic assignment and routing rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="assignment-policy">Assignment Policy</Label>
                  <Select value={automation.assignmentPolicy} onValueChange={(value) => setAutomation({ ...automation, assignmentPolicy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual Assignment</SelectItem>
                      <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                      <SelectItem value="LEAST_LOAD">Least Load</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {automation.assignmentPolicy === 'MANUAL' && 'Tickets are assigned manually by agents or administrators'}
                    {automation.assignmentPolicy === 'ROUND_ROBIN' && 'Tickets are distributed evenly among available agents'}
                    {automation.assignmentPolicy === 'LEAST_LOAD' && 'Tickets are assigned to agents with the fewest open tickets'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                      <Label>Auto-routing</Label>
                    <p className="text-sm text-muted-foreground">
                        Automatically route tickets based on rules
                    </p>
                  </div>
                  <Switch 
                      checked={automation.enableAutoRouting}
                      onCheckedChange={(checked) => setAutomation({ ...automation, enableAutoRouting: checked })}
                    />
                      </div>

                  {automation.enableAutoRouting && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Routing Rules</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline">Subject Contains</Badge>
                            <span className="text-sm">"urgent"</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <Badge>High Priority Agent</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                    </div>
                          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline">From Email</Badge>
                            <span className="text-sm">"@enterprise.com"</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <Badge>Enterprise Team</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Add Routing Rule
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-tagging</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically add tags based on content
                      </p>
                      </div>
                    <Switch
                      checked={automation.enableAutoTags}
                      onCheckedChange={(checked) => setAutomation({ ...automation, enableAutoTags: checked })}
                    />
                      </div>

                  {automation.enableAutoTags && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tagging Rules</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline">Subject Contains</Badge>
                            <span className="text-sm">"password"</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <Badge variant="secondary">security</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                    </Button>
                    </div>
                          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline">Body Contains</Badge>
                            <span className="text-sm">"bug"</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <Badge variant="secondary">bug-report</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Add Tagging Rule
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings("automation", automation)} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Automation Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
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
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Palette, 
  Database, 
  Users,
  Save,
  RefreshCw
} from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackNotifications, setSlackNotifications] = useState(false)
  const [autoAssignment, setAutoAssignment] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your helpdesk configuration and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic configuration for your helpdesk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="Acme Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" defaultValue="support@acme.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea 
                    id="welcome-message" 
                    defaultValue="Welcome to our helpdesk! We're here to help you with any questions or issues you may have."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-assignment" 
                    checked={autoAssignment}
                    onCheckedChange={setAutoAssignment}
                  />
                  <Label htmlFor="auto-assignment">Enable automatic issue assignment</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how and when notifications are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to Slack channels</p>
                    </div>
                    <Switch 
                      checked={slackNotifications}
                      onCheckedChange={setSlackNotifications}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Email Templates</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">New Issue Created</p>
                        <p className="text-sm text-muted-foreground">Sent when a new issue is submitted</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Issue Resolved</p>
                        <p className="text-sm text-muted-foreground">Sent when an issue is marked as resolved</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User & Role Management
                </CardTitle>
                <CardDescription>Configure user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Administrator</p>
                      <p className="text-sm text-muted-foreground">Full system access and management</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Agent</p>
                      <p className="text-sm text-muted-foreground">Can view and respond to issues</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">Can submit and view own issues</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize the look and feel of your helpdesk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Logo</span>
                    </div>
                    <Button variant="outline">Upload New Logo</Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded border"></div>
                      <Input id="primary-color" defaultValue="#000000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary rounded border"></div>
                      <Input id="secondary-color" defaultValue="#f1f5f9" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect with external services and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Email Integration</p>
                        <p className="text-sm text-muted-foreground">SMTP configuration for outbound emails</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <Shield className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Single Sign-On (SSO)</p>
                        <p className="text-sm text-muted-foreground">SAML/OAuth integration</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>System-level configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the helpdesk for maintenance
                    </p>
                  </div>
                  <Switch 
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">System Operations</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}


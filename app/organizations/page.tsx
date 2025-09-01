import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Users, Settings, MoreHorizontal, Plus, Search } from "lucide-react"

export default function OrganizationsPage() {
  const organizations = [
    {
      id: 1,
      name: "Acme Corporation",
      domain: "acme.com",
      members: 24,
      issues: 12,
      status: "active",
      plan: "Enterprise",
    },
    {
      id: 2,
      name: "TechStart Inc",
      domain: "techstart.io",
      members: 8,
      issues: 5,
      status: "active",
      plan: "Professional",
    },
    {
      id: 3,
      name: "Global Solutions",
      domain: "globalsol.com",
      members: 45,
      issues: 23,
      status: "active",
      plan: "Enterprise",
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-muted-foreground">Manage client organizations and their access</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search organizations..." className="pl-10" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&query=${org.name} logo`} />
                  <AvatarFallback>
                    <Building2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{org.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{org.domain}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={org.status === "active" ? "default" : "secondary"}>{org.status}</Badge>
                <Badge variant="outline">{org.plan}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Members</p>
                  <p className="font-medium">{org.members}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Open Issues</p>
                  <p className="font-medium">{org.issues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

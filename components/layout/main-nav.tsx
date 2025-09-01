"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Ticket, Building2, Users, Settings, BarChart3 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Issues", href: "/issues", icon: Ticket },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

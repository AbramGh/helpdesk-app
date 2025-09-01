"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/examples/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Overview
      </Link>
      <Link
        href="/examples/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Customers
      </Link>
      <Link
        href="/examples/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Products
      </Link>
      <Link
        href="/examples/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/examples/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Settings
      </Link>
    </nav>
  )
}


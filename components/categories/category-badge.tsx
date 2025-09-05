"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  prefix: string
  color: string | null
}

interface CategoryBadgeProps {
  category: Category
  showName?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

export function CategoryBadge({ 
  category, 
  showName = false, 
  size = "default",
  className 
}: CategoryBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1.5"
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: category.color ? `${category.color}15` : '#f1f5f9',
        borderColor: category.color || '#94a3b8',
        color: category.color || '#64748b'
      }}
    >
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: category.color || '#6B7280' }}
      />
      <span>{category.prefix}</span>
      {showName && (
        <>
          <span className="text-muted-foreground">•</span>
          <span>{category.name}</span>
        </>
      )}
    </Badge>
  )
}

/**
 * Standardized widget card wrapper with consistent sizing and layout.
 * 
 * This component ensures consistent appearance between normal widgets
 * and drag overlays to prevent content shifting during drag operations.
 */

import { forwardRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface WidgetCardProps {
  /** Widget content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Whether this is a drag overlay */
  isOverlay?: boolean
  /** Whether this is a preview in the add dialog */
  isPreview?: boolean
  /** Whether interactions should be disabled */
  disableInteractions?: boolean
  /** Custom styles for exact sizing */
  style?: React.CSSProperties
}

/**
 * Standardized widget card component that maintains consistent
 * sizing and layout across normal and overlay states.
 */
export const WidgetCard = forwardRef<HTMLDivElement, WidgetCardProps>(
  ({ children, className, isOverlay = false, isPreview = false, disableInteractions = false, style }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          // Base layout classes
          "min-w-0 overflow-hidden",
          
          // Normal state styling
          !isOverlay && !isPreview && "shadow-sm",
          
          // Preview state styling
          isPreview && [
            "shadow-sm",
            "border-border",
            "pointer-events-none",
            "bg-background",
          ],
          
          // Overlay state styling
          isOverlay && [
            "drag-overlay",
            "pointer-events-none",
            "shadow-lg",
            "ring-0", // Remove any rings/highlights
          ],
          
          // Interaction states
          disableInteractions && "pointer-events-none",
          
          className
        )}
        style={style}
      >
        {children}
      </Card>
    )
  }
)

WidgetCard.displayName = "WidgetCard"

/**
 * Standardized widget header component.
 */
export function WidgetCardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <CardHeader className={cn("p-4 pb-2", className)}>
      {children}
    </CardHeader>
  )
}

/**
 * Standardized widget content component.
 */
export function WidgetCardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <CardContent className={cn("p-4 pt-2", className)}>
      {children}
    </CardContent>
  )
}

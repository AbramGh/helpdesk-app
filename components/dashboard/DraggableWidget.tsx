/**
 * Draggable widget wrapper component with grid-based positioning.
 * 
 * This component wraps individual widgets with drag-and-drop functionality,
 * resize handles, and context menus using CSS Grid positioning.
 */

"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboardStore } from "@/stores/dashboard"
import { getWidgetDefinition } from "./registry"
import { WidgetInstance } from "@/types/dashboard"
import { WidgetCard } from "./WidgetCard"
import { useGridContext } from "./DashboardGrid"
import { cn } from "@/lib/utils"

interface DraggableWidgetProps {
  /** Widget instance data */
  instance: WidgetInstance
  /** Whether this widget is currently being dragged */
  isDragging?: boolean
  /** Whether this is a drag overlay (ghost) element */
  isOverlay?: boolean
  /** Disable all drag/resize controls */
  disabled?: boolean
}

export function DraggableWidget({ 
  instance, 
  isDragging = false, 
  isOverlay = false,
  disabled = false,
}: DraggableWidgetProps) {
  const { remove, resize } = useDashboardStore()
  const [isResizing, setIsResizing] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // Get grid context for calculations
  const { spec, colW } = useGridContext()

  // Get widget definition and component
  const definition = getWidgetDefinition(instance.kind)
  const WidgetComponent = definition.component

  // Set up sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
    rect,
  } = useSortable({
    id: instance.id,
    disabled: isOverlay || disabled,
  })

  /**
   * Handle widget removal
   */
  function handleRemove() {
    remove(instance.id)
  }

  /**
   * Handle widget resize by adjusting width and height
   */
  function handleResize(direction: 'grow' | 'shrink') {
    const delta = direction === 'grow' ? 1 : -1
    const newW = Math.max(definition.minW, instance.w + delta)
    const newH = Math.max(definition.minH, instance.h + delta)
    
    if (newW !== instance.w || newH !== instance.h) {
      resize(instance.id, { w: newW, h: newH })
    }
  }

  /**
   * Handle manual resize with mouse drag
   */
  function handleManualResize(e: React.MouseEvent) {
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startY = e.clientY
    const startW = instance.w
    const startH = instance.h

    function handleMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      // Calculate new size based on pixel delta and column width
      const cellWidth = colW + spec.gap
      const cellHeight = (spec.rowH || 120) + spec.gap
      
      const deltaW = Math.round(deltaX / cellWidth)
      const deltaH = Math.round(deltaY / cellHeight)
      
      const newW = Math.max(definition.minW, startW + deltaW)
      const newH = Math.max(definition.minH, startH + deltaH)
      
      if (newW !== instance.w || newH !== instance.h) {
        resize(instance.id, { w: newW, h: newH })
      }
    }

    function handleMouseUp() {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Calculate styles based on whether this is an overlay or grid item
  // Snap drag translation to grid increments for a crisp feel
  const cellW = (colW ?? 80) + (spec.gap ?? 0)
  const cellH = (spec.rowH ?? 120) + (spec.gap ?? 0)
  const snapped = transform
    ? {
        x: Math.round((transform.x || 0) / cellW) * cellW,
        y: Math.round((transform.y || 0) / cellH) * cellH,
      }
    : undefined

  const gridStyles: React.CSSProperties = isOverlay 
    ? {
        // Overlay uses absolute positioning with transform
        transform: CSS.Translate.toString({
          x: snapped?.x ?? transform?.x ?? 0,
          y: snapped?.y ?? transform?.y ?? 0,
        }),
        transition,
        willChange: transform ? "transform" : undefined,
      }
    : {
        // Grid item uses CSS Grid positioning
        gridColumn: `${instance.x + 1} / span ${instance.w}`,
        gridRow: `${instance.y + 1} / span ${instance.h}`,
        // Apply transform only during drag for smooth movement (snapped)
        ...(isSortableDragging && transform ? {
          transform: CSS.Translate.toString({
            x: snapped?.x ?? transform.x,
            y: snapped?.y ?? transform.y,
          }),
          transition,
          zIndex: 50,
        } : {}),
        // Keep layout space but hide original during drag to avoid visual overlap
        ...(isSortableDragging ? { visibility: 'hidden' } as React.CSSProperties : {}),
      }

  // Calculate overlay sizing to match source exactly
  const overlayStyle: React.CSSProperties | undefined = isOverlay && rect.current
    ? {
        width: rect.current.width,
        height: rect.current.height,
      }
    : undefined

  // Drag state styling (subtle, no heavy highlights)
  const draggingClass = isSortableDragging || isDragging
    ? "shadow-lg ring-0" // Remove rings/highlights during drag
    : "shadow-sm"

  return (
    <div
      ref={setNodeRef}
      style={gridStyles}
      className={cn(
        "relative group touch-none z-10",
        !isOverlay && "transition-all duration-200 ease-out",
        isSortableDragging && "z-50",
        isOverlay && "pointer-events-none",
        !isDragging && !isSortableDragging && "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        !isDragging && !isSortableDragging && showControls && "ring-2 ring-primary ring-offset-2"
      )}
      onMouseEnter={() => !isOverlay && setShowControls(true)}
      onMouseLeave={() => !isOverlay && setShowControls(false)}
      onFocus={() => !isOverlay && setShowControls(true)}
      onBlur={() => !isOverlay && setShowControls(false)}
    >
      {/* Drag Handle - Only visible on hover or focus */}
      {!isOverlay && !disabled && (
        <div
          className={cn(
            "absolute -top-2 -left-2 z-10",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-opacity duration-200",
            showControls && "opacity-100"
          )}
        >
          <Button
            variant="secondary"
            size="sm"
            className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${definition.title} widget`}
          >
            <GripVertical className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Widget Controls Menu */}
      {!isOverlay && !disabled && (
        <div
          className={cn(
            "absolute -top-2 -right-2 z-10",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-opacity duration-200",
            showControls && "opacity-100"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0"
                aria-label={`${definition.title} widget options`}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleResize('grow')}>
                <Maximize2 className="mr-2 h-4 w-4" />
                Increase Size
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleResize('shrink')}
                disabled={instance.w <= definition.minW && instance.h <= definition.minH}
              >
                <Minimize2 className="mr-2 h-4 w-4" />
                Decrease Size
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                <X className="mr-2 h-4 w-4" />
                Remove Widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Resize Handle - Bottom right corner */}
      {!isOverlay && !disabled && (
        <div
          className={cn(
            "absolute bottom-1 right-1 z-10",
            "w-4 h-4 cursor-se-resize",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-opacity duration-200",
            showControls && "opacity-100"
          )}
          onMouseDown={handleManualResize}
          aria-label={`Resize ${definition.title} widget`}
        >
          <div className="absolute bottom-0 right-0 w-0 h-0 border-l-4 border-b-4 border-transparent border-b-muted-foreground/50 border-l-muted-foreground/50" />
        </div>
      )}

      {/* Widget Content */}
      <WidgetCard
        className={draggingClass}
        isOverlay={isOverlay}
        disableInteractions={isDragging || isResizing}
        style={overlayStyle}
      >
        <WidgetComponent
          instance={instance}
          onRemove={handleRemove}
          onResize={(id, size) => resize(id, size)}
          isDragging={isDragging || isSortableDragging}
          isResizing={isResizing}
        />
      </WidgetCard>
    </div>
  )
}

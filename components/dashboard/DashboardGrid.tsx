/**
 * Snap-to-grid dashboard component with collision prevention and compaction.
 * 
 * This component provides a CSS Grid-based layout system with responsive
 * breakpoints, drag-and-drop functionality, and automatic grid snapping.
 */

"use client"

import { useEffect, useState, useRef, createContext, useContext, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { useDashboardStore } from "@/stores/dashboard"
import { DraggableWidget } from "./DraggableWidget"
import { WidgetInstance, GridPosition } from "@/types/dashboard"
import { 
  GridSpec, 
  Breakpoint, 
  GPos, 
  getBreakpoint, 
  getGridSpec, 
  calculateColumnWidth,
  pxToCell,
  clampToBounds,
  placeWithoutOverlap,
  toRect,
  cellToPx
} from "@/lib/grid"

/**
 * Grid context for sharing grid state with child components
 */
interface GridContextValue {
  spec: GridSpec
  breakpoint: Breakpoint
  colW: number
  containerRef: React.RefObject<HTMLDivElement>
  dragPreviewPos: GPos | null
  setDragPreviewPos: (pos: GPos | null) => void
  showGrid: boolean
  toggleGrid: () => void
}

const GridContext = createContext<GridContextValue | null>(null)

export function useGridContext() {
  const context = useContext(GridContext)
  if (!context) {
    throw new Error('useGridContext must be used within DashboardGrid')
  }
  return context
}

/**
 * Handle keyboard navigation with grid-based movement
 */
function handleKeyboardMove(
  event: KeyboardEvent,
  activeId: string,
  instances: WidgetInstance[],
  moveFunction: (id: string, position: GridPosition) => void
) {
  const { code } = event
  const widget = instances.find(i => i.id === activeId)
  if (!widget) return undefined
  
  let newPos: GridPosition | null = null
  
  switch (code) {
    case 'ArrowRight':
      newPos = { x: widget.x + 1, y: widget.y }
      break
    case 'ArrowLeft':
      newPos = { x: widget.x - 1, y: widget.y }
      break
    case 'ArrowDown':
      newPos = { x: widget.x, y: widget.y + 1 }
      break
    case 'ArrowUp':
      newPos = { x: widget.x, y: widget.y - 1 }
      break
    default:
      return undefined
  }
  
  if (newPos) {
    moveFunction(activeId, newPos)
    return { x: 0, y: 0 } // Return dummy coordinates since we handle movement directly
  }
  
  return undefined
}

interface DashboardGridProps {
  /** Optional CSS class name */
  className?: string
}

export function DashboardGrid({ className }: DashboardGridProps) {
  const { instances, move, load, setBreakpoint: setStoreBreakpoint } = useDashboardStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedInstance, setDraggedInstance] = useState<WidgetInstance | null>(null)
  const [dragPreviewPos, setDragPreviewPos] = useState<GPos | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  
  // Grid state
  const [containerWidth, setContainerWidth] = useState(1200)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg")
  const [spec, setSpec] = useState<GridSpec>(getGridSpec("lg"))
  const [colW, setColW] = useState(80)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Update grid dimensions when container resizes
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        const newBreakpoint = getBreakpoint(width)
        const newSpec = getGridSpec(newBreakpoint)
        const newColW = calculateColumnWidth(width, newSpec)
        
        setContainerWidth(width)
        setBreakpoint(newBreakpoint)
        setSpec(newSpec)
        setColW(newColW)
        
        // Update store breakpoint when it changes
        if (newBreakpoint !== breakpoint) {
          setStoreBreakpoint(newBreakpoint)
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [breakpoint, setStoreBreakpoint])

  // Load layout on mount
  useEffect(() => {
    load()
  }, [load])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, { context }) => {
        if (context?.active?.id) {
          return handleKeyboardMove(event, context.active.id as string, instances, move)
        }
        return undefined
      },
    })
  )

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    const instance = instances.find(i => i.id === active.id)
    setDraggedInstance(instance || null)
    setDragPreviewPos(instance ? { x: instance.x, y: instance.y } : null)
  }, [instances])

  /**
   * Handle drag move event for live preview snapping
   */
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!activeId || !draggedInstance || !containerRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    const { x: deltaX, y: deltaY } = event.delta
    
    // Calculate current position in pixels
    const currentPx = cellToPx(
      { x: draggedInstance.x, y: draggedInstance.y },
      { w: draggedInstance.w, h: draggedInstance.h },
      spec,
      colW
    )
    
    const newPx = {
      left: currentPx.left + deltaX,
      top: currentPx.top + deltaY,
    }
    
    // Convert to grid position (newPx is relative to grid container)
    const proposed = pxToCell(
      newPx,
      { left: 0, top: 0 },
      spec,
      colW
    )
    const clamped = clampToBounds(proposed, draggedInstance, spec)
    
    // Find collision-free position
    const otherRects = instances
      .filter(i => i.id !== activeId)
      .map(toRect)
    
    const targetPos = placeWithoutOverlap(
      otherRects,
      { ...toRect(draggedInstance), ...clamped },
      spec
    )
    
    setDragPreviewPos(targetPos)
  }, [activeId, draggedInstance, instances, spec, colW])

  /**
   * Handle drag end event with grid snapping and collision resolution
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active } = event
    
    if (!active || !dragPreviewPos) {
      setActiveId(null)
      setDraggedInstance(null)
      setDragPreviewPos(null)
      return
    }

    // Commit the previewed position
    move(active.id as string, dragPreviewPos)

    setActiveId(null)
    setDraggedInstance(null)
    setDragPreviewPos(null)
  }, [dragPreviewPos, move])

  /**
   * Calculate maximum needed rows for grid
   */
  const maxRows = Math.max(10, ...instances.map(i => i.y + i.h)) + 2

  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev)
  }, [])

  const gridContextValue: GridContextValue = {
    spec,
    breakpoint,
    colW,
    containerRef,
    dragPreviewPos,
    setDragPreviewPos,
    showGrid,
    toggleGrid,
  }

  return (
    <GridContext.Provider value={gridContextValue}>
      <div 
        ref={containerRef}
        className={`dashboard-grid relative ${className || ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${spec.cols}, 1fr)`,
          gridTemplateRows: `repeat(${maxRows}, ${spec.rowH}px)`,
          gap: `${spec.gap}px`,
          minHeight: `${maxRows * (spec.rowH + spec.gap)}px`,
        }}
      >
        {/* Visual Grid Overlay */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${spec.cols}, 1fr)`,
              gridTemplateRows: `repeat(${maxRows}, ${spec.rowH}px)`,
              gap: `${spec.gap}px`,
            }}
          >
            {Array.from({ length: spec.cols * maxRows }).map((_, i) => (
              <div
                key={i}
                className="border-2 border-dashed border-blue-400/60 bg-blue-50/30 rounded-lg shadow-sm"
                style={{
                  minHeight: `${spec.rowH}px`,
                }}
              />
            ))}
          </div>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={instances.map(i => i.id)} strategy={rectSortingStrategy}>
            {instances.map((instance) => (
              <DraggableWidget
                key={instance.id}
                instance={instance}
                isDragging={activeId === instance.id}
              />
            ))}
          </SortableContext>

          {/* Drop preview indicator */}
          {dragPreviewPos && draggedInstance && activeId && (
            <div
              className="absolute border-2 border-dashed border-primary/50 bg-primary/10 rounded-lg pointer-events-none z-10"
              style={{
                gridColumn: `${dragPreviewPos.x + 1} / span ${draggedInstance.w}`,
                gridRow: `${dragPreviewPos.y + 1} / span ${draggedInstance.h}`,
              }}
            />
          )}

          {/* We reflow the dragged item within the grid using dragPreviewPos,
              so no separate floating overlay is needed. */}
          <DragOverlay dropAnimation={null} />
        </DndContext>
      </div>
    </GridContext.Provider>
  )
}

/**
 * Empty state component shown when no widgets are present
 */
export function DashboardGridEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
        <svg
          className="w-10 h-10 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 0 01-2-2v-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Your dashboard is empty
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        Add your first widget to start customizing your dashboard. You can drag, resize, and rearrange widgets to suit your workflow.
      </p>
    </div>
  )
}

/**
 * Add Widget Dialog component with live preview.
 * 
 * This component provides a two-pane interface for users to add new widgets
 * to their dashboard with search, keyboard navigation, and live preview.
 */

"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { Plus, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStore } from "@/stores/dashboard"
import { searchWidgetDefinitions, getAllWidgetDefinitions, getWidgetDefinition } from "./registry"
import { WidgetKind, WidgetDefinition, WidgetInstance } from "@/types/dashboard"
import { cn } from "@/lib/utils"
import { WidgetCard } from "./WidgetCard"

interface AddWidgetDialogProps {
  /** Optional trigger button variant */
  variant?: "default" | "outline" | "ghost"
  /** Optional trigger button size */
  size?: "default" | "sm" | "lg"
  /** Optional custom trigger text */
  triggerText?: string
}

/**
 * Debounce utility for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Widget Preview component that renders a widget in preview mode
 */
function WidgetPreview({ definition, instance }: { definition: WidgetDefinition; instance: WidgetInstance }) {
  const PreviewComponent = definition.Preview || definition.component

  return (
    <div className="w-full">
      <WidgetCard isPreview className="shadow-sm border-0 bg-background">
        <Suspense fallback={
          <div className="p-6">
            <Skeleton className="h-4 w-1/3 mb-3" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        }>
          <PreviewComponent instance={instance} />
        </Suspense>
      </WidgetCard>
    </div>
  )
}

/**
 * Widget List Item component - compact version for better scrolling
 */
function WidgetListItem({
  definition,
  isSelected,
  onClick,
  onDoubleClick,
}: {
  definition: WidgetDefinition
  isSelected: boolean
  onClick: () => void
  onDoubleClick: () => void
}) {
  const IconComponent = definition.icon

  return (
    <button
      className={cn(
        "w-full text-left rounded-lg border p-3 hover:bg-accent transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "group hover:shadow-sm",
        isSelected && "ring-2 ring-primary bg-primary/5 border-primary/30 shadow-sm"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Selected: ' : ''}${definition.title} widget`}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "size-8 rounded-md bg-muted flex items-center justify-center shrink-0 transition-colors",
          isSelected && "bg-primary/10"
        )}>
          <IconComponent className={cn(
            "size-4 transition-colors",
            isSelected ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn(
            "font-medium truncate text-sm transition-colors",
            isSelected && "text-primary"
          )}>
            {definition.title}
          </div>
          <div className="text-xs text-muted-foreground truncate leading-tight">
            {definition.description}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={isSelected ? "default" : "outline"} className="text-xs px-1.5 py-0.5">
            {definition.defaultW}×{definition.defaultH}
          </Badge>
        </div>
      </div>
    </button>
  )
}

export function AddWidgetDialog({ 
  variant = "default", 
  size = "default",
  triggerText = "Add Widget"
}: AddWidgetDialogProps) {
  const { add } = useDashboardStore()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKind, setSelectedKind] = useState<WidgetKind | null>(null)

  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 200)

  // Get filtered widget definitions based on search
  const widgets = useMemo(() => {
    return debouncedSearchTerm 
      ? searchWidgetDefinitions(debouncedSearchTerm)
      : getAllWidgetDefinitions()
  }, [debouncedSearchTerm])

  // Auto-select first widget when search results change
  useEffect(() => {
    if (widgets.length > 0 && (!selectedKind || !widgets.find(w => w.kind === selectedKind))) {
      setSelectedKind(widgets[0].kind)
    }
  }, [widgets, selectedKind])

  // Create fake instance for preview
  const previewInstance = useMemo((): WidgetInstance | null => {
    if (!selectedKind) return null
    
    const definition = getWidgetDefinition(selectedKind)
    return {
      id: "preview",
      kind: selectedKind,
      x: 0,
      y: 0,
      w: definition.defaultW,
      h: definition.defaultH,
    }
  }, [selectedKind])

  const selectedDefinition = selectedKind ? getWidgetDefinition(selectedKind) : null

  /**
   * Handle adding a widget to the dashboard.
   */
  const handleAddWidget = useCallback((kind: WidgetKind) => {
    add(kind)
    setOpen(false)
    setSearchTerm("")
    setSelectedKind(null)
  }, [add])

  /**
   * Handle dialog open change.
   */
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchTerm("")
      setSelectedKind(null)
    }
  }, [])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!widgets.length) return

    const currentIndex = selectedKind ? widgets.findIndex(w => w.kind === selectedKind) : -1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < widgets.length - 1 ? currentIndex + 1 : 0
        setSelectedKind(widgets[nextIndex].kind)
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : widgets.length - 1
        setSelectedKind(widgets[prevIndex].kind)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedKind) {
          handleAddWidget(selectedKind)
        }
        break
    }
  }, [widgets, selectedKind, handleAddWidget])

  /**
   * Handle search input keyboard shortcuts
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      // Focus will be handled by the main keydown handler
      handleKeyDown(e)
    }
  }, [handleKeyDown])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Plus className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="!w-[90vw] !max-w-[1800px] p-0 overflow-hidden rounded-2xl"
        onKeyDown={handleKeyDown}
      >
        <div className="bg-background rounded-2xl overflow-hidden">
          <div className="grid h-[min(88vh,820px)] grid-cols-[400px_1fr]">
            {/* LEFT PANE: Widget List */}
            <aside className="min-w-0 border-r bg-muted/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 lg:p-6 border-b bg-background/50 backdrop-blur-sm">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-lg lg:text-xl">Add Widget</DialogTitle>
                  <DialogDescription className="text-sm">
                    Choose a widget to add to your dashboard
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Search Input */}
              <div className="p-4 md:p-6 border-b bg-background/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search widgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 border-0 bg-background/80 focus:bg-background"
                    autoFocus
                  />
                </div>
              </div>

              {/* Widget List - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scroll-smooth">
                <div className="p-4 md:p-6 space-y-2">
                  {widgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 mb-3 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No widgets found matching "{debouncedSearchTerm}"
                      </p>
                    </div>
                  ) : (
                    widgets.map((widget) => (
                      <WidgetListItem
                        key={widget.kind}
                        definition={widget}
                        isSelected={selectedKind === widget.kind}
                        onClick={() => setSelectedKind(widget.kind)}
                        onDoubleClick={() => handleAddWidget(widget.kind)}
                      />
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT PANE: Preview */}
            <section className="overflow-y-auto p-6 bg-background flex flex-col flex-1 scroll-smooth" aria-live="polite">
              {selectedDefinition && previewInstance ? (
                <>
                  {/* Header with widget info */}
                  <div className="border-b mb-6">
                    <div className="flex items-start gap-3 lg:gap-4">
                      <div className="size-10 lg:size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <selectedDefinition.icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg lg:text-xl font-semibold mb-1">{selectedDefinition.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {selectedDefinition.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-medium">
                            Default: {selectedDefinition.defaultW}×{selectedDefinition.defaultH}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Min: {selectedDefinition.minW}×{selectedDefinition.minH}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="flex-1 mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Live Preview</h4>
                    <div className="w-full">
                      <div className="mx-auto w-full max-w-[520px] min-w-[420px]">
                        <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-4">
                          <WidgetPreview 
                            definition={selectedDefinition} 
                            instance={previewInstance} 
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        This is how your widget will appear on the dashboard
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - Sticky footer */}
                  <div className="border-t bg-muted/30 flex items-center justify-between gap-3 p-4 md:p-6">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAddWidget(selectedKind!)}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Add Widget
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Plus className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base md:text-lg font-medium mb-2">Select a Widget</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose a widget from the list to see a live preview and add it to your dashboard
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

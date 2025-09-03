"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet'
import {
    LayoutGrid,
    Plus,
    Settings,
    Trash2,
    Move,
    X,
    Eye,
    EyeOff
} from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboard'
import { getAllWidgetDefinitions, getWidgetDefinition } from './registry'
import { WidgetKind, WidgetInstance, WidgetDefinition } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import { WidgetCard, WidgetCardHeader, WidgetCardContent } from './WidgetCard'

// Import CSS for react-grid-layout
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './dashboard.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface CustomizableDashboardProps {
    className?: string
}

export default function CustomizableDashboard({ className }: CustomizableDashboardProps) {
    const {
        instances,
        add,
        remove,
        arrangeMode,
        toggleArrange,
        load,
        save,
        updateLayout,
        resetToDefaults
    } = useDashboardStore()

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedWidgetKind, setSelectedWidgetKind] = useState<WidgetKind | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [widgetToRemove, setWidgetToRemove] = useState<string | null>(null)
    const [layouts, setLayouts] = useState({
        lg: instances.map(inst => ({
            i: inst.id,
            x: inst.x,
            y: inst.y,
            w: inst.w,
            h: inst.h,
            minW: 1,
            minH: 1,
            isDraggable: arrangeMode,
            isResizable: arrangeMode,
        }))
    })

    // Load dashboard on mount
    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                setIsLoading(true)
                load()
            } catch (error) {
                console.error('Failed to load dashboard:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initializeDashboard()
    }, [load])

    // Update layouts when instances change
    useEffect(() => {
        setLayouts({
            lg: instances.map(inst => ({
                i: inst.id,
                x: inst.x,
                y: inst.y,
                w: inst.w,
                h: inst.h,
                minW: 1,
                minH: 1,
                isDraggable: arrangeMode,
                isResizable: arrangeMode,
            }))
        })
    }, [instances, arrangeMode])

    // Handle layout change from react-grid-layout
    const handleLayoutChange = useCallback((currentLayout: any, allLayouts: any) => {
        if (!arrangeMode) return

        // Update the store with the new layout
        updateLayout(currentLayout)

        // Update local state
        setLayouts({
            lg: currentLayout
        })
    }, [arrangeMode, updateLayout])

    // Handle widget removal
    const handleRemoveWidget = useCallback((widgetId: string) => {
        setWidgetToRemove(widgetId)
    }, [])

    // Confirm widget removal
    const confirmRemoveWidget = useCallback(() => {
        if (widgetToRemove) {
            remove(widgetToRemove)
            setWidgetToRemove(null)
        }
    }, [widgetToRemove, remove])

    // Handle adding a new widget
    const handleAddWidget = useCallback((kind: WidgetKind) => {
        add(kind)
        setIsAddDialogOpen(false)
        setSelectedWidgetKind(null)
    }, [add])

    // Get widget component for rendering
    const getWidgetComponent = useCallback((instance: WidgetInstance) => {
        const definition = getWidgetDefinition(instance.kind)
        if (!definition) return null

        const WidgetComponent = definition.component
        return (
            <WidgetComponent
                instance={instance}
                onRemove={handleRemoveWidget}
            />
        )
    }, [handleRemoveWidget])

    // Widget preview component
    const WidgetPreview = ({ definition }: { definition: WidgetDefinition }) => {
        const previewInstance: WidgetInstance = {
            id: 'preview',
            kind: definition.kind,
            x: 0,
            y: 0,
            w: definition.defaultW,
            h: definition.defaultH,
        }

        const WidgetComponent = definition.component
        return (
            <div className="w-full h-full">
                <WidgetCard isPreview>
                    <WidgetComponent instance={previewInstance} />
                </WidgetCard>
            </div>
        )
    }

    return (
        <div className={cn("w-full px-12 py-8", className)}>
            {/* Header with Edit Layout Button */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <p className="text-muted-foreground">
                        {arrangeMode ? 'Edit mode - Drag widgets to rearrange' : 'View your dashboard widgets'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={arrangeMode ? "default" : "outline"}
                        onClick={toggleArrange}
                        className="flex items-center gap-2"
                    >
                        {arrangeMode ? <EyeOff className="h-4 w-4" /> : <Move className="h-4 w-4" />}
                        {arrangeMode ? 'Exit Edit' : 'Edit Layout'}
                    </Button>

                    {arrangeMode && (
                        <Button
                            variant="outline"
                            onClick={resetToDefaults}
                            className="flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Reset to Defaults
                        </Button>
                    )}

                    {arrangeMode && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Widget
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="!w-[95vw] !h-[90vh] !max-w-none !max-h-none">
                                <DialogHeader className="pb-4">
                                    <DialogTitle className="text-2xl font-bold">Add New Widget</DialogTitle>
                                    <DialogDescription className="text-base">
                                        Choose from our collection of widgets to enhance your dashboard.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex gap-8 h-full">
                                    {/* Left Sidebar - Widget Categories & Search */}
                                    <div className="w-80 space-y-6 flex-shrink-0">
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-base">Widget Categories</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                                                    <LayoutGrid className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium text-primary">All Widgets</span>
                                                    <Badge variant="secondary" className="ml-auto text-xs">
                                                        {getAllWidgetDefinitions().length}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Stats</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {getAllWidgetDefinitions()
                                                    .filter(w => ['openIssues', 'inProgress', 'overdue', 'resolvedToday'].includes(w.kind))
                                                    .map((definition) => (
                                                        <div
                                                            key={definition.kind}
                                                            className={cn(
                                                                "p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm",
                                                                selectedWidgetKind === definition.kind
                                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                                                            )}
                                                            onClick={() => setSelectedWidgetKind(definition.kind)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <definition.icon className="h-4 w-4 text-primary" />
                                                                <span className="text-sm font-medium truncate">{definition.title}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Advanced Widgets</h3>
                                            <div className="space-y-2">
                                                {getAllWidgetDefinitions()
                                                    .filter(w => !['openIssues', 'inProgress', 'overdue', 'resolvedToday'].includes(w.kind))
                                                    .map((definition) => (
                                                        <div
                                                            key={definition.kind}
                                                            className={cn(
                                                                "p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm",
                                                                selectedWidgetKind === definition.kind
                                                                    ? "border-primary bg-primary/5 shadow-sm"
                                                                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                                                            )}
                                                            onClick={() => setSelectedWidgetKind(definition.kind)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <definition.icon className="h-4 w-4 text-primary" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-medium text-sm truncate">{definition.title}</h4>
                                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                        {definition.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center - Widget Details */}
                                    <div className="flex-1 space-y-6 min-w-0 px-6">
                                        {selectedWidgetKind ? (
                                            <>
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        {(() => {
                                                            const definition = getWidgetDefinition(selectedWidgetKind)
                                                            const IconComponent = definition?.icon
                                                            return IconComponent ? <IconComponent className="h-12 w-12 text-primary" /> : null
                                                        })()}
                                                        <div>
                                                            <h3 className="text-3xl font-bold">{getWidgetDefinition(selectedWidgetKind)?.title}</h3>
                                                            <p className="text-muted-foreground text-lg mt-1">{getWidgetDefinition(selectedWidgetKind)?.description}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg">
                                                        <div className="text-center">
                                                            <div className="text-3xl font-bold text-primary">
                                                                {getWidgetDefinition(selectedWidgetKind)?.defaultW}×{getWidgetDefinition(selectedWidgetKind)?.defaultH}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground mt-1">Default Size</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-3xl font-bold text-primary">
                                                                {getWidgetDefinition(selectedWidgetKind)?.minW}×{getWidgetDefinition(selectedWidgetKind)?.minH}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground mt-1">Minimum Size</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-lg">Features</h4>
                                                        <ul className="space-y-2 text-base text-muted-foreground">
                                                            <li className="flex items-center gap-3">
                                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                                Real-time data updates
                                                            </li>
                                                            <li className="flex items-center gap-3">
                                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                                Responsive design
                                                            </li>
                                                            <li className="flex items-center gap-3">
                                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                                Customizable appearance
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleAddWidget(selectedWidgetKind)}
                                                    className="w-full h-12 text-lg font-semibold"
                                                    size="lg"
                                                >
                                                    <Plus className="h-5 w-5 mr-2" />
                                                    Add {getWidgetDefinition(selectedWidgetKind)?.title} Widget
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                                <div className="text-center">
                                                    <LayoutGrid className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                    <h3 className="text-xl font-medium mb-2">Select a Widget</h3>
                                                    <p className="text-base">Choose a widget from the left to see details and preview</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side - Live Preview */}
                                    <div className="flex-1 space-y-4 min-w-0 px-6">
                                        <h3 className="font-semibold text-xl">Live Preview</h3>
                                        <div className="flex-1 border rounded-lg p-6 bg-muted/20 h-[400px]">
                                            {selectedWidgetKind ? (
                                                <div className="h-full">
                                                    <WidgetPreview
                                                        definition={getWidgetDefinition(selectedWidgetKind)!}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                    <div className="text-center">
                                                        <LayoutGrid className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">Widget preview will appear here</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="relative px-6 overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading dashboard...</p>
                        </div>
                    </div>
                ) : instances.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Click "Edit Layout" and then "Add Widget" to get started
                            </p>
                            <Button onClick={toggleArrange}>
                                <Move className="h-4 w-4 mr-2" />
                                Edit Layout
                            </Button>
                        </div>
                    </div>
                ) : (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layouts}
                        breakpoints={{ lg: 1200 }}
                        cols={{ lg: 12 }}
                        rowHeight={60}
                        onLayoutChange={handleLayoutChange}
                        isDraggable={arrangeMode}
                        isResizable={arrangeMode}
                        margin={[32, 32]}
                        containerPadding={[24, 24]}
                        useCSSTransforms={true}
                        preventCollision={false}
                        compactType="vertical"
                        draggableHandle={arrangeMode ? undefined : ".drag-handle"}
                        isResizable={arrangeMode}
                    >
                        {instances.map((instance) => (
                            <div key={instance.id} className="widget-container">
                                <WidgetCard className="h-full w-full">
                                    {arrangeMode && (
                                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleRemoveWidget(instance.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                            <div className="drag-handle cursor-move px-1">
                                                <Move className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        {getWidgetComponent(instance)}
                                    </div>
                                </WidgetCard>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </div>

            {/* Save Changes Button (only visible in edit mode) */}
            {arrangeMode && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={() => {
                            save()
                            toggleArrange()
                        }}
                        className="shadow-lg"
                    >
                        Save Changes
                    </Button>
                </div>
            )}

            {/* Remove Widget Confirmation Dialog */}
            <Dialog open={!!widgetToRemove} onOpenChange={() => setWidgetToRemove(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Widget</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this widget? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setWidgetToRemove(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmRemoveWidget}>
                            Remove Widget
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

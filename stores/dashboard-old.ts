/**
 * Zustand store for dashboard layout management.
 * 
 * This store manages widget instances, their positions, and persistence
 * to localStorage with collision detection and automatic layout adjustments.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { WidgetInstance, WidgetKind, DashboardState, GridPosition, GridBounds } from '@/types/dashboard'
import { getWidgetDefinition } from '@/components/dashboard/registry'

const STORAGE_KEY = 'ac_dashboard_layout_v2' // New storage key to force reset
const CURRENT_VERSION = '2.0.0' // Complete rewrite

interface DashboardStore {
  instances: WidgetInstance[]
  
  // Actions
  add: (kind: WidgetKind) => void
  remove: (id: string) => void
  move: (id: string, position: GridPosition) => void
  resize: (id: string, size: { w: number; h: number }) => void
  updateInstance: (id: string, updates: Partial<WidgetInstance>) => void
  
  // Layout management
  findFreePosition: (w: number, h: number) => GridPosition
  checkCollision: (bounds: GridBounds, excludeId?: string) => boolean
  resolveCollisions: (instance: WidgetInstance) => void
  fixOverlaps: () => void
  
  // Persistence
  load: () => void
  save: () => void
  resetToDefaults: () => void
  
  // Utilities
  getMaxColumns: () => number
  getInstanceById: (id: string) => WidgetInstance | undefined
}

/**
 * Default widget layout that matches the current dashboard structure.
 */
function getDefaultLayout(): WidgetInstance[] {
  return [
    // Top row - stat cards (spread across available width)
    { id: 'open-issues-1', kind: 'openIssues', x: 0, y: 0, w: 1, h: 1 },
    { id: 'in-progress-1', kind: 'inProgress', x: 1, y: 0, w: 1, h: 1 },
    { id: 'overdue-1', kind: 'overdue', x: 2, y: 0, w: 1, h: 1 },
    { id: 'resolved-today-1', kind: 'resolvedToday', x: 3, y: 0, w: 1, h: 1 },
    
    // Second row - larger widgets positioned without overlaps
    { id: 'team-inbox-1', kind: 'teamInbox', x: 0, y: 1, w: 3, h: 3 },      // Left side: x: 0-2, y: 1-3
    { id: 'my-work-queue-1', kind: 'myWorkQueue', x: 3, y: 1, w: 2, h: 2 }, // Right top: x: 3-4, y: 1-2
    { id: 'sla-monitoring-1', kind: 'slaMonitoring', x: 3, y: 3, w: 2, h: 2 }, // Right bottom: x: 3-4, y: 3-4
  ]
}

/**
 * Generate a unique ID for widget instances.
 */
function generateWidgetId(kind: WidgetKind): string {
  return `${kind}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get the maximum number of columns based on current breakpoint.
 * For now, we'll use a fixed 12-column layout for desktop.
 */
function getCurrentMaxColumns(): number {
  // TODO: Make this responsive based on breakpoint
  return 12
}

/**
 * Check if a widget can be placed at the specified position without overlapping.
 */
function canPlaceAt(
  grid: string[][],
  x: number,
  y: number,
  w: number,
  h: number,
  maxCols: number,
  maxRows: number
): boolean {
  // Check bounds
  if (x < 0 || y < 0 || x + w > maxCols || y + h > maxRows) {
    return false
  }
  
  // Check for occupied cells
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      if (grid[y + dy] && grid[y + dy][x + dx] !== '') {
        return false
      }
    }
  }
  
  return true
}

/**
 * Place a widget on the grid, marking cells as occupied.
 */
function placeWidget(
  grid: string[][],
  instance: WidgetInstance,
  x: number,
  y: number
): void {
  for (let dy = 0; dy < instance.h; dy++) {
    for (let dx = 0; dx < instance.w; dx++) {
      if (grid[y + dy]) {
        grid[y + dy][x + dx] = instance.id
      }
    }
  }
}

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set, get) => ({
    instances: [],

    add: (kind: WidgetKind) => {
      const definition = getWidgetDefinition(kind)
      const { defaultW, defaultH } = definition
      const position = get().findFreePosition(defaultW, defaultH)
      
      const newInstance: WidgetInstance = {
        id: generateWidgetId(kind),
        kind,
        x: position.x,
        y: position.y,
        w: defaultW,
        h: defaultH,
      }

      set((state) => ({
        instances: [...state.instances, newInstance]
      }))
      
      get().save()
    },

    remove: (id: string) => {
      set((state) => ({
        instances: state.instances.filter(instance => instance.id !== id)
      }))
      
      get().save()
    },

    move: (id: string, position: GridPosition) => {
      const instance = get().getInstanceById(id)
      if (!instance) return

      const maxCols = get().getMaxColumns()
      const clampedX = Math.max(0, Math.min(position.x, maxCols - instance.w))
      const clampedY = Math.max(0, position.y)

      const updatedInstance = {
        ...instance,
        x: clampedX,
        y: clampedY,
      }

      // Update the instance first
      set((state) => ({
        instances: state.instances.map(inst => 
          inst.id === id ? updatedInstance : inst
        )
      }))

      // Only resolve collisions if the widget moved to an occupied space
      const hasCollision = get().checkCollision({
        x: updatedInstance.x,
        y: updatedInstance.y,
        w: updatedInstance.w,
        h: updatedInstance.h
      }, updatedInstance.id)
      
      if (hasCollision) {
        get().resolveCollisions(updatedInstance)
      }
      
      get().save()
    },

    resize: (id: string, size: { w: number; h: number }) => {
      const instance = get().getInstanceById(id)
      if (!instance) return

      const definition = getWidgetDefinition(instance.kind)
      const maxCols = get().getMaxColumns()
      
      const clampedW = Math.max(definition.minW, Math.min(size.w, maxCols - instance.x))
      const clampedH = Math.max(definition.minH, size.h)

      const updatedInstance = {
        ...instance,
        w: clampedW,
        h: clampedH,
      }

      set((state) => ({
        instances: state.instances.map(inst => 
          inst.id === id ? updatedInstance : inst
        )
      }))

      // Check for collisions and resolve if needed
      const hasCollision = get().checkCollision({
        x: updatedInstance.x,
        y: updatedInstance.y,
        w: updatedInstance.w,
        h: updatedInstance.h
      }, updatedInstance.id)
      
      if (hasCollision) {
        get().resolveCollisions(updatedInstance)
      }
      
      get().save()
    },

    updateInstance: (id: string, updates: Partial<WidgetInstance>) => {
      set((state) => ({
        instances: state.instances.map(inst => 
          inst.id === id ? { ...inst, ...updates } : inst
        )
      }))
    },

    findFreePosition: (w: number, h: number): GridPosition => {
      const instances = get().instances
      const maxCols = get().getMaxColumns()
      
      // Create a simple grid occupancy map
      const grid: boolean[][] = []
      const maxRows = 20 // Reasonable grid height
      
      // Initialize grid
      for (let y = 0; y < maxRows; y++) {
        grid[y] = new Array(maxCols).fill(false)
      }
      
      // Mark occupied cells
      instances.forEach(instance => {
        for (let y = instance.y; y < instance.y + instance.h && y < maxRows; y++) {
          for (let x = instance.x; x < instance.x + instance.w && x < maxCols; x++) {
            if (grid[y]) grid[y][x] = true
          }
        }
      })
      
      // Find first free space that fits the widget
      for (let y = 0; y <= maxRows - h; y++) {
        for (let x = 0; x <= maxCols - w; x++) {
          let canFit = true
          
          // Check if this position is free
          for (let dy = 0; dy < h && canFit; dy++) {
            for (let dx = 0; dx < w && canFit; dx++) {
              if (grid[y + dy] && grid[y + dy][x + dx]) {
                canFit = false
              }
            }
          }
          
          if (canFit) {
            return { x, y }
          }
        }
      }
      
      // Fallback: place at the bottom
      const maxY = instances.length > 0 ? Math.max(...instances.map(i => i.y + i.h)) : 0
      return { x: 0, y: maxY }
    },

    checkCollision: (bounds: GridBounds, excludeId?: string): boolean => {
      const instances = get().instances
      
      return instances.some(instance => {
        if (excludeId && instance.id === excludeId) return false
        
        return (
          bounds.x < instance.x + instance.w &&
          bounds.x + bounds.w > instance.x &&
          bounds.y < instance.y + instance.h &&
          bounds.y + bounds.h > instance.y
        )
      })
    },

    resolveCollisions: (movedInstance: WidgetInstance) => {
      const instances = get().instances
      let updatedInstances = [...instances]
      
      // Simple approach: push any overlapping widgets down
      const collidingWidgets = instances.filter(instance => {
        if (instance.id === movedInstance.id) return false
        
        return (
          movedInstance.x < instance.x + instance.w &&
          movedInstance.x + movedInstance.w > instance.x &&
          movedInstance.y < instance.y + instance.h &&
          movedInstance.y + movedInstance.h > instance.y
        )
      })
      
      // Push colliding widgets down
      if (collidingWidgets.length > 0) {
        const pushToY = movedInstance.y + movedInstance.h
        
        updatedInstances = updatedInstances.map(instance => {
          if (collidingWidgets.some(c => c.id === instance.id)) {
            return { ...instance, y: Math.max(instance.y, pushToY) }
          }
          return instance
        })
        
        // Update the store
        set({ instances: updatedInstances })
      }
    },

    getMaxColumns: getCurrentMaxColumns,

    getInstanceById: (id: string) => {
      return get().instances.find(instance => instance.id === id)
    },

    fixOverlaps: () => {
      const instances = get().instances
      if (instances.length <= 1) return
      
      const maxCols = get().getMaxColumns()
      const maxRows = 20
      
      // Create grid occupancy map
      const grid: string[][] = []
      for (let y = 0; y < maxRows; y++) {
        grid[y] = new Array(maxCols).fill('')
      }
      
      // Sort widgets by y then x position (top-left to bottom-right)
      const sortedInstances = [...instances].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y
        return a.x - b.x
      })
      
      const repositionedInstances: WidgetInstance[] = []
      
      // Place each widget in the first available position
      sortedInstances.forEach(instance => {
        let placed = false
        
        // Try to place at current position first
        if (canPlaceAt(grid, instance.x, instance.y, instance.w, instance.h, maxCols, maxRows)) {
          placeWidget(grid, instance, instance.x, instance.y)
          repositionedInstances.push(instance)
          placed = true
        }
        
        // If current position is occupied, find first free position
        if (!placed) {
          for (let y = 0; y <= maxRows - instance.h && !placed; y++) {
            for (let x = 0; x <= maxCols - instance.w && !placed; x++) {
              if (canPlaceAt(grid, x, y, instance.w, instance.h, maxCols, maxRows)) {
                const newInstance = { ...instance, x, y }
                placeWidget(grid, newInstance, x, y)
                repositionedInstances.push(newInstance)
                placed = true
              }
            }
          }
        }
        
        // Fallback: place at bottom
        if (!placed) {
          const bottomY = Math.max(0, ...repositionedInstances.map(w => w.y + w.h))
          const newInstance = { ...instance, x: 0, y: bottomY }
          repositionedInstances.push(newInstance)
        }
      })
      
      // Update store with repositioned widgets
      set({ instances: repositionedInstances })
      get().save()
    },

    load: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          // No stored layout, use defaults
          set({ instances: getDefaultLayout() })
          return
        }

        const data: DashboardState = JSON.parse(stored)
        
        // Validate and migrate if needed
        if (data.version !== CURRENT_VERSION) {
          console.warn('Dashboard layout version mismatch, resetting to defaults')
          set({ instances: getDefaultLayout() })
          get().save()
          return
        }

        set({ instances: data.instances })
        
        // Immediately fix any overlaps that might exist from saved data
        get().fixOverlaps()
      } catch (error) {
        console.error('Failed to load dashboard layout:', error)
        set({ instances: getDefaultLayout() })
      }
    },

    save: () => {
      try {
        const state: DashboardState = {
          instances: get().instances,
          version: CURRENT_VERSION,
          lastModified: new Date().toISOString(),
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save dashboard layout:', error)
      }
    },

    resetToDefaults: () => {
      set({ instances: getDefaultLayout() })
      get().save()
    },
  }))
)

// Auto-save when instances change
useDashboardStore.subscribe(
  (state) => state.instances,
  () => {
    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      useDashboardStore.getState().save()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }
)

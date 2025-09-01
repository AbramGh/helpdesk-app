/**
 * Simplified dashboard store with bulletproof collision prevention.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { WidgetInstance, WidgetKind, DashboardState, GridPosition } from '@/types/dashboard'
import { getWidgetDefinition } from '@/components/dashboard/registry'

const STORAGE_KEY = 'ac_dashboard_layout_v2'
const CURRENT_VERSION = '2.0.0'
const GRID_COLS = 12
const GRID_ROWS = 20

interface DashboardStore {
  instances: WidgetInstance[]
  grid: string[][] // Track which widgets occupy which cells
  
  // Actions
  add: (kind: WidgetKind) => void
  remove: (id: string) => void
  move: (id: string, position: GridPosition) => void
  resize: (id: string, size: { w: number; h: number }) => void
  
  // Grid management
  initializeGrid: () => void
  updateGrid: () => void
  findFreePosition: (w: number, h: number) => GridPosition
  canPlaceWidget: (x: number, y: number, w: number, h: number, excludeId?: string) => boolean
  
  // Persistence
  load: () => void
  save: () => void
  resetToDefaults: () => void
}

/**
 * Default layout with no overlaps - simple linear arrangement
 */
function getDefaultLayout(): WidgetInstance[] {
  return [
    // Top row - 4 stat cards
    { id: 'open-issues', kind: 'openIssues', x: 0, y: 0, w: 1, h: 1 },
    { id: 'in-progress', kind: 'inProgress', x: 1, y: 0, w: 1, h: 1 },
    { id: 'overdue', kind: 'overdue', x: 2, y: 0, w: 1, h: 1 },
    { id: 'resolved-today', kind: 'resolvedToday', x: 3, y: 0, w: 1, h: 1 },
    
    // Large widgets below - no overlap possible
    { id: 'team-inbox', kind: 'teamInbox', x: 0, y: 1, w: 6, h: 3 },      // Wide widget
    { id: 'my-work-queue', kind: 'myWorkQueue', x: 6, y: 1, w: 3, h: 2 }, // Top right
    { id: 'sla-monitoring', kind: 'slaMonitoring', x: 9, y: 1, w: 3, h: 2 }, // Far right
  ]
}

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set, get) => ({
    instances: [],
    grid: [],

    initializeGrid: () => {
      const grid: string[][] = []
      for (let y = 0; y < GRID_ROWS; y++) {
        grid[y] = new Array(GRID_COLS).fill('')
      }
      set({ grid })
    },

    updateGrid: () => {
      const { instances } = get()
      const grid: string[][] = []
      
      // Initialize empty grid
      for (let y = 0; y < GRID_ROWS; y++) {
        grid[y] = new Array(GRID_COLS).fill('')
      }
      
      // Place widgets on grid
      instances.forEach(widget => {
        for (let y = widget.y; y < widget.y + widget.h && y < GRID_ROWS; y++) {
          for (let x = widget.x; x < widget.x + widget.w && x < GRID_COLS; x++) {
            grid[y][x] = widget.id
          }
        }
      })
      
      set({ grid })
    },

    canPlaceWidget: (x: number, y: number, w: number, h: number, excludeId?: string) => {
      const { grid } = get()
      
      // Check bounds
      if (x < 0 || y < 0 || x + w > GRID_COLS || y + h > GRID_ROWS) {
        return false
      }
      
      // Check for conflicts
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const cellId = grid[y + dy]?.[x + dx]
          if (cellId && cellId !== excludeId) {
            return false
          }
        }
      }
      
      return true
    },

    findFreePosition: (w: number, h: number) => {
      const { canPlaceWidget } = get()
      
      // Scan top to bottom, left to right
      for (let y = 0; y <= GRID_ROWS - h; y++) {
        for (let x = 0; x <= GRID_COLS - w; x++) {
          if (canPlaceWidget(x, y, w, h)) {
            return { x, y }
          }
        }
      }
      
      // Fallback: place at bottom
      return { x: 0, y: GRID_ROWS - h }
    },

    add: (kind: WidgetKind) => {
      const definition = getWidgetDefinition(kind)
      const position = get().findFreePosition(definition.defaultW, definition.defaultH)
      
      const newWidget: WidgetInstance = {
        id: `${kind}-${Date.now()}`,
        kind,
        x: position.x,
        y: position.y,
        w: definition.defaultW,
        h: definition.defaultH,
      }

      set(state => ({
        instances: [...state.instances, newWidget]
      }))
      
      get().updateGrid()
      get().save()
    },

    remove: (id: string) => {
      set(state => ({
        instances: state.instances.filter(w => w.id !== id)
      }))
      
      get().updateGrid()
      get().save()
    },

    move: (id: string, position: GridPosition) => {
      const { instances, canPlaceWidget } = get()
      const widget = instances.find(w => w.id === id)
      if (!widget) return

      // Clamp position to grid bounds
      const x = Math.max(0, Math.min(position.x, GRID_COLS - widget.w))
      const y = Math.max(0, position.y)

      // Check if new position is valid
      if (canPlaceWidget(x, y, widget.w, widget.h, id)) {
        set(state => ({
          instances: state.instances.map(w => 
            w.id === id ? { ...w, x, y } : w
          )
        }))
      } else {
        // Find closest valid position
        const newPos = get().findFreePosition(widget.w, widget.h)
        set(state => ({
          instances: state.instances.map(w => 
            w.id === id ? { ...w, x: newPos.x, y: newPos.y } : w
          )
        }))
      }
      
      get().updateGrid()
      get().save()
    },

    resize: (id: string, size: { w: number; h: number }) => {
      const { instances, canPlaceWidget } = get()
      const widget = instances.find(w => w.id === id)
      if (!widget) return

      const definition = getWidgetDefinition(widget.kind)
      const w = Math.max(definition.minW, Math.min(size.w, GRID_COLS))
      const h = Math.max(definition.minH, size.h)

      // Check if resize is possible at current position
      if (canPlaceWidget(widget.x, widget.y, w, h, id)) {
        set(state => ({
          instances: state.instances.map(inst => 
            inst.id === id ? { ...inst, w, h } : inst
          )
        }))
      }
      
      get().updateGrid()
      get().save()
    },

    load: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          const defaultWidgets = getDefaultLayout()
          set({ instances: defaultWidgets })
          get().updateGrid()
          get().save()
          return
        }

        const data: DashboardState = JSON.parse(stored)
        
        if (data.version !== CURRENT_VERSION) {
          const defaultWidgets = getDefaultLayout()
          set({ instances: defaultWidgets })
          get().updateGrid()
          get().save()
          return
        }

        set({ instances: data.instances })
        get().updateGrid()
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        const defaultWidgets = getDefaultLayout()
        set({ instances: defaultWidgets })
        get().updateGrid()
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
        console.error('Failed to save dashboard:', error)
      }
    },

    resetToDefaults: () => {
      const defaultWidgets = getDefaultLayout()
      set({ instances: defaultWidgets })
      get().updateGrid()
      get().save()
    },
  }))
)

// Initialize grid on store creation
useDashboardStore.getState().initializeGrid()

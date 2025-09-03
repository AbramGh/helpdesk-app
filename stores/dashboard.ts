/**
 * Grid-based dashboard store with collision prevention and compaction.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { WidgetInstance, WidgetKind, DashboardState, GridPosition } from '@/types/dashboard'
import { getWidgetDefinition } from '@/components/dashboard/registry'
import {
  placeWithoutOverlap,
  clampToBounds,
  toRect,
  fromRect,
  getGridSpec,
  Breakpoint,
  GridSpec,
  GPos,
  WidgetSize,
  getSizeFor,
  mapToNearestSize,
  nextSize
} from '@/lib/grid'

const STORAGE_KEY = 'ac-dashboard-v2'
const LEGACY_KEYS = ['ac_dashboard_layout_v3', 'ac_dashboard_layout_v1'] as const
const CURRENT_VERSION = '2.0.0'

interface DashboardStore {
  instances: WidgetInstance[]
  currentBreakpoint: Breakpoint
  arrangeMode: boolean

  // Actions
  add: (kind: WidgetKind) => void
  remove: (id: string) => void
  move: (id: string, position: GridPosition) => void
  updateLayout: (layoutItems: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void
  compact: () => void
  resize: (id: string, size: { w: number; h: number }) => void
  resizeTo: (id: string, size: WidgetSize) => void
  cycleSize: (id: string) => void

  // Grid management
  setBreakpoint: (breakpoint: Breakpoint) => void
  toggleArrange: () => void

  // Persistence
  load: () => void
  save: () => void
  resetToDefaults: () => void
}

/**
 * Default layout with no overlaps - optimized for desktop
 */
function getDefaultLayout(): WidgetInstance[] {
  return [
    // Top row - 4 stat cards (1x1 each)
    { id: 'open-issues', kind: 'openIssues', x: 0, y: 0, w: 1, h: 1 },
    { id: 'in-progress', kind: 'inProgress', x: 1, y: 0, w: 1, h: 1 },
    { id: 'overdue', kind: 'overdue', x: 2, y: 0, w: 1, h: 1 },
    { id: 'resolved-today', kind: 'resolvedToday', x: 3, y: 0, w: 1, h: 1 },

    // Large widgets below - fixed positioning to prevent overlaps
    { id: 'team-inbox', kind: 'teamInbox', x: 0, y: 1, w: 6, h: 3 },      // Wide widget
    { id: 'my-work-queue', kind: 'myWorkQueue', x: 6, y: 1, w: 3, h: 2 }, // Medium widget
    { id: 'sla-monitoring', kind: 'slaMonitoring', x: 0, y: 4, w: 3, h: 2 }, // Move below to avoid overlap
  ]
}

/**
 * Find optimal position for a new widget
 */
function findOptimalPosition(
  instances: WidgetInstance[],
  w: number,
  h: number,
  spec: GridSpec
): GPos {
  const rects = instances.map(toRect)

  // Try positions starting from top-left
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x <= spec.cols - w; x++) {
      const testRect = { id: 'temp', x, y, w, h }
      const position = placeWithoutOverlap(rects, testRect, spec)

      // If we get back the exact position we tested, it's available
      if (position.x === x && position.y === y) {
        return position
      }
    }
  }

  // Fallback: place at bottom
  const maxY = Math.max(0, ...rects.map(r => r.y + r.h))
  return clampToBounds({ x: 0, y: maxY }, { w, h }, spec)
}

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector((set, get) => ({
    instances: [],
    currentBreakpoint: 'lg' as Breakpoint,
    arrangeMode: false,

    setBreakpoint: (breakpoint: Breakpoint) => {
      set({ currentBreakpoint: breakpoint })
      const bp = breakpoint
      // Snap all widgets to discrete sizes for this breakpoint
      set(state => ({
        instances: state.instances.map(inst => {
          const sizeLabel: WidgetSize = inst.size || mapToNearestSize(bp, { w: inst.w, h: inst.h })
          const dims = getSizeFor(bp, sizeLabel)
          return { ...inst, ...dims, size: sizeLabel }
        })
      }))
      get().save()
    },

    toggleArrange: () => set(state => ({ arrangeMode: !state.arrangeMode })),

    add: (kind: WidgetKind) => {
      const { instances, currentBreakpoint } = get()
      const spec = getGridSpec(currentBreakpoint)

      // Default discrete size: M
      const defaultSize: WidgetSize = 'M'
      const dims = getSizeFor(currentBreakpoint, defaultSize)

      // Find optimal position using grid algorithms
      const position = findOptimalPosition(
        instances,
        dims.w,
        dims.h,
        spec
      )

      const newWidget: WidgetInstance = {
        id: `${kind}-${Date.now()}`,
        kind,
        x: position.x,
        y: position.y,
        w: dims.w,
        h: dims.h,
        size: defaultSize,
      }

      set(state => ({
        instances: [...state.instances, newWidget]
      }))
      get().save()
    },

    remove: (id: string) => {
      set(state => ({
        instances: state.instances.filter(w => w.id !== id)
      }))

      // Compact after removing to fill gaps
      get().compact()
    },

    move: (id: string, position: GridPosition) => {
      const { instances, currentBreakpoint } = get()
      const widget = instances.find(w => w.id === id)
      if (!widget) return

      const spec = getGridSpec(currentBreakpoint)

      // Clamp to bounds
      const clamped = clampToBounds(position, widget, spec)

      // Get other widgets as rects
      const otherRects = instances
        .filter(w => w.id !== id)
        .map(toRect)

      // Find collision-free position
      const finalPos = placeWithoutOverlap(
        otherRects,
        { ...toRect(widget), ...clamped },
        spec
      )

      // Update position
      set(state => ({
        instances: state.instances.map(w =>
          w.id === id ? { ...w, x: finalPos.x, y: finalPos.y } : w
        )
      }))
      get().save()
    },

    updateLayout: (layoutItems: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      set(state => ({
        instances: state.instances.map(inst => {
          const layoutItem = layoutItems.find(item => item.i === inst.id)
          if (layoutItem) {
            return {
              ...inst,
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            }
          }
          return inst
        })
      }))
      get().save()
    },

    // Compact widgets to fill gaps
    compact: () => {
      const { instances, currentBreakpoint } = get()
      const spec = getGridSpec(currentBreakpoint)

      // Sort instances by y position, then by x position
      const sorted = [...instances].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y
        return a.x - b.x
      })

      let currentY = 0
      const compacted = sorted.map(inst => {
        // Find the lowest position where this widget can fit
        let newY = currentY
        let attempts = 0
        const maxAttempts = 20

        while (attempts < maxAttempts) {
          const testRect = { id: inst.id, x: inst.x, y: newY, w: inst.w, h: inst.h }
          const otherRects = sorted
            .filter(w => w.id !== inst.id)
            .map(toRect)

          const collision = otherRects.some(other => intersect(testRect, other))

          if (!collision) {
            break
          }

          newY++
          attempts++
        }

        currentY = newY + inst.h

        return { ...inst, y: newY }
      })

      set({ instances: compacted })
      get().save()
    },

    resize: (id: string, size: { w: number; h: number }) => {
      const { instances, currentBreakpoint } = get()
      const widget = instances.find(w => w.id === id)
      if (!widget) return

      const spec = getGridSpec(currentBreakpoint)

      // Snap to nearest discrete size label
      const label = mapToNearestSize(currentBreakpoint, { w: size.w, h: size.h })
      const { w, h } = getSizeFor(currentBreakpoint, label)

      // Get other widgets as rects
      const otherRects = instances
        .filter(w => w.id !== id)
        .map(toRect)

      // Find position that accommodates new size
      const resizedRect = { ...toRect(widget), w, h }
      const finalPos = placeWithoutOverlap(otherRects, resizedRect, spec)

      // Update widget with new size and position
      set(state => ({
        instances: state.instances.map(inst =>
          inst.id === id ? { ...inst, x: finalPos.x, y: finalPos.y, w, h, size: label } : inst
        )
      }))
      get().save()
    },

    resizeTo: (id: string, label: WidgetSize) => {
      const { instances, currentBreakpoint } = get()
      const widget = instances.find(w => w.id === id)
      if (!widget) return
      const spec = getGridSpec(currentBreakpoint)
      const { w, h } = getSizeFor(currentBreakpoint, label)
      const otherRects = instances.filter(w => w.id !== id).map(toRect)
      const resizedRect = { ...toRect(widget), w, h }
      const finalPos = placeWithoutOverlap(otherRects, resizedRect, spec)
      set(state => ({
        instances: state.instances.map(inst =>
          inst.id === id ? { ...inst, x: finalPos.x, y: finalPos.y, w, h, size: label } : inst
        )
      }))
      get().save()
    },

    cycleSize: (id: string) => {
      const { instances, currentBreakpoint } = get()
      const inst = instances.find(w => w.id === id)
      if (!inst) return
      const label = inst.size || mapToNearestSize(currentBreakpoint, { w: inst.w, h: inst.h })
      const next = nextSize(label)
      get().resizeTo(id, next)
    },

    load: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: DashboardState = JSON.parse(stored)
          set({ instances: data.instances })
          return
        }

        // Try migrate from legacy keys
        for (const key of LEGACY_KEYS) {
          const legacy = localStorage.getItem(key)
          if (!legacy) continue
          const data: DashboardState = JSON.parse(legacy)
          const bp = get().currentBreakpoint
          const migrated = data.instances.map(inst => {
            const size = mapToNearestSize(bp, { w: inst.w, h: inst.h })
            const dims = getSizeFor(bp, size)
            return { ...inst, ...dims, size }
          })
          set({ instances: migrated })
          get().save()
          return
        }

        // Seed defaults
        const defaultWidgets = getDefaultLayout()
        set({ instances: defaultWidgets })
        get().save()
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        const defaultWidgets = getDefaultLayout()
        set({ instances: defaultWidgets })
        get().save()
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
      get().save()
    },
  }))
)

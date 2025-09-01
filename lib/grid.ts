/**
 * Grid calculation utilities for snap-to-grid dashboard layout.
 * 
 * This module provides pure functions for grid math, collision detection,
 * placement algorithms, and compaction logic.
 */

export type Breakpoint = "lg" | "md" | "sm";

export interface GridSpec {
  cols: number;        // e.g. 12, 6, 1
  rowH: number;        // px per row
  gap: number;         // px gap between cells
}

export interface GPos { 
  x: number; 
  y: number;
}

export interface GSize { 
  w: number; 
  h: number;
}

export interface Rect extends GPos, GSize { 
  id: string;
}

/**
 * Grid specifications for different breakpoints
 */
export const GRID_SPECS: Record<Breakpoint, GridSpec> = {
  // Align to spec: desktop ≥1280px, 12 cols, row unit 8px, gutter 16px
  lg: { cols: 12, rowH: 8, gap: 16 },
  // Tablet 768–1279px, 8 cols, same row unit and gutter
  md: { cols: 8, rowH: 8, gap: 16 },
  // Mobile: keep 1 col but we won't render arrange UI on this breakpoint
  sm: { cols: 1, rowH: 8, gap: 16 },
};

/**
 * Convert pixel coordinates to grid cell position
 */
export function pxToCell(
  px: { left: number; top: number },
  container: { left: number; top: number },
  spec: GridSpec,
  colW: number
): GPos {
  const relativeX = px.left - container.left;
  const relativeY = px.top - container.top;
  
  // Account for gaps between cells
  const x = Math.round(relativeX / (colW + spec.gap));
  const y = Math.round(relativeY / (spec.rowH + spec.gap));
  
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

/**
 * Calculate column width based on container width and grid spec
 */
export function calculateColumnWidth(containerWidth: number, spec: GridSpec): number {
  return (containerWidth - (spec.cols - 1) * spec.gap) / spec.cols;
}

/**
 * Clamp position to grid bounds considering widget size
 */
export function clampToBounds(pos: GPos, size: GSize, spec: GridSpec): GPos {
  return {
    x: Math.max(0, Math.min(pos.x, spec.cols - size.w)),
    y: Math.max(0, pos.y), // Allow unlimited rows downward
  };
}

/**
 * Check if two rectangles intersect
 */
export function intersect(a: Rect, b: Rect): boolean {
  return !(
    a.x >= b.x + b.w ||
    b.x >= a.x + a.w ||
    a.y >= b.y + b.h ||
    b.y >= a.y + a.h
  );
}

/**
 * Find all items in layout that collide with the moving rect
 */
export function collide(layout: Rect[], moving: Rect): Rect[] {
  return layout.filter(item => 
    item.id !== moving.id && intersect(item, moving)
  );
}

/**
 * Find the nearest valid position for a widget using BFS spiral search
 */
export function placeWithoutOverlap(
  layout: Rect[], 
  moving: Rect, 
  spec: GridSpec
): GPos {
  const otherRects = layout.filter(rect => rect.id !== moving.id);
  
  // Start from the preferred position
  const startPos = clampToBounds(
    { x: moving.x, y: moving.y }, 
    { w: moving.w, h: moving.h }, 
    spec
  );
  
  // Check if starting position is valid
  const testRect = { ...moving, ...startPos };
  if (collide(otherRects, testRect).length === 0) {
    return startPos;
  }
  
  // Use BFS to find nearest valid position
  const visited = new Set<string>();
  const queue: GPos[] = [startPos];
  
  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.x},${pos.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    // Test this position
    const clamped = clampToBounds(pos, { w: moving.w, h: moving.h }, spec);
    const candidate = { ...moving, ...clamped };
    
    if (collide(otherRects, candidate).length === 0) {
      return clamped;
    }
    
    // Add neighboring positions (spiral outward)
    const neighbors = [
      { x: pos.x, y: pos.y + 1 },     // down
      { x: pos.x + 1, y: pos.y },     // right
      { x: pos.x - 1, y: pos.y },     // left
      { x: pos.x, y: pos.y - 1 },     // up
      { x: pos.x + 1, y: pos.y + 1 }, // diagonal down-right
      { x: pos.x - 1, y: pos.y + 1 }, // diagonal down-left
      { x: pos.x + 1, y: pos.y - 1 }, // diagonal up-right
      { x: pos.x - 1, y: pos.y - 1 }, // diagonal up-left
    ];
    
    for (const neighbor of neighbors) {
      if (neighbor.x >= 0 && neighbor.y >= 0) {
        queue.push(neighbor);
      }
    }
  }
  
  // Fallback: place at bottom
  const maxY = Math.max(0, ...otherRects.map(r => r.y + r.h));
  return clampToBounds({ x: 0, y: maxY }, { w: moving.w, h: moving.h }, spec);
}

/**
 * Compact layout by moving widgets up and left to remove gaps
 */
export function compact(layout: Rect[], spec: GridSpec): Rect[] {
  if (layout.length === 0) return [];
  
  // Sort by y position first, then x position for stable ordering
  const sorted = [...layout].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });
  
  const compacted: Rect[] = [];
  
  for (const widget of sorted) {
    // Try to place this widget as high and left as possible
    let bestPos = { x: widget.x, y: widget.y };
    
    // Start from top-left and scan for the first available position
    for (let y = 0; y <= widget.y; y++) {
      for (let x = 0; x < spec.cols; x++) {
        const candidatePos = clampToBounds({ x, y }, widget, spec);
        const candidateRect = { ...widget, ...candidatePos };
        
        if (collide(compacted, candidateRect).length === 0) {
          bestPos = candidatePos;
          break;
        }
      }
      
      // If we found a position in this row, use it
      if (bestPos.y === y) break;
    }
    
    compacted.push({ ...widget, ...bestPos });
  }
  
  return compacted;
}

/**
 * Get the appropriate grid spec for a given breakpoint
 */
export function getGridSpec(breakpoint: Breakpoint): GridSpec {
  return GRID_SPECS[breakpoint];
}

/**
 * Determine breakpoint from container width
 */
export function getBreakpoint(containerWidth: number): Breakpoint {
  if (containerWidth >= 1280) return "lg";  // desktop
  if (containerWidth >= 768) return "md";   // tablet
  return "sm";                              // mobile
}

/**
 * Convert grid position to pixel coordinates
 */
export function cellToPx(
  pos: GPos, 
  size: GSize, 
  spec: GridSpec, 
  colW: number
): { left: number; top: number; width: number; height: number } {
  return {
    left: pos.x * (colW + spec.gap),
    top: pos.y * (spec.rowH + spec.gap),
    width: size.w * colW + (size.w - 1) * spec.gap,
    height: size.h * spec.rowH + (size.h - 1) * spec.gap,
  };
}

/**
 * Utility to convert WidgetInstance to Rect
 */
export function toRect(widget: { id: string; x: number; y: number; w: number; h: number }): Rect {
  return {
    id: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
  };
}

/**
 * Utility to convert Rect back to position/size
 */
export function fromRect(rect: Rect): { id: string; x: number; y: number; w: number; h: number } {
  return {
    id: rect.id,
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
  };
}

/**
 * Discrete widget sizes per breakpoint (S/M/L/XL)
 */
export type WidgetSize = 'S' | 'M' | 'L' | 'XL';

export const SIZE_MAP: Record<Breakpoint, Record<WidgetSize, { w: number; h: number }>> = {
  lg: {
    S: { w: 3, h: 3 },
    M: { w: 6, h: 3 },
    L: { w: 12, h: 3 },
    XL: { w: 12, h: 6 },
  },
  md: {
    S: { w: 2, h: 3 },
    M: { w: 4, h: 3 },
    L: { w: 8, h: 3 },
    XL: { w: 8, h: 6 },
  },
  sm: {
    // Not used for arranging; keep reasonable defaults
    S: { w: 1, h: 3 },
    M: { w: 1, h: 3 },
    L: { w: 1, h: 6 },
    XL: { w: 1, h: 6 },
  },
};

export const SIZE_ORDER: WidgetSize[] = ['S','M','L','XL'];

export function getSizeFor(breakpoint: Breakpoint, size: WidgetSize): { w: number; h: number } {
  return SIZE_MAP[breakpoint][size];
}

/**
 * Choose the nearest discrete size for a given w/h.
 */
export function mapToNearestSize(
  breakpoint: Breakpoint,
  dims: { w: number; h: number }
): WidgetSize {
  const sizes = SIZE_ORDER.map(s => ({ s, d: SIZE_MAP[breakpoint][s] }))
  // simple Manhattan distance on grid units
  let best: { size: WidgetSize; score: number } | null = null;
  for (const entry of sizes) {
    const score = Math.abs(entry.d.w - dims.w) + Math.abs(entry.d.h - dims.h)
    if (!best || score < best.score) best = { size: entry.s, score }
  }
  return best ? best.size : 'M'
}

export function nextSize(current: WidgetSize): WidgetSize {
  const idx = SIZE_ORDER.indexOf(current)
  return SIZE_ORDER[Math.min(SIZE_ORDER.length - 1, idx + 1)]
}

export function prevSize(current: WidgetSize): WidgetSize {
  const idx = SIZE_ORDER.indexOf(current)
  return SIZE_ORDER[Math.max(0, idx - 1)]
}


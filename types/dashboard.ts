/**
 * Dashboard widget type definitions for the helpdesk application.
 * 
 * This module defines the core types for the drag-and-drop dashboard system,
 * including widget kinds, definitions, instances, and props.
 */

export type WidgetKind =
  | "openIssues" 
  | "inProgress" 
  | "overdue" 
  | "resolvedToday"
  | "teamInbox" 
  | "myWorkQueue" 
  | "slaMonitoring";

/**
 * Widget definition interface that describes the metadata and behavior of a widget type.
 */
export interface WidgetDefinition {
  /** Unique identifier for the widget type */
  kind: WidgetKind;
  /** Display title for the widget */
  title: string;
  /** Brief description of what the widget shows */
  description: string;
  /** Minimum width in grid units */
  minW: number;
  /** Minimum height in grid units */
  minH: number;
  /** Default width in grid units */
  defaultW: number;
  /** Default height in grid units */
  defaultH: number;
  /** React component to render for this widget */
  component: React.ComponentType<WidgetProps>;
  /** Icon component for widget selection */
  icon: React.ComponentType<{ className?: string }>;
  /** Optional dedicated preview component for the add widget dialog */
  Preview?: React.ComponentType<WidgetProps>;
}

/**
 * Widget instance interface that represents a placed widget on the dashboard.
 */
export interface WidgetInstance {
  /** Unique identifier for this widget instance */
  id: string;
  /** Widget type */
  kind: WidgetKind;
  /** Grid column position (0-based) */
  x: number;
  /** Grid row position (0-based) */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Discrete size label (S/M/L/XL). Optional to preserve backward compat */
  size?: 'S' | 'M' | 'L' | 'XL';
}

/**
 * Props passed to all widget components.
 */
export interface WidgetProps {
  /** The widget instance data */
  instance: WidgetInstance;
  /** Callback to remove this widget */
  onRemove?: (id: string) => void;
  /** Callback to resize this widget */
  onResize?: (id: string, size: { w: number; h: number }) => void;
  /** Whether the widget is currently being dragged */
  isDragging?: boolean;
  /** Whether the widget is in resize mode */
  isResizing?: boolean;
}

/**
 * Dashboard layout configuration for different breakpoints.
 */
export interface DashboardLayout {
  /** Number of columns at desktop breakpoint */
  desktop: {
    cols: number;
    breakpoint: string;
  };
  /** Number of columns at tablet breakpoint */
  tablet: {
    cols: number;
    breakpoint: string;
  };
  /** Number of columns at mobile breakpoint */
  mobile: {
    cols: number;
    breakpoint: string;
  };
}

/**
 * Grid position utilities
 */
export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  w: number;
  h: number;
}

export interface GridBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Dashboard state interface for persistence
 */
export interface DashboardState {
  instances: WidgetInstance[];
  version: string;
  lastModified: string;
}

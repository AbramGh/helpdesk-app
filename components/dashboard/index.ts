/**
 * Dashboard system exports.
 * 
 * This file provides convenient access to all dashboard components and utilities.
 */

// Core components
export { DashboardGrid, DashboardGridEmptyState } from './DashboardGrid'
export { DraggableWidget } from './DraggableWidget'
export { AddWidgetDialog } from './AddWidgetDialog'

// Widget registry
export { 
  WIDGET_REGISTRY,
  getWidgetDefinition,
  getAllWidgetDefinitions,
  searchWidgetDefinitions,
  isValidWidgetKind
} from './registry'

// Individual widgets
export { OpenIssuesWidget } from './widgets/OpenIssuesWidget'
export { InProgressWidget } from './widgets/InProgressWidget'
export { OverdueWidget } from './widgets/OverdueWidget'
export { ResolvedTodayWidget } from './widgets/ResolvedTodayWidget'
export { TeamInboxWidget } from './widgets/TeamInboxWidget'
export { MyWorkQueueWidget } from './widgets/MyWorkQueueWidget'
export { SLAMonitoringWidget } from './widgets/SLAMonitoringWidget'

// Store
export { useDashboardStore } from '@/stores/dashboard'

// Types
export type {
  WidgetKind,
  WidgetDefinition,
  WidgetInstance,
  WidgetProps,
  DashboardLayout,
  GridPosition,
  GridSize,
  GridBounds,
  DashboardState
} from '@/types/dashboard'

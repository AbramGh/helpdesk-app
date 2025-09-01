/**
 * Widget registry for the dashboard system.
 * 
 * This module provides the centralized registry of all available widgets,
 * their metadata, and utility functions for widget management.
 */

import { 
  Inbox, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  TrendingUp,
} from "lucide-react"
import { WidgetDefinition, WidgetKind } from "@/types/dashboard"
import { OpenIssuesWidget } from "./widgets/OpenIssuesWidget"
import { InProgressWidget } from "./widgets/InProgressWidget"
import { OverdueWidget } from "./widgets/OverdueWidget"
import { ResolvedTodayWidget } from "./widgets/ResolvedTodayWidget"
import { TeamInboxWidget } from "./widgets/TeamInboxWidget"
import { MyWorkQueueWidget } from "./widgets/MyWorkQueueWidget"
import { SLAMonitoringWidget } from "./widgets/SLAMonitoringWidget"

/**
 * Complete registry of all available widgets with their metadata and components.
 */
export const WIDGET_REGISTRY: Record<WidgetKind, WidgetDefinition> = {
  openIssues: {
    kind: "openIssues",
    title: "Open Issues",
    description: "Total number of unresolved issues",
    minW: 1,
    minH: 1,
    defaultW: 1,
    defaultH: 1,
    component: OpenIssuesWidget,
    icon: Inbox,
  },
  inProgress: {
    kind: "inProgress",
    title: "In Progress",
    description: "Issues currently being worked on",
    minW: 1,
    minH: 1,
    defaultW: 1,
    defaultH: 1,
    component: InProgressWidget,
    icon: Clock,
  },
  overdue: {
    kind: "overdue",
    title: "Overdue",
    description: "Issues that have passed their due date",
    minW: 1,
    minH: 1,
    defaultW: 1,
    defaultH: 1,
    component: OverdueWidget,
    icon: AlertTriangle,
  },
  resolvedToday: {
    kind: "resolvedToday",
    title: "Resolved Today",
    description: "Issues resolved in the last 24 hours",
    minW: 1,
    minH: 1,
    defaultW: 1,
    defaultH: 1,
    component: ResolvedTodayWidget,
    icon: CheckCircle,
  },
  teamInbox: {
    kind: "teamInbox",
    title: "Team Inbox",
    description: "Recent issues requiring team attention",
    minW: 2,
    minH: 3,
    defaultW: 3,
    defaultH: 3,
    component: TeamInboxWidget,
    icon: Inbox,
  },
  myWorkQueue: {
    kind: "myWorkQueue",
    title: "My Work Queue",
    description: "Issues assigned to you",
    minW: 2,
    minH: 2,
    defaultW: 2,
    defaultH: 2,
    component: MyWorkQueueWidget,
    icon: Users,
  },
  slaMonitoring: {
    kind: "slaMonitoring",
    title: "SLA Monitoring",
    description: "Service level agreement metrics",
    minW: 2,
    minH: 2,
    defaultW: 2,
    defaultH: 2,
    component: SLAMonitoringWidget,
    icon: TrendingUp,
  },
}

/**
 * Get widget definition by kind.
 */
export function getWidgetDefinition(kind: WidgetKind): WidgetDefinition {
  return WIDGET_REGISTRY[kind]
}

/**
 * Get all available widget definitions as an array.
 */
export function getAllWidgetDefinitions(): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY)
}

/**
 * Get widget definitions filtered by search term.
 */
export function searchWidgetDefinitions(searchTerm: string): WidgetDefinition[] {
  const term = searchTerm.toLowerCase()
  return getAllWidgetDefinitions().filter(
    (widget) =>
      widget.title.toLowerCase().includes(term) ||
      widget.description.toLowerCase().includes(term)
  )
}

/**
 * Check if a widget kind exists in the registry.
 */
export function isValidWidgetKind(kind: string): kind is WidgetKind {
  return kind in WIDGET_REGISTRY
}

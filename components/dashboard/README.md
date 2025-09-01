# Dashboard System

A fully-featured drag-and-drop dashboard system built with Next.js, TypeScript, and @dnd-kit.

## Features

- ✅ **Drag & Drop**: Move widgets around the grid with mouse or keyboard
- ✅ **Responsive Grid**: 12 columns on desktop, 6 on tablet, 1 on mobile
- ✅ **Widget Resize**: Resize widgets with constraints (min/max sizes)
- ✅ **Add/Remove Widgets**: Searchable dialog to add widgets, context menu to remove
- ✅ **Collision Detection**: Automatic layout adjustment when widgets overlap
- ✅ **Persistence**: Layout saved to localStorage with versioning
- ✅ **Accessibility**: Full keyboard navigation and screen reader support
- ✅ **TypeScript**: Fully typed with strict type checking

## Components

### Core Components

- `DashboardGrid` - Main grid container with drag-and-drop functionality
- `DraggableWidget` - Individual widget wrapper with controls
- `AddWidgetDialog` - Modal for adding new widgets
- `registry.tsx` - Widget definitions and utility functions

### Widget Components

- `OpenIssuesWidget` - Shows count of open issues
- `InProgressWidget` - Shows count of in-progress issues  
- `OverdueWidget` - Shows count of overdue issues
- `ResolvedTodayWidget` - Shows count of issues resolved today
- `TeamInboxWidget` - List of recent team issues
- `MyWorkQueueWidget` - List of assigned issues
- `SLAMonitoringWidget` - SLA metrics and performance

### State Management

- `stores/dashboard.ts` - Zustand store for layout management
- Automatic persistence to localStorage
- Collision detection and resolution
- Grid positioning utilities

## Usage

### Basic Setup

```tsx
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { useDashboardStore } from '@/stores/dashboard'

function MyDashboard() {
  const { load } = useDashboardStore()
  
  useEffect(() => {
    load() // Load saved layout
  }, [load])

  return <DashboardGrid />
}
```

### Adding the Add Widget Button

```tsx
import { AddWidgetDialog } from '@/components/dashboard/AddWidgetDialog'

<AddWidgetDialog 
  variant="default" 
  size="lg"
  triggerText="Add Widget"
/>
```

### Creating Custom Widgets

1. Define your widget component:

```tsx
import { WidgetProps } from '@/types/dashboard'

export function MyCustomWidget({ instance }: WidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your widget content */}
      </CardContent>
    </Card>
  )
}
```

2. Add to registry:

```tsx
// In components/dashboard/registry.tsx
export const WIDGET_REGISTRY: Record<WidgetKind, WidgetDefinition> = {
  // ... existing widgets
  myCustomWidget: {
    kind: "myCustomWidget",
    title: "My Custom Widget",
    description: "Does something amazing",
    minW: 2,
    minH: 2,
    defaultW: 3,
    defaultH: 3,
    component: MyCustomWidget,
    icon: MyIcon,
  },
}
```

## Keyboard Navigation

- **Tab/Shift+Tab**: Navigate between widgets
- **Space/Enter**: Pick up or drop a widget
- **Arrow Keys**: Move widget by one grid cell
- **Escape**: Cancel drag operation

## Grid System

- **Desktop**: 12 columns, 120px row height
- **Tablet**: 6 columns, 120px row height  
- **Mobile**: 1 column, auto row height
- **Gap**: 1rem between widgets

## Storage

Layout is automatically saved to localStorage with key `ac_dashboard_layout_v1`. The data structure includes:

```typescript
interface DashboardState {
  instances: WidgetInstance[]
  version: string
  lastModified: string
}
```

## Responsive Behavior

Widgets automatically adapt to different screen sizes:

- Widget spans are clamped to available columns
- Vertical layout on mobile (single column)
- Touch-friendly controls on mobile devices

## Accessibility Features

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader announcements
- Focus management during drag operations
- High contrast mode support

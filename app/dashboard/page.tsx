/**
 * Dashboard Page with Customizable Widgets
 * 
 * This page provides a fully customizable dashboard interface with
 * drag-and-drop widgets, live preview, and persistent layouts.
 */

import { Suspense } from "react"
import CustomizableDashboard from "@/components/dashboard/CustomizableDashboard"
import SimpleDashboard from "@/components/dashboard/SimpleDashboard"

function DashboardContent() {
  try {
    return <CustomizableDashboard />
  } catch (error) {
    console.error('CustomizableDashboard error:', error)
    return <SimpleDashboard />
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<SimpleDashboard />}>
      <DashboardContent />
    </Suspense>
  )
}

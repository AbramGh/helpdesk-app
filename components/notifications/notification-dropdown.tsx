"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  read: boolean
  createdAt: string
  data: {
    issueTitle: string
    priority?: string
    commentAuthor?: string
    oldStatus?: string
    newStatus?: string
  }
  issue: {
    id: string
    title: string
  }
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10")
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count")
      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "issue_created":
        return `New issue: ${notification.data.issueTitle}`
      case "status_changed":
        return `Status changed: ${notification.data.oldStatus} → ${notification.data.newStatus}`
      case "comment_added":
        return `${notification.data.commentAuthor} commented on ${notification.data.issueTitle}`
      case "issue_assigned":
        return `You were assigned to ${notification.data.issueTitle}`
      default:
        return notification.data.issueTitle
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={loading} className="h-auto p-1 text-xs">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getNotificationMessage(notification)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

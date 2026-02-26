"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, CheckCheck, FileWarning, AlertTriangle, CalendarClock, ShieldAlert, Megaphone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/(dashboard)/notifications/actions"

type Notification = Awaited<ReturnType<typeof getNotifications>>[number]

const typeIcons: Record<string, typeof Bell> = {
  DOCUMENT_EXPIRY: FileWarning,
  CAPA_DUE: AlertTriangle,
  ASSESSMENT_SCHEDULED: CalendarClock,
  CERT_EXPIRY: ShieldAlert,
  SYSTEM: Megaphone,
}

const typeColors: Record<string, string> = {
  DOCUMENT_EXPIRY: "text-orange-500",
  CAPA_DUE: "text-red-500",
  ASSESSMENT_SCHEDULED: "text-blue-500",
  CERT_EXPIRY: "text-yellow-600",
  SYSTEM: "text-gray-500",
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchData = useCallback(() => {
    startTransition(async () => {
      try {
        const [items, count] = await Promise.all([
          getNotifications({ limit: 10 }),
          getUnreadCount(),
        ])
        setNotifications(items)
        setUnreadCount(count)
      } catch {
        // Silently fail — non-critical UI
      }
    })
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  // Refresh when popover opens
  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  async function handleMarkAsRead(id: string) {
    const result = await markAsRead(id)
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
  }

  async function handleMarkAllAsRead() {
    const result = await markAllAsRead()
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => {
                const Icon = typeIcons[n.type] ?? Bell
                const colorClass = typeColors[n.type] ?? "text-gray-500"

                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 border-b px-4 py-3 transition-colors last:border-b-0 ${
                      n.isRead ? "opacity-60" : "bg-accent/30"
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${n.isRead ? "" : "font-medium"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 self-start"
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

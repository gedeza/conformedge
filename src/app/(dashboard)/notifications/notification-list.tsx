"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, CheckCheck, Trash2, FileWarning, AlertTriangle, CalendarClock, ShieldAlert, Megaphone, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./actions"

type Notification = Awaited<ReturnType<typeof getNotifications>>[number]

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  DOCUMENT_EXPIRY: { label: "Document Expiry", icon: FileWarning, color: "text-orange-500" },
  CAPA_DUE: { label: "CAPA Due", icon: AlertTriangle, color: "text-red-500" },
  ASSESSMENT_SCHEDULED: { label: "Assessment Scheduled", icon: CalendarClock, color: "text-blue-500" },
  CERT_EXPIRY: { label: "Certificate Expiry", icon: ShieldAlert, color: "text-yellow-600" },
  SYSTEM: { label: "System", icon: Megaphone, color: "text-gray-500" },
  CERT_UPLOAD: { label: "Certificate Upload", icon: Upload, color: "text-amber-500" },
}

interface NotificationListProps {
  initialNotifications: Notification[]
  initialUnreadCount: number
}

export function NotificationList({ initialNotifications, initialUnreadCount }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const displayed = notifications.filter((n) => {
    if (readFilter === "unread" && n.isRead) return false
    if (readFilter === "read" && !n.isRead) return false
    if (typeFilter !== "all" && n.type !== typeFilter) return false
    return true
  })

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

  async function handleDelete(id: string) {
    const n = notifications.find((n) => n.id === id)
    const result = await deleteNotification(id)
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (n && !n.isRead) setUnreadCount((c) => Math.max(0, c - 1))
      toast.success("Notification deleted")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs mt-1">
              {typeFilter !== "all" || readFilter !== "all"
                ? "Try adjusting your filters"
                : "You're all caught up"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayed.map((n) => {
            const cfg = typeConfig[n.type] ?? { label: n.type, icon: Bell, color: "text-gray-500" }
            const Icon = cfg.icon

            return (
              <Card
                key={n.id}
                className={`transition-colors ${n.isRead ? "opacity-70" : "border-primary/20 bg-accent/20"}`}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${n.isRead ? "" : "font-semibold"}`}>{n.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMarkAsRead(n.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(n.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { getNotifications, getUnreadCount } from "./actions"
import { PageHeader } from "@/components/shared/page-header"
import { NotificationList } from "./notification-list"

export default async function NotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      />
      <NotificationList initialNotifications={notifications} initialUnreadCount={unreadCount} />
    </div>
  )
}

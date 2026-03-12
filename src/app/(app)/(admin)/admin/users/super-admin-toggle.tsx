"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { adminToggleSuperAdmin } from "../actions"

interface Props {
  userId: string
  currentUserId: string
  isSuperAdmin: boolean
}

export function SuperAdminToggle({ userId, currentUserId, isSuperAdmin }: Props) {
  const [pending, startTransition] = useTransition()
  const isSelf = userId === currentUserId

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await adminToggleSuperAdmin(userId, checked)
      if (result.success) {
        toast.success(checked ? "Super admin access granted" : "Super admin access revoked")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Admin</span>
      <Switch
        checked={isSuperAdmin}
        onCheckedChange={handleToggle}
        disabled={pending || isSelf}
        aria-label={`Toggle super admin for user`}
      />
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserMinus } from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ROLES } from "@/lib/constants"
import { updateMemberRole, removeMember } from "./actions"

interface MembersListProps {
  members: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
  currentUserId: string
  canManage: boolean
}

export function MembersList({ members, currentUserId, canManage }: MembersListProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null)

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      const result = await updateMemberRole(userId, role)
      if (result.success) {
        toast.success("Role updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRemove() {
    if (!confirmRemove) return
    startTransition(async () => {
      const result = await removeMember(confirmRemove.id)
      setConfirmRemove(null)
      if (result.success) {
        toast.success("Member removed")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const isOwner = member.role === "OWNER"
          const isSelf = member.id === currentUserId
          const canRemove = canManage && !isOwner && !isSelf

          return (
            <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Select
                  defaultValue={member.role}
                  onValueChange={(role) => handleRoleChange(member.id, role)}
                  disabled={isPending || !canManage || isOwner}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600"
                    disabled={isPending}
                    onClick={() => setConfirmRemove({ id: member.id, name: member.name })}
                    title="Remove member"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{confirmRemove?.name}</strong> from
              your organization? They will lose access to all organization data immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

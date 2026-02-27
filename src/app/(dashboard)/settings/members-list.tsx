"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ROLES } from "@/lib/constants"
import { updateMemberRole } from "./actions"

interface MembersListProps {
  members: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
}

export function MembersList({ members }: MembersListProps) {
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
          <Select
            defaultValue={member.role}
            onValueChange={(role) => handleRoleChange(member.id, role)}
            disabled={isPending}
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
        </div>
      ))}
    </div>
  )
}

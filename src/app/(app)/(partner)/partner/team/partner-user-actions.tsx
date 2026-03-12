"use client"

import { useTransition } from "react"
import { MoreHorizontal, UserMinus, Shield, Eye, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removePartnerUser, updatePartnerUserRole } from "../actions"
import type { PartnerRole } from "@/types"

interface Props {
  userId: string
  currentRole: string
  userName: string
}

export function PartnerUserActions({ userId, currentRole, userName }: Props) {
  const [pending, startTransition] = useTransition()

  function handleRoleChange(role: PartnerRole) {
    startTransition(async () => {
      const result = await updatePartnerUserRole(userId, role)
      if (result.success) {
        toast.success(`Role updated for ${userName}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRemove() {
    if (!confirm(`Remove ${userName} from the partner team?`)) return

    startTransition(async () => {
      const result = await removePartnerUser(userId)
      if (result.success) {
        toast.success(`${userName} removed from partner team`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
        {currentRole !== "PARTNER_ADMIN" && (
          <DropdownMenuItem onClick={() => handleRoleChange("PARTNER_ADMIN")}>
            <Shield className="mr-2 h-4 w-4" />
            Partner Admin
          </DropdownMenuItem>
        )}
        {currentRole !== "PARTNER_MANAGER" && (
          <DropdownMenuItem onClick={() => handleRoleChange("PARTNER_MANAGER")}>
            <Pencil className="mr-2 h-4 w-4" />
            Partner Manager
          </DropdownMenuItem>
        )}
        {currentRole !== "PARTNER_VIEWER" && (
          <DropdownMenuItem onClick={() => handleRoleChange("PARTNER_VIEWER")}>
            <Eye className="mr-2 h-4 w-4" />
            Partner Viewer
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemove} className="text-red-600">
          <UserMinus className="mr-2 h-4 w-4" />
          Remove from Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

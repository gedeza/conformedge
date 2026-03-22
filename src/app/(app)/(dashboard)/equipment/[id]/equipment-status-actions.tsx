"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ChevronDown } from "lucide-react"
import { canEdit } from "@/lib/permissions"
import { updateEquipmentStatus } from "../actions"
import { EQUIPMENT_STATUSES } from "@/lib/constants"

const VALID_TRANSITIONS: Record<string, string[]> = {
  ACTIVE: ["INACTIVE", "UNDER_REPAIR", "QUARANTINED", "DECOMMISSIONED"],
  INACTIVE: ["ACTIVE", "DECOMMISSIONED"],
  UNDER_REPAIR: ["ACTIVE", "QUARANTINED", "DECOMMISSIONED"],
  QUARANTINED: ["ACTIVE", "UNDER_REPAIR", "DECOMMISSIONED"],
  DECOMMISSIONED: [],
}

interface Props {
  equipmentId: string
  currentStatus: string
  role: string
}

export function EquipmentStatusActions({ equipmentId, currentStatus, role }: Props) {
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!canEdit(role)) return null

  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []
  if (allowedTransitions.length === 0) return null

  function handleConfirm() {
    if (!confirmStatus) return
    startTransition(async () => {
      const result = await updateEquipmentStatus(equipmentId, confirmStatus)
      if (result.success) {
        toast.success(`Status updated to ${EQUIPMENT_STATUSES[confirmStatus as keyof typeof EQUIPMENT_STATUSES]?.label || confirmStatus}`)
        setConfirmStatus(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  const isDestructive = confirmStatus === "DECOMMISSIONED" || confirmStatus === "QUARANTINED"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Change Status <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allowedTransitions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => setConfirmStatus(status)}
              className={status === "DECOMMISSIONED" || status === "QUARANTINED" ? "text-destructive" : ""}
            >
              {EQUIPMENT_STATUSES[status as keyof typeof EQUIPMENT_STATUSES]?.label || status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(open) => !open && setConfirmStatus(null)}
        title={`${isDestructive ? "Confirm" : "Update"} Status`}
        description={`Are you sure you want to change this equipment to "${EQUIPMENT_STATUSES[confirmStatus as keyof typeof EQUIPMENT_STATUSES]?.label || confirmStatus}"?${
          confirmStatus === "DECOMMISSIONED" ? " This action preserves equipment history but removes it from active use." :
          confirmStatus === "QUARANTINED" ? " Equipment will be flagged as unsafe for use until resolved." : ""
        }`}
        onConfirm={handleConfirm}
        loading={isPending}
      />
    </>
  )
}

"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle, XCircle, Ban, MoreVertical, ClipboardCheck } from "lucide-react"
import { canEdit } from "@/lib/permissions"
import { updateObligationStatus, reviewObligation } from "../actions"

interface Props {
  obligationId: string
  currentStatus: string
  role: string
}

export function ObligationActions({ obligationId, currentStatus, role }: Props) {
  const [isPending, startTransition] = useTransition()

  if (!canEdit(role)) return null

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await updateObligationStatus(obligationId, newStatus)
      if (result.success) {
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleReview() {
    startTransition(async () => {
      const result = await reviewObligation(obligationId)
      if (result.success) {
        toast.success("Obligation reviewed")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleReview} disabled={isPending}>
        <ClipboardCheck className="h-4 w-4 mr-1" /> Mark Reviewed
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={isPending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus === "PENDING" && (
            <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate
            </DropdownMenuItem>
          )}
          {currentStatus === "ACTIVE" && (
            <>
              <DropdownMenuItem onClick={() => handleStatusChange("EXPIRED")}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Mark Expired
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("REVOKED")}>
                <Ban className="mr-2 h-4 w-4" /> Revoke
              </DropdownMenuItem>
            </>
          )}
          {(currentStatus === "EXPIRED" || currentStatus === "REVOKED") && (
            <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Reactivate
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusChange("NOT_APPLICABLE")}>
            <Ban className="mr-2 h-4 w-4 text-muted-foreground" /> Not Applicable
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

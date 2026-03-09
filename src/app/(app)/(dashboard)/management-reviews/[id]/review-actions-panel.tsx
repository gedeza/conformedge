"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { MANAGEMENT_REVIEW_STATUSES } from "@/lib/constants"
import { transitionReview } from "../actions"
import { canEdit } from "@/lib/permissions"

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

interface ReviewActionsPanelProps {
  reviewId: string
  currentStatus: string
  role: string
}

export function ReviewActionsPanel({ reviewId, currentStatus, role }: ReviewActionsPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmTransition, setConfirmTransition] = useState<string | null>(null)

  const nextStatuses = VALID_TRANSITIONS[currentStatus] || []

  async function handleTransition(newStatus: string) {
    startTransition(async () => {
      const result = await transitionReview(reviewId, newStatus)
      if (result.success) {
        toast.success(`Status updated to ${MANAGEMENT_REVIEW_STATUSES[newStatus as keyof typeof MANAGEMENT_REVIEW_STATUSES]?.label ?? newStatus}`)
        setConfirmTransition(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!canEdit(role) || nextStatuses.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm">Workflow</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {currentStatus === "COMPLETED" ? "This review is complete." :
             currentStatus === "CANCELLED" ? "This review was cancelled." :
             "No actions available."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-sm">Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {nextStatuses.map((status) => {
            const config = MANAGEMENT_REVIEW_STATUSES[status as keyof typeof MANAGEMENT_REVIEW_STATUSES]
            return (
              <Button
                key={status}
                variant={status === "CANCELLED" ? "outline" : "default"}
                className="w-full"
                disabled={isPending}
                onClick={() => setConfirmTransition(status)}
              >
                {config?.label ?? status}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmTransition}
        onOpenChange={(open) => !open && setConfirmTransition(null)}
        title="Confirm Status Change"
        description={`Move this review to "${confirmTransition?.replace(/_/g, " ")}"?`}
        confirmLabel="Confirm"
        onConfirm={() => confirmTransition && handleTransition(confirmTransition)}
        loading={isPending}
      />
    </>
  )
}

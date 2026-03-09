"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { canEdit, canCreate } from "@/lib/permissions"
import { cancelObjective } from "../actions"
import { AddMeasurementDialog } from "./add-measurement-dialog"

interface ObjectiveActionsPanelProps {
  objectiveId: string
  objectiveStatus: string
  targetValue: number
  unit: string | null
  role: string
}

export function ObjectiveActionsPanel({
  objectiveId,
  objectiveStatus,
  targetValue,
  unit,
  role,
}: ObjectiveActionsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMeasurement, setShowMeasurement] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const isClosed = objectiveStatus === "CANCELLED" || objectiveStatus === "ACHIEVED"

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelObjective(objectiveId)
      if (result.success) {
        toast.success("Objective cancelled")
        setShowCancel(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {!isClosed && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {canCreate(role) && (
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowMeasurement(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Record Measurement
              </Button>
            )}
            {canEdit(role) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowCancel(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Objective
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AddMeasurementDialog
        open={showMeasurement}
        onOpenChange={setShowMeasurement}
        objectiveId={objectiveId}
        unit={unit}
        targetValue={targetValue}
      />

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Objective"
        description="Are you sure you want to cancel this objective? This can be undone by editing."
        onConfirm={handleCancel}
        loading={isPending}
      />
    </div>
  )
}

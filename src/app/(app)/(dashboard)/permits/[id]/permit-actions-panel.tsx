"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, CalendarPlus, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { SignaturePad } from "@/components/shared/signature-pad"
import { canEdit } from "@/lib/permissions"
import {
  transitionPermit,
  checkPermitItem,
  requestExtension,
  reviewExtension,
} from "../actions"
import { DatePicker } from "@/components/shared/date-picker"

const VALID_TRANSITIONS: Record<string, { target: string; label: string; variant?: "default" | "outline" | "destructive" }[]> = {
  DRAFT: [
    { target: "PENDING_APPROVAL", label: "Submit for Approval" },
    { target: "CANCELLED", label: "Cancel", variant: "outline" },
  ],
  PENDING_APPROVAL: [
    { target: "APPROVED", label: "Approve" },
    { target: "DRAFT", label: "Return to Draft", variant: "outline" },
  ],
  APPROVED: [
    { target: "ACTIVE", label: "Activate Permit" },
    { target: "CANCELLED", label: "Cancel", variant: "outline" },
  ],
  ACTIVE: [
    { target: "CLOSED", label: "Close Permit" },
    { target: "SUSPENDED", label: "Suspend", variant: "outline" },
    { target: "CANCELLED", label: "Cancel", variant: "destructive" },
  ],
  SUSPENDED: [
    { target: "ACTIVE", label: "Resume Permit" },
    { target: "CLOSED", label: "Close Permit", variant: "outline" },
    { target: "CANCELLED", label: "Cancel", variant: "destructive" },
  ],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
}

interface PermitActionsPanelProps {
  permitId: string
  currentStatus: string
  validTo: Date
  checklistItems: { id: string; description: string; isChecked: boolean }[]
  pendingExtension: { id: string } | null
  members: { id: string; name: string }[]
  role: string
}

export function PermitActionsPanel({
  permitId,
  currentStatus,
  validTo,
  checklistItems,
  pendingExtension,
  role,
}: PermitActionsPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmTransition, setConfirmTransition] = useState<string | null>(null)
  const [closureNotes, setClosureNotes] = useState("")
  const [closureSignature, setClosureSignature] = useState<string | null>(null)

  // Extension state
  const [showExtensionForm, setShowExtensionForm] = useState(false)
  const [extNewValidTo, setExtNewValidTo] = useState<Date | undefined>(undefined)
  const [extReason, setExtReason] = useState("")

  const transitions = VALID_TRANSITIONS[currentStatus] ?? []

  function handleTransition(newStatus: string) {
    startTransition(async () => {
      const notes = (newStatus === "CLOSED" || newStatus === "SUSPENDED")
        ? (closureNotes + (closureSignature ? `\n[SIGNATURE:${closureSignature}]` : ""))
        : undefined
      const result = await transitionPermit(permitId, newStatus, notes)
      if (result.success) {
        toast.success(`Permit ${newStatus.toLowerCase().replace(/_/g, " ")}`)
        setConfirmTransition(null)
        setClosureNotes("")
        setClosureSignature(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggleChecklistItem(itemId: string, isChecked: boolean) {
    startTransition(async () => {
      const result = await checkPermitItem(permitId, itemId, !isChecked)
      if (result.success) {
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRequestExtension() {
    if (!extNewValidTo || !extReason.trim()) return
    startTransition(async () => {
      const result = await requestExtension(permitId, {
        newValidTo: extNewValidTo,
        reason: extReason,
      })
      if (result.success) {
        toast.success("Extension requested")
        setShowExtensionForm(false)
        setExtNewValidTo(undefined)
        setExtReason("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleReviewExtension(decision: "APPROVED" | "REJECTED") {
    if (!pendingExtension) return
    startTransition(async () => {
      const result = await reviewExtension(pendingExtension.id, decision)
      if (result.success) {
        toast.success(`Extension ${decision.toLowerCase()}`)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!canEdit(role)) return null

  return (
    <div className="space-y-4">
      {/* Status Transitions */}
      {transitions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transitions.map((t) => (
              <Button
                key={t.target}
                variant={t.variant ?? "default"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setConfirmTransition(t.target)}
                disabled={isPending}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {t.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Terminal state info */}
      {transitions.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              This permit is <strong>{currentStatus.toLowerCase().replace(/_/g, " ")}</strong>. No further transitions available.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Safety Checklist (interactive when ACTIVE) */}
      {checklistItems.length > 0 && currentStatus === "ACTIVE" && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Safety Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {checklistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleToggleChecklistItem(item.id, item.isChecked)}
                disabled={isPending}
                className="flex items-start gap-2 w-full text-left hover:bg-muted/50 rounded p-1.5 -mx-1.5 transition-colors"
              >
                {item.isChecked ? (
                  <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <span className={`text-xs ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>
                  {item.description}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Extension Request */}
      {currentStatus === "ACTIVE" && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Extensions</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingExtension ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pending extension request</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => handleReviewExtension("APPROVED")} disabled={isPending} className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReviewExtension("REJECTED")} disabled={isPending} className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            ) : showExtensionForm ? (
              <div className="space-y-2">
                <DatePicker value={extNewValidTo} onChange={setExtNewValidTo} />
                <Textarea
                  value={extReason}
                  onChange={(e) => setExtReason(e.target.value)}
                  placeholder="Reason for extension..."
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRequestExtension} disabled={isPending || !extNewValidTo || !extReason.trim()} className="flex-1">
                    Submit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowExtensionForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowExtensionForm(true)}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Request Extension
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transition Confirmation */}
      <ConfirmDialog
        open={!!confirmTransition}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTransition(null)
            setClosureNotes("")
            setClosureSignature(null)
          }
        }}
        title="Confirm Status Change"
        description={`${confirmTransition === "CLOSED" ? "Close this permit? Add optional closure notes below." : confirmTransition === "SUSPENDED" ? "Suspend this permit? Add optional notes below." : `Move this permit to "${confirmTransition?.replace(/_/g, " ")}"?`}`}
        confirmLabel="Confirm"
        onConfirm={() => confirmTransition && handleTransition(confirmTransition)}
        loading={isPending}
      >
        {(confirmTransition === "CLOSED" || confirmTransition === "SUSPENDED") && (
          <Input
            value={closureNotes}
            onChange={(e) => setClosureNotes(e.target.value)}
            placeholder="Notes (optional)..."
            className="mt-2"
          />
        )}
        {confirmTransition === "CLOSED" && (
          <SignaturePad
            label="Closure signature"
            onSave={(dataUrl) => setClosureSignature(dataUrl)}
            className="mt-3"
          />
        )}
      </ConfirmDialog>
    </div>
  )
}

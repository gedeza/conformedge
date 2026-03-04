"use client"

import { useState, useTransition } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reviewCertification } from "../actions"

interface CertReviewActionsProps {
  certId: string
  subcontractorId: string
  certName: string
}

export function CertReviewActions({ certId, subcontractorId, certName }: CertReviewActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState("")

  function handleApprove() {
    startTransition(async () => {
      const result = await reviewCertification(certId, subcontractorId, "APPROVED")
      if (result.success) {
        toast.success(`"${certName}" approved`)
      } else {
        toast.error(result.error ?? "Failed to approve")
      }
    })
  }

  function handleReject() {
    startTransition(async () => {
      const result = await reviewCertification(certId, subcontractorId, "REJECTED", rejectNotes || undefined)
      if (result.success) {
        toast.success(`"${certName}" rejected`)
        setRejectOpen(false)
        setRejectNotes("")
      } else {
        toast.error(result.error ?? "Failed to reject")
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-green-600 hover:text-green-700"
        onClick={handleApprove}
        disabled={isPending}
        title="Approve"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700"
        onClick={() => setRejectOpen(true)}
        disabled={isPending}
        title="Reject"
      >
        <XCircle className="h-4 w-4" />
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Certificate</DialogTitle>
            <DialogDescription>
              Reject &ldquo;{certName}&rdquo;? Optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Certificate is expired"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

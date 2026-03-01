"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { approveStep, rejectStep } from "../approval-actions"

interface Props {
  stepId: string
  stepLabel: string
  documentTitle: string
}

export function ReviewActionDialog({ stepId, stepLabel, documentTitle }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [comment, setComment] = useState("")

  function handleApprove() {
    startTransition(async () => {
      const result = await approveStep(stepId, comment.trim() || undefined)
      if (result.success) {
        toast.success("Step approved")
        setApproveOpen(false)
        setComment("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleReject() {
    if (!comment.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    startTransition(async () => {
      const result = await rejectStep(stepId, comment.trim())
      if (result.success) {
        toast.success("Step rejected")
        setRejectOpen(false)
        setComment("")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Approve Dialog */}
      <Button
        size="sm"
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => { setComment(""); setApproveOpen(true) }}
      >
        <Check className="mr-1 h-4 w-4" /> Approve
      </Button>
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Step: {stepLabel}</DialogTitle>
            <DialogDescription>
              Approving &quot;{documentTitle}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Comment <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
              <Button
                onClick={handleApprove}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Button
        size="sm"
        variant="destructive"
        onClick={() => { setComment(""); setRejectOpen(true) }}
      >
        <X className="mr-1 h-4 w-4" /> Reject
      </Button>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Step: {stepLabel}</DialogTitle>
            <DialogDescription>
              Rejecting &quot;{documentTitle}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Reason for rejection <span className="text-destructive">*</span></Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why this is being rejected..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isPending || !comment.trim()}
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

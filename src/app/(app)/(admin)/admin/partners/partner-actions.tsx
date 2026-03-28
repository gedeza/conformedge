"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Copy, Mail, AlertTriangle, Pause, Play, Ban, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  approveReferralPartner,
  rejectReferralPartner,
  resendPartnerWelcomeEmail,
  adminEditPartner,
  adminSuspendPartner,
  adminReactivatePartner,
  adminTerminatePartner,
} from "../actions"
import { toast } from "sonner"

export function ApproveButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [emailFailed, setEmailFailed] = useState(false)

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReferralPartner(partnerId)
      if (result.success && result.data) {
        setReferralUrl(result.data.url)
        if (result.data.emailSent) {
          toast.success(`Partner approved! Welcome email sent. Link: ${result.data.code}`)
        } else {
          setEmailFailed(true)
          toast.warning(`Partner approved but welcome email failed: ${result.data.emailError || "Unknown error"}. Use "Resend Email" to retry.`)
        }
      } else {
        toast.error(result.error || "Failed to approve")
      }
    })
  }

  if (referralUrl) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1 rounded">
            {referralUrl}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              navigator.clipboard.writeText(referralUrl)
              toast.success("Referral link copied!")
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        {emailFailed && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-amber-600">Email not sent</span>
            <ResendEmailButton partnerId={partnerId} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleApprove}
      disabled={isPending}
      className="gap-1"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CheckCircle className="h-3 w-3" />
      )}
      Approve
    </Button>
  )
}

export function ResendEmailButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    startTransition(async () => {
      const result = await resendPartnerWelcomeEmail(partnerId)
      if (result.success) {
        toast.success("Welcome email sent successfully!")
      } else {
        toast.error(result.error || "Failed to send email")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleResend}
      disabled={isPending}
      className="gap-1 h-7 text-xs"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Mail className="h-3 w-3" />
      )}
      Resend Email
    </Button>
  )
}

export function RejectButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleReject() {
    if (!confirm("Reject this referral partner application?")) return
    startTransition(async () => {
      const result = await rejectReferralPartner(partnerId)
      if (result.success) {
        toast.success("Partner application rejected")
      } else {
        toast.error(result.error || "Failed to reject")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleReject}
      disabled={isPending}
      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      Reject
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  Edit Partner Dialog                                                */
/* ------------------------------------------------------------------ */

export function EditPartnerButton({
  partnerId,
  initial,
}: {
  partnerId: string
  initial: {
    name: string
    contactEmail: string
    contactPhone: string | null
    commissionPercent: number
    notes: string | null
  }
}) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState({
    name: initial.name,
    contactEmail: initial.contactEmail,
    contactPhone: initial.contactPhone || "",
    commissionPercent: initial.commissionPercent,
    notes: initial.notes || "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await adminEditPartner(partnerId, values)
      if (result.success) {
        toast.success("Partner updated")
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to update")
      }
    })
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1 h-7 text-xs"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>Update partner details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={values.contactEmail}
                  onChange={(e) => setValues({ ...values, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={values.contactPhone}
                  onChange={(e) => setValues({ ...values, contactPhone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-commission">Commission %</Label>
                <Input
                  id="edit-commission"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={values.commissionPercent}
                  onChange={(e) => setValues({ ...values, commissionPercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Admin Notes</Label>
              <textarea
                id="edit-notes"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]"
                value={values.notes}
                onChange={(e) => setValues({ ...values, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Suspend / Reactivate / Terminate Buttons                           */
/* ------------------------------------------------------------------ */

export function SuspendPartnerButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSuspend() {
    if (!confirm("Suspend this partner? They will lose dashboard access.")) return
    startTransition(async () => {
      const result = await adminSuspendPartner(partnerId)
      if (result.success) {
        toast.success("Partner suspended")
      } else {
        toast.error(result.error || "Failed to suspend")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSuspend}
      disabled={isPending}
      className="gap-1 h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
      Suspend
    </Button>
  )
}

export function ReactivatePartnerButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleReactivate() {
    startTransition(async () => {
      const result = await adminReactivatePartner(partnerId)
      if (result.success) {
        toast.success("Partner reactivated")
      } else {
        toast.error(result.error || "Failed to reactivate")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleReactivate}
      disabled={isPending}
      className="gap-1 h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
      Reactivate
    </Button>
  )
}

export function TerminatePartnerButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleTerminate() {
    if (!confirm("Permanently terminate this partner? This cannot be undone.")) return
    startTransition(async () => {
      const result = await adminTerminatePartner(partnerId)
      if (result.success) {
        toast.success("Partner terminated")
      } else {
        toast.error(result.error || "Failed to terminate")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleTerminate}
      disabled={isPending}
      className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
      Terminate
    </Button>
  )
}

"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Copy, Mail, AlertTriangle } from "lucide-react"
import { approveReferralPartner, rejectReferralPartner, resendPartnerWelcomeEmail } from "../actions"
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

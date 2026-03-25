"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Copy, ExternalLink } from "lucide-react"
import { approveReferralPartner, rejectReferralPartner } from "../actions"
import { toast } from "sonner"

export function ApproveButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()
  const [referralUrl, setReferralUrl] = useState<string | null>(null)

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReferralPartner(partnerId)
      if (result.success && result.data) {
        setReferralUrl(result.data.url)
        toast.success(`Partner approved! Referral link: ${result.data.code}`)
      } else {
        toast.error(result.error || "Failed to approve")
      }
    })
  }

  if (referralUrl) {
    return (
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

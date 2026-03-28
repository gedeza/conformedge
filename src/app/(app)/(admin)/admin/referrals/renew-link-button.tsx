"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, Copy } from "lucide-react"
import { renewReferralLink } from "../actions"
import { toast } from "sonner"

export function RenewLinkButton({ partnerId }: { partnerId: string }) {
  const [isPending, startTransition] = useTransition()
  const [newUrl, setNewUrl] = useState<string | null>(null)

  function handleRenew() {
    startTransition(async () => {
      const result = await renewReferralLink(partnerId)
      if (result.success && result.data) {
        setNewUrl(result.data.url)
        toast.success(`New referral link generated: ${result.data.code}`)
      } else {
        toast.error(result.error || "Failed to renew link")
      }
    })
  }

  if (newUrl) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1 rounded">
          {newUrl}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(newUrl)
            toast.success("New referral link copied!")
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
      variant="outline"
      onClick={handleRenew}
      disabled={isPending}
      className="gap-1"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      Renew Link
    </Button>
  )
}

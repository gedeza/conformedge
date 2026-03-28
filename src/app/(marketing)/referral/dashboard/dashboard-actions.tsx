"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { requestLinkRenewal } from "./actions"

/* ------------------------------------------------------------------ */
/*  Copy Link Button                                                   */
/* ------------------------------------------------------------------ */

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Referral link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
      {copied ? (
        <>
          <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1 h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  Request Link Renewal Button (admin-controlled)                     */
/* ------------------------------------------------------------------ */

export function RequestLinkRenewalButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition()
  const [requested, setRequested] = useState(false)

  function handleRequest() {
    startTransition(async () => {
      const result = await requestLinkRenewal(token)
      if (result.success) {
        setRequested(true)
        toast.success("Renewal request sent! We'll review and generate a new link for you.")
      } else {
        toast.error(result.error)
      }
    })
  }

  if (requested) {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5">
        <Check className="h-4 w-4 text-green-600" />
        Request Sent
      </Button>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRequest} disabled={pending} className="gap-1.5">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Request New Link
    </Button>
  )
}

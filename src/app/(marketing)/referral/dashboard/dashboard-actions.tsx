"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Check, Link2, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { generateReferralLinkSelfService } from "./actions"

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
/*  Generate / Renew Link Button                                       */
/* ------------------------------------------------------------------ */

export function GenerateReferralLinkButton({
  token,
  hasActiveLink,
}: {
  token: string
  hasActiveLink: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateReferralLinkSelfService(token)
      if (result.success && result.data) {
        setGeneratedUrl(result.data.url)
        toast.success("Referral link generated!")
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleCopy() {
    if (!generatedUrl) return
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (hasActiveLink) return null

  return (
    <>
      <Button size="sm" onClick={handleGenerate} disabled={pending}>
        <Plus className="mr-1 h-4 w-4" />
        {pending ? "Generating..." : "Generate New Link"}
      </Button>

      <Dialog open={!!generatedUrl} onOpenChange={() => setGeneratedUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Referral Link Generated</DialogTitle>
            <DialogDescription>
              Your new referral link is ready. Share it with potential clients to
              start earning commission.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <Link2 className="h-4 w-4 shrink-0 text-primary" />
            <code className="flex-1 truncate text-sm">{generatedUrl}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This link expires in 90 days. You can generate a new one after it
            expires.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

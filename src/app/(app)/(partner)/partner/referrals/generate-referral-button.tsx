"use client"

import { useState, useTransition } from "react"
import { Link2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateReferralLink } from "../actions"

export function GenerateReferralButton() {
  const [pending, startTransition] = useTransition()
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateReferralLink()
      if (result.success && result.data) {
        setGeneratedUrl(result.data.url)
        toast.success("Referral link generated")
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

  return (
    <>
      <Button size="sm" onClick={handleGenerate} disabled={pending}>
        <Link2 className="mr-1 h-4 w-4" />
        {pending ? "Generating..." : "Generate Referral Link"}
      </Button>

      <Dialog open={!!generatedUrl} onOpenChange={() => setGeneratedUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Referral Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with potential clients. When they sign up, you&apos;ll earn commission.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="flex-1 truncate text-sm">{generatedUrl}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This link expires in 90 days. You can generate new links at any time.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

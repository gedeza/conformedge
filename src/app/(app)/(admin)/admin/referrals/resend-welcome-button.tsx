"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { resendPartnerWelcomeEmail } from "../actions"
import { toast } from "sonner"

export function ResendWelcomeButton({ partnerId }: { partnerId: string }) {
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
      className="gap-1"
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

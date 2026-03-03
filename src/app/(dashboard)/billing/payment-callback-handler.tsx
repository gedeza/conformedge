"use client"

import { useEffect, useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { verifyPaymentCallback } from "./actions"

export function PaymentCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ref = searchParams.get("ref")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!ref) return

    startTransition(async () => {
      const res = await verifyPaymentCallback(ref)
      setResult(res)

      // Clean up the URL after verification
      const url = new URL(window.location.href)
      url.searchParams.delete("ref")
      router.replace(url.pathname, { scroll: false })
    })
  }, [ref, router])

  if (!ref && !result) return null

  if (isPending) {
    return (
      <Alert>
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Verifying payment...</AlertTitle>
        <AlertDescription>Please wait while we confirm your payment.</AlertDescription>
      </Alert>
    )
  }

  if (!result) return null

  return (
    <Alert variant={result.success ? "default" : "destructive"}>
      {result.success ? (
        <CheckCircle2 className="size-4 text-green-600" />
      ) : (
        <XCircle className="size-4" />
      )}
      <AlertTitle>{result.success ? "Payment successful" : "Payment issue"}</AlertTitle>
      <AlertDescription>{result.message}</AlertDescription>
    </Alert>
  )
}

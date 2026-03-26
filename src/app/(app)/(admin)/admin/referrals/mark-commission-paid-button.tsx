"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Banknote, Loader2, CheckCircle } from "lucide-react"
import { adminMarkCommissionPaid } from "../actions"
import { formatZar } from "@/lib/billing/plans"
import { toast } from "sonner"

export function MarkCommissionPaidButton({
  referralId,
  amount,
}: {
  referralId: string
  amount: number
}) {
  const [isPending, startTransition] = useTransition()
  const [showInput, setShowInput] = useState(false)
  const [bankRef, setBankRef] = useState("")
  const [paid, setPaid] = useState(false)

  function handlePay() {
    if (!bankRef.trim()) {
      toast.error("Please enter an EFT bank reference")
      return
    }
    startTransition(async () => {
      const result = await adminMarkCommissionPaid(referralId, bankRef.trim())
      if (result.success) {
        setPaid(true)
        toast.success(`Commission ${formatZar(amount)} marked as paid`)
      } else {
        toast.error(result.error || "Failed to mark as paid")
      }
    })
  }

  if (paid) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-700">
        <CheckCircle className="h-3 w-3" /> Paid
      </span>
    )
  }

  if (!showInput) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowInput(true)}
        className="gap-1 text-xs"
      >
        <Banknote className="h-3 w-3" />
        Mark Paid
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="EFT reference"
        value={bankRef}
        onChange={(e) => setBankRef(e.target.value)}
        className="h-7 w-32 text-xs"
        disabled={isPending}
      />
      <Button
        size="sm"
        onClick={handlePay}
        disabled={isPending}
        className="h-7 gap-1 text-xs"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
        Confirm
      </Button>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Coins } from "lucide-react"
import { adminUpdateSubscription, adminAdjustCredits } from "../../actions"

interface Props {
  orgId: string
  currentPlan: string | null
  currentStatus: string | null
  currentBalance: number
}

export function OrgSubscriptionActions({ orgId, currentPlan, currentStatus, currentBalance }: Props) {
  const [pending, startTransition] = useTransition()

  // Subscription
  const [plan, setPlan] = useState<"STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE">(
    (currentPlan as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE") ?? "STARTER"
  )
  const [status, setStatus] = useState<"TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED">(
    (currentStatus as "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED") ?? "TRIALING"
  )

  // Credits
  const [creditAmount, setCreditAmount] = useState("")
  const [creditDesc, setCreditDesc] = useState("")

  function handleUpdateSubscription() {
    startTransition(async () => {
      const result = await adminUpdateSubscription({ orgId, plan, status })
      if (result.success) {
        toast.success("Subscription updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleAdjustCredits() {
    const amount = parseInt(creditAmount, 10)
    if (isNaN(amount) || amount === 0) {
      toast.error("Enter a valid credit amount")
      return
    }
    if (!creditDesc.trim()) {
      toast.error("Enter a description for the adjustment")
      return
    }

    startTransition(async () => {
      const result = await adminAdjustCredits({
        orgId,
        amount,
        description: creditDesc.trim(),
      })
      if (result.success) {
        toast.success(`Credits adjusted by ${amount}`)
        setCreditAmount("")
        setCreditDesc("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Manage Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STARTER">Starter — R2,299/mo</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional — R4,499/mo</SelectItem>
                <SelectItem value="BUSINESS">Business — R8,499/mo</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise — R16,999+/mo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIALING">Trialing</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleUpdateSubscription} disabled={pending} className="w-full">
            {pending ? "Updating..." : "Update Subscription"}
          </Button>
        </CardContent>
      </Card>

      {/* Credit Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="h-4 w-4" />
            Adjust AI Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current balance: <span className="font-bold text-foreground">{currentBalance} credits</span>
          </p>

          <div className="space-y-2">
            <Label>Amount (positive to add, negative to deduct)</Label>
            <Input
              type="number"
              placeholder="e.g. 100 or -50"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              placeholder="e.g. Bonus credits for onboarding"
              value={creditDesc}
              onChange={(e) => setCreditDesc(e.target.value)}
              maxLength={500}
            />
          </div>

          <Button onClick={handleAdjustCredits} disabled={pending} className="w-full">
            {pending ? "Adjusting..." : "Adjust Credits"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

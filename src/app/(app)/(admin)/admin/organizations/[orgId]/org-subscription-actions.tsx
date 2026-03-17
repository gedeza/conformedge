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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Coins, Ban, CheckCircle2, Wallet, FileText } from "lucide-react"
import {
  adminUpdateSubscription,
  adminAdjustCredits,
  adminSuspendOrganization,
  adminFundAccount,
  adminCreateManualInvoice,
} from "../../actions"

interface Props {
  orgId: string
  currentPlan: string | null
  currentStatus: string | null
  currentBalance: number
  currentPaymentMethod: string
  currentPaymentTermsDays: number | null
  accountBalanceCents: number
}

export function OrgSubscriptionActions({
  orgId,
  currentPlan,
  currentStatus,
  currentBalance,
  currentPaymentMethod,
  currentPaymentTermsDays,
  accountBalanceCents,
}: Props) {
  const [pending, startTransition] = useTransition()

  // Subscription
  const [plan, setPlan] = useState<"STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE">(
    (currentPlan as "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE") ?? "STARTER"
  )
  const [status, setStatus] = useState<"TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED">(
    (currentStatus as "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED") ?? "TRIALING"
  )
  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "EFT" | "INVOICE" | "PREPAID">(
    (currentPaymentMethod as "PAYSTACK" | "EFT" | "INVOICE" | "PREPAID") ?? "PAYSTACK"
  )
  const [paymentTermsDays, setPaymentTermsDays] = useState<string>(
    currentPaymentTermsDays?.toString() ?? ""
  )

  const isSuspended = currentStatus === "PAUSED"

  // Credits
  const [creditAmount, setCreditAmount] = useState("")
  const [creditDesc, setCreditDesc] = useState("")

  // Account balance (prepaid)
  const [fundAmount, setFundAmount] = useState("")
  const [fundDesc, setFundDesc] = useState("")

  function handleUpdateSubscription() {
    startTransition(async () => {
      const result = await adminUpdateSubscription({
        orgId,
        plan,
        status,
        paymentMethod,
        paymentTermsDays: paymentMethod === "INVOICE" && paymentTermsDays
          ? parseInt(paymentTermsDays, 10)
          : null,
      })
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

  function handleFundAccount() {
    const amountRands = parseFloat(fundAmount)
    if (isNaN(amountRands) || amountRands === 0) {
      toast.error("Enter a valid amount in Rands")
      return
    }
    if (!fundDesc.trim()) {
      toast.error("Enter a description/reference")
      return
    }

    const amountCents = Math.round(amountRands * 100)

    startTransition(async () => {
      const result = await adminFundAccount(orgId, amountCents, fundDesc.trim())
      if (result.success) {
        toast.success(`Account ${amountCents > 0 ? "funded" : "adjusted"} by R${Math.abs(amountRands).toFixed(2)}`)
        setFundAmount("")
        setFundDesc("")
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleCreateInvoice() {
    startTransition(async () => {
      const result = await adminCreateManualInvoice(orgId)
      if (result.success) {
        toast.success("Invoice created successfully")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
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
                  <SelectItem value="PROFESSIONAL">Professional — R5,499/mo</SelectItem>
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

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYSTACK">Card (Paystack)</SelectItem>
                  <SelectItem value="EFT">EFT / Bank Transfer</SelectItem>
                  <SelectItem value="INVOICE">Invoice (Net Terms)</SelectItem>
                  <SelectItem value="PREPAID">Prepaid Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "INVOICE" && (
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select value={paymentTermsDays} onValueChange={setPaymentTermsDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Net 30 days</SelectItem>
                    <SelectItem value="60">Net 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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

        {/* Suspend / Reactivate */}
        <Card className={isSuspended ? "border-green-200" : "border-red-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {isSuspended ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4 text-red-600" />}
              {isSuspended ? "Reactivate Organization" : "Suspend Organization"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isSuspended
                ? "This organization is currently suspended. Reactivating will restore access and set the subscription to Active."
                : "Suspending will pause the organization\u2019s subscription. Users will lose access to platform features."}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={isSuspended ? "default" : "destructive"}
                  className={isSuspended ? "w-full bg-green-600 hover:bg-green-700" : "w-full"}
                  disabled={pending}
                >
                  {isSuspended ? "Reactivate Organization" : "Suspend Organization"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isSuspended ? "Reactivate this organization?" : "Suspend this organization?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isSuspended
                      ? "The subscription will be set to Active and all users will regain access."
                      : "The subscription will be paused and users will lose access to platform features. You can reactivate at any time."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      startTransition(async () => {
                        const result = await adminSuspendOrganization(orgId, !isSuspended)
                        if (result.success) {
                          toast.success(isSuspended ? "Organization reactivated" : "Organization suspended")
                        } else {
                          toast.error(result.error)
                        }
                      })
                    }}
                    className={isSuspended ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {pending ? "Processing..." : isSuspended ? "Confirm Reactivate" : "Confirm Suspend"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Second row: Account Balance + Manual Invoice */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Balance (Prepaid) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              Account Balance (Prepaid)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current balance:{" "}
              <span className="font-bold text-foreground">
                R{(accountBalanceCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </span>
            </p>

            <div className="space-y-2">
              <Label>Amount in Rands (positive to fund, negative to deduct)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 5000 or -1000"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description / Reference</Label>
              <Input
                placeholder="e.g. EFT payment received - ref ABC123"
                value={fundDesc}
                onChange={(e) => setFundDesc(e.target.value)}
                maxLength={500}
              />
            </div>

            <Button onClick={handleFundAccount} disabled={pending} className="w-full">
              {pending ? "Processing..." : "Fund / Adjust Account"}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Invoice Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Generate Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a manual invoice for the current billing period. Useful for EFT and Invoice payment method organizations.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={pending} className="w-full">
                  {pending ? "Creating..." : "Create Manual Invoice"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will generate an OPEN invoice for the current billing period based on the organization&apos;s plan. The invoice will be available for download as a PDF.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateInvoice}>
                    {pending ? "Creating..." : "Create Invoice"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
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
import { CheckCircle2, Loader2 } from "lucide-react"
import { registerReferralPartner, type RegisterReferralInput } from "./actions"

const schema = z.object({
  fullName: z.string().min(2, "Full name is required").max(200),
  email: z.email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required").max(20),
  company: z.string().max(200).optional(),
  idNumber: z.string().max(20).optional(),
  bankName: z.string().min(2, "Bank name is required").max(100),
  accountHolder: z.string().min(2, "Account holder name is required").max(200),
  accountNumber: z.string().min(5, "Account number is required").max(30),
  branchCode: z.string().min(3, "Branch code is required").max(10),
  accountType: z.enum(["CHEQUE", "SAVINGS"]),
})

export function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterReferralInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountType: "CHEQUE",
    },
  })

  function onSubmit(data: RegisterReferralInput) {
    setError(null)
    startTransition(async () => {
      const result = await registerReferralPartner(data)
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || "Something went wrong")
      }
    })
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Registration Received
        </h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Thank you for registering as a ConformEdge Referral Partner. We'll review your application
          and send you your unique referral link within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Details */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Personal Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="e.g. Nhlanhla Mnyandu"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. you@company.co.za"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="e.g. 082 123 4567"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company Name (optional)</Label>
            <Input
              id="company"
              placeholder="e.g. Your Company (Pty) Ltd"
              {...register("company")}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="idNumber">ID Number (optional)</Label>
            <Input
              id="idNumber"
              placeholder="For commission verification"
              {...register("idNumber")}
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          Bank Details
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          For monthly commission payments via EFT. Your details are stored securely.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              placeholder="e.g. FNB, Standard Bank, Capitec"
              {...register("bankName")}
            />
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name *</Label>
            <Input
              id="accountHolder"
              placeholder="Name as it appears on the account"
              {...register("accountHolder")}
            />
            {errors.accountHolder && (
              <p className="text-sm text-red-500">
                {errors.accountHolder.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              placeholder="e.g. 62012345678"
              {...register("accountNumber")}
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-500">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchCode">Branch Code *</Label>
            <Input
              id="branchCode"
              placeholder="e.g. 250655"
              {...register("branchCode")}
            />
            {errors.branchCode && (
              <p className="text-sm text-red-500">
                {errors.branchCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type *</Label>
            <Select
              defaultValue="CHEQUE"
              onValueChange={(val) =>
                setValue("accountType", val as "CHEQUE" | "SAVINGS")
              }
            >
              <SelectTrigger id="accountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHEQUE">Cheque / Current</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-500">
                {errors.accountType.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 space-y-1">
        <p className="font-medium text-slate-900">By registering, you agree to the following:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>10% commission on referred clients' payments for their first 12 months</li>
          <li>Commission is based on what the client actually pays (annual billing = 10 months)</li>
          <li>Commission paid monthly via EFT to the bank account provided</li>
          <li>Referral links are valid for 90 days per lead</li>
          <li>No sign-up fee, no monthly fee, cancel anytime</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registering...
          </>
        ) : (
          "Register as Referral Partner"
        )}
      </Button>
    </form>
  )
}

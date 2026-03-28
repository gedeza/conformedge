"use client"

import { useState, useTransition } from "react"
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
import { User, Building2, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePartnerProfile, updatePartnerBankDetails } from "./actions"

/* ------------------------------------------------------------------ */
/*  Profile Form                                                       */
/* ------------------------------------------------------------------ */

function ProfileForm({
  token,
  initial,
}: {
  token: string
  initial: { name: string; contactEmail: string; contactPhone: string }
}) {
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState(initial)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updatePartnerProfile(token, values)
      if (result.success) {
        toast.success("Profile updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name / Company</Label>
          <Input
            id="profile-name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={values.contactEmail}
            onChange={(e) =>
              setValues({ ...values, contactEmail: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            value={values.contactPhone}
            onChange={(e) =>
              setValues({ ...values, contactPhone: e.target.value })
            }
            required
          />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-1 h-4 w-4" />
        )}
        Save Profile
      </Button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Bank Details Form                                                  */
/* ------------------------------------------------------------------ */

function BankForm({
  token,
  initial,
}: {
  token: string
  initial: {
    bankName: string
    bankAccountHolder: string
    bankAccountNumber: string
    bankBranchCode: string
    bankAccountType: string
  }
}) {
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState(initial)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updatePartnerBankDetails(token, {
        ...values,
        bankAccountType: values.bankAccountType as "CHEQUE" | "SAVINGS",
      })
      if (result.success) {
        toast.success("Bank details updated")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank-name">Bank Name</Label>
          <Input
            id="bank-name"
            value={values.bankName}
            onChange={(e) =>
              setValues({ ...values, bankName: e.target.value })
            }
            placeholder="e.g. FNB, Standard Bank, Capitec"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank-holder">Account Holder</Label>
          <Input
            id="bank-holder"
            value={values.bankAccountHolder}
            onChange={(e) =>
              setValues({ ...values, bankAccountHolder: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank-number">Account Number</Label>
          <Input
            id="bank-number"
            value={values.bankAccountNumber}
            onChange={(e) =>
              setValues({ ...values, bankAccountNumber: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank-branch">Branch Code</Label>
          <Input
            id="bank-branch"
            value={values.bankBranchCode}
            onChange={(e) =>
              setValues({ ...values, bankBranchCode: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank-type">Account Type</Label>
          <Select
            value={values.bankAccountType}
            onValueChange={(v) =>
              setValues({ ...values, bankAccountType: v })
            }
          >
            <SelectTrigger id="bank-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHEQUE">Cheque / Current</SelectItem>
              <SelectItem value="SAVINGS">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-1 h-4 w-4" />
        )}
        Save Bank Details
      </Button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Partner Settings Section                                           */
/* ------------------------------------------------------------------ */

export function PartnerSettings({
  token,
  partner,
}: {
  token: string
  partner: {
    name: string
    contactEmail: string
    contactPhone: string | null
    bankName: string | null
    bankAccountHolder: string | null
    bankAccountNumber: string | null
    bankBranchCode: string | null
    bankAccountType: string | null
  }
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your name, email, and phone number.
          </p>
        </CardHeader>
        <CardContent>
          <ProfileForm
            token={token}
            initial={{
              name: partner.name,
              contactEmail: partner.contactEmail,
              contactPhone: partner.contactPhone || "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Bank Details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Commission payouts are sent to this bank account via EFT on the last
            business day of each month.
          </p>
        </CardHeader>
        <CardContent>
          <BankForm
            token={token}
            initial={{
              bankName: partner.bankName || "",
              bankAccountHolder: partner.bankAccountHolder || "",
              bankAccountNumber: partner.bankAccountNumber || "",
              bankBranchCode: partner.bankBranchCode || "",
              bankAccountType: partner.bankAccountType || "CHEQUE",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

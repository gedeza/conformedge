"use client"

import { Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EftBankDetailsCard() {
  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-blue-600" />
          Bank Transfer Details
        </CardTitle>
        <CardDescription>
          Use the details below to make an EFT payment. Include the invoice reference as your payment reference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Bank</p>
            <p className="font-medium">First National Bank (FNB)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account Name</p>
            <p className="font-medium">ISU Technologies (Pty) Ltd</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account Number</p>
            <p className="font-medium font-mono">Contact admin for details</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Branch Code</p>
            <p className="font-medium font-mono">250655</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          After making your payment, your admin will verify and mark your invoice as paid. Download your invoice below for the payment reference.
        </p>
      </CardContent>
    </Card>
  )
}

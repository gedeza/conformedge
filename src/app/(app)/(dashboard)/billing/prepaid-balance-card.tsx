"use client"

import { Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ACCOUNT_TRANSACTION_TYPES } from "@/lib/constants"

interface PrepaidBalanceCardProps {
  balanceCents: number
  transactions: Array<{
    id: string
    type: string
    amountCents: number
    balanceAfterCents: number
    description: string
    createdAt: Date
  }>
}

function formatZar(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function PrepaidBalanceCard({ balanceCents, transactions }: PrepaidBalanceCardProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-amber-600" />
          Prepaid Account Balance
        </CardTitle>
        <CardDescription>
          Your account is funded in advance. Subscription fees are automatically deducted each billing period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-3xl font-bold">{formatZar(balanceCents)}</p>
          {balanceCents < 0 && (
            <p className="mt-1 text-sm text-destructive">
              Your account has a negative balance. Contact your administrator to fund your account.
            </p>
          )}
        </div>

        {transactions.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.map((tx) => {
                const typeInfo = ACCOUNT_TRANSACTION_TYPES[tx.type as keyof typeof ACCOUNT_TRANSACTION_TYPES]
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded border bg-background p-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeInfo?.color ?? ""}>
                        {typeInfo?.label ?? tx.type}
                      </Badge>
                      <span className="text-muted-foreground">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className={tx.amountCents >= 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                        {tx.amountCents >= 0 ? "+" : ""}{formatZar(tx.amountCents)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          To fund your account, contact your ConformEdge administrator.
        </p>
      </CardContent>
    </Card>
  )
}

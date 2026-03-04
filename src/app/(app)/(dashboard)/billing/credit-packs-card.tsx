"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Coins, History, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CREDIT_PACKS, formatZar } from "@/lib/billing/plans"
import { CREDIT_TRANSACTION_TYPES } from "@/lib/constants"
import { initiateCreditPurchase } from "./actions"
import type { BillingContext } from "@/types"

interface CreditPacksCardProps {
  billing: BillingContext
  paystackEnabled: boolean
  transactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: Date
  }>
}

export function CreditPacksCard({ billing, paystackEnabled, transactions }: CreditPacksCardProps) {
  const router = useRouter()
  const [loadingPack, setLoadingPack] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleBuy(packId: string) {
    setLoadingPack(packId)
    startTransition(async () => {
      try {
        const result = await initiateCreditPurchase(packId)
        if ("authorizationUrl" in result) {
          router.push(result.authorizationUrl)
        } else {
          alert(result.error)
        }
      } finally {
        setLoadingPack(null)
      }
    })
  }

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">AI Credits</CardTitle>
            <CardDescription>Purchase additional AI classification credits</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="size-5 text-amber-500" />
            <span className="text-2xl font-bold">{billing.creditBalance}</span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Packs */}
        <div className="grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => {
            const isLoading = loadingPack === pack.id && isPending

            return (
              <div
                key={pack.id}
                className="flex flex-col items-center rounded-lg border p-4 text-center"
              >
                <span className="text-2xl font-bold">{pack.credits}</span>
                <span className="text-xs text-muted-foreground">credits</span>
                <span className="mt-2 text-lg font-semibold">{formatZar(pack.priceZar)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatZar(pack.perCreditZar)}/credit
                </span>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  disabled={!paystackEnabled || isLoading}
                  onClick={() => handleBuy(pack.id)}
                >
                  {isLoading ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                  Buy
                </Button>
              </div>
            )
          })}
        </div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <History className="size-4" />
              Recent Transactions
            </div>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx) => {
                const typeInfo =
                  CREDIT_TRANSACTION_TYPES[tx.type as keyof typeof CREDIT_TRANSACTION_TYPES]

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeInfo?.color ?? ""}>
                        {typeInfo?.label ?? tx.type}
                      </Badge>
                      <span className="text-muted-foreground">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span
                        className={
                          tx.amount > 0
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                        }
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </span>
                      <span className="w-12 text-xs text-muted-foreground">
                        bal: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!paystackEnabled && (
          <p className="text-center text-xs text-muted-foreground">
            Credit purchases will be available once payment integration is configured.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

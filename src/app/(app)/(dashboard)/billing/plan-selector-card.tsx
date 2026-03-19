"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_DEFINITIONS, formatZar } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"
import { initiatePlanCheckout } from "./actions"
import type { BillingContext, PlanTier } from "@/types"

interface PlanSelectorCardProps {
  billing: BillingContext
  paystackEnabled: boolean
}

const TIER_ORDER: PlanTier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]

export function PlanSelectorCard({ billing, paystackEnabled }: PlanSelectorCardProps) {
  const currentTier = billing.subscription.plan
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleUpgrade(tier: PlanTier) {
    setLoadingTier(tier)
    startTransition(async () => {
      try {
        const result = await initiatePlanCheckout(tier, billing.subscription.billingCycle)
        if ("authorizationUrl" in result) {
          router.push(result.authorizationUrl)
        } else {
          alert(result.error)
        }
      } finally {
        setLoadingTier(null)
      }
    })
  }

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Plans</CardTitle>
        <CardDescription>Compare plans and upgrade when ready</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((tier) => {
            const plan = PLAN_DEFINITIONS[tier]
            const isCurrent = tier === currentTier
            const isHigher = TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier)
            const isLoading = loadingTier === tier && isPending

            return (
              <div
                key={tier}
                className={cn(
                  "relative rounded-lg border p-4",
                  isCurrent && "border-primary ring-1 ring-primary",
                  tier === "PROFESSIONAL" && !isCurrent && "border-blue-200 dark:border-blue-800"
                )}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2.5 left-3 text-xs">Current</Badge>
                )}
                {tier === "PROFESSIONAL" && !isCurrent && (
                  <Badge variant="secondary" className="absolute -top-2.5 left-3 text-xs">
                    Popular
                  </Badge>
                )}

                <h3 className="mt-1 font-semibold">{plan.name}</h3>
                <div className="mt-2">
                  {plan.monthlyPriceZar !== null ? (
                    <>
                      <span className="text-2xl font-bold">{formatZar(plan.monthlyPriceZar)}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Custom</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>

                <ul className="mt-4 space-y-1.5 text-xs">
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3 text-primary" />
                    {plan.limits.maxUsers} users included
                    {plan.limits.additionalUserFeeZar && (
                      <span className="text-muted-foreground">(+R{(plan.limits.additionalUserFeeZar / 100).toFixed(0)}/user)</span>
                    )}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3 text-primary" />
                    {plan.limits.maxStandards === null ? "Unlimited" : plan.limits.maxStandards} standards
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3 text-primary" />
                    {plan.limits.maxDocuments === null ? "Unlimited" : plan.limits.maxDocuments.toLocaleString()} documents
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3 text-primary" />
                    {plan.limits.aiClassificationsPerMonth === null
                      ? "Unlimited"
                      : plan.limits.aiClassificationsPerMonth}{" "}
                    AI/mo
                  </li>
                </ul>

                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : tier === "ENTERPRISE" ? (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href="mailto:sales@conformedge.co.za">Contact Sales</a>
                    </Button>
                  ) : isHigher ? (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!paystackEnabled || isLoading}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {isLoading ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                      Upgrade
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!paystackEnabled || isLoading}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {isLoading ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                      Downgrade
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {!paystackEnabled && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Plan changes will be available once payment integration is configured.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

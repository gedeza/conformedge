"use client"

import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_DEFINITIONS, formatZar, getMonthlyPriceZar } from "@/lib/billing/plans"
import { SUBSCRIPTION_STATUSES, PLAN_TIERS } from "@/lib/constants"
import type { BillingContext } from "@/types"

interface CurrentPlanCardProps {
  billing: BillingContext
}

export function CurrentPlanCard({ billing }: CurrentPlanCardProps) {
  const plan = PLAN_DEFINITIONS[billing.subscription.plan]
  const statusInfo = SUBSCRIPTION_STATUSES[billing.subscription.status]
  const tierInfo = PLAN_TIERS[billing.subscription.plan]
  const monthlyPrice = getMonthlyPriceZar(billing.subscription.plan, billing.subscription.billingCycle)

  const trialDaysRemaining = billing.subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(billing.subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const graceDaysRemaining = billing.subscription.gracePeriodEndsAt
    ? Math.max(0, Math.ceil((new Date(billing.subscription.gracePeriodEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={tierInfo.color}>
              {plan.name}
            </Badge>
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Price</p>
            <p className="text-2xl font-bold">
              {monthlyPrice !== null ? formatZar(monthlyPrice) : "Custom"}
            </p>
            {billing.subscription.billingCycle === "ANNUAL" && (
              <p className="text-xs text-muted-foreground">Billed annually (~17% off)</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billing Cycle</p>
            <p className="text-2xl font-bold capitalize">
              {billing.subscription.billingCycle.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">AI Credits</p>
            <p className="text-2xl font-bold">{billing.creditBalance}</p>
            <p className="text-xs text-muted-foreground">Purchased credits available</p>
          </div>
          {trialDaysRemaining !== null && billing.subscription.status === "TRIALING" && (
            <div>
              <p className="text-sm text-muted-foreground">Trial Remaining</p>
              <p className="text-2xl font-bold">{trialDaysRemaining} days</p>
              <p className="text-xs text-muted-foreground">
                Expires {new Date(billing.subscription.trialEndsAt!).toLocaleDateString("en-ZA")}
              </p>
            </div>
          )}
          {graceDaysRemaining !== null && billing.subscription.status === "PAST_DUE" && (
            <div>
              <p className="text-sm text-muted-foreground">Grace Period</p>
              <p className="text-2xl font-bold text-destructive">{graceDaysRemaining} days</p>
              <p className="text-xs text-muted-foreground">
                Cancels {new Date(billing.subscription.gracePeriodEndsAt!).toLocaleDateString("en-ZA")}
              </p>
            </div>
          )}
        </div>

        {billing.subscription.status === "PAST_DUE" && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Your last payment failed. Update your payment method within{" "}
              {graceDaysRemaining ?? 0} day{graceDaysRemaining !== 1 ? "s" : ""} to avoid
              cancellation. All features are restricted until payment is resolved.
            </span>
          </div>
        )}

        {billing.subscription.cancelAtPeriodEnd && billing.subscription.status !== "PAST_DUE" && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            Your subscription will be cancelled at the end of the current billing period.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

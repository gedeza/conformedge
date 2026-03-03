import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UsageBar } from "@/components/billing/usage-bar"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext } from "@/lib/billing/get-billing-context"
import { PLAN_DEFINITIONS } from "@/lib/billing/plans"
import { PLAN_TIERS, SUBSCRIPTION_STATUSES } from "@/lib/constants"
import type { PlanTier, SubscriptionStatus } from "@/types"

export async function SubscriptionWidget() {
  const { dbOrgId } = await getAuthContext()
  const billing = await getBillingContext(dbOrgId)

  const plan = billing.subscription.plan
  const status = billing.subscription.status
  const planDef = PLAN_DEFINITIONS[plan]
  const aiLimit = planDef.limits.aiClassificationsPerMonth
  const tierStyle = PLAN_TIERS[plan as keyof typeof PLAN_TIERS]
  const statusStyle = SUBSCRIPTION_STATUSES[status as keyof typeof SUBSCRIPTION_STATUSES]

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10">
          <CreditCard className="size-4 text-purple-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{planDef.name}</span>
          {tierStyle && (
            <Badge variant="secondary" className={tierStyle.color}>
              {tierStyle.label}
            </Badge>
          )}
          {statusStyle && (
            <Badge variant="outline" className={statusStyle.color}>
              {statusStyle.label}
            </Badge>
          )}
        </div>

        <UsageBar
          label="AI Credits"
          current={billing.usage.aiClassificationsUsed}
          limit={aiLimit}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {format(billing.subscription.currentPeriodStart, "MMM d")}
            {" — "}
            {format(billing.subscription.currentPeriodEnd, "MMM d, yyyy")}
          </span>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Manage Billing <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

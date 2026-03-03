"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsageBar } from "@/components/billing/usage-bar"
import { PLAN_DEFINITIONS } from "@/lib/billing/plans"
import type { BillingContext } from "@/types"

interface UsageCardProps {
  billing: BillingContext
}

export function UsageCard({ billing }: UsageCardProps) {
  const plan = PLAN_DEFINITIONS[billing.subscription.plan]

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Usage</CardTitle>
        <CardDescription>Current billing period resource usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <UsageBar
          label="AI Classifications"
          current={billing.usage.aiClassificationsUsed}
          limit={plan.limits.aiClassificationsPerMonth}
          unit="/mo"
        />
        <UsageBar
          label="Documents"
          current={billing.usage.documentsCount}
          limit={plan.limits.maxDocuments}
        />
        <UsageBar
          label="Users"
          current={billing.usage.usersCount}
          limit={plan.limits.maxUsers}
        />
        <UsageBar
          label="Active Standards"
          current={billing.usage.standardsCount}
          limit={plan.limits.maxStandards}
        />
      </CardContent>
    </Card>
  )
}

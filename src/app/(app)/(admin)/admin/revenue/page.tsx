import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import {
  DollarSign,
  TrendingUp,
  Handshake,
  TrendingDown,
} from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminRevenue } from "../actions"
import { redirect } from "next/navigation"
import { RevenueChart } from "./revenue-chart"
import { RevenueHelpPanel } from "./revenue-help-panel"
import { formatZar } from "@/lib/billing/plans"

export default async function AdminRevenuePage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const data = await getAdminRevenue()
  if (!data) redirect("/dashboard")

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Revenue"
        description="Platform revenue metrics and trends"
      >
        <RevenueHelpPanel />
      </PageHeader>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Monthly Recurring
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatZar(data.mrrCents)}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.totalActive} active subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Annual Run Rate
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatZar(data.arrCents)}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.totalTrialing} trialing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Handshake className="h-4 w-4" />
              Partner Revenue
            </div>
            <p className="mt-1 text-2xl font-bold">
              {formatZar(data.partnerMrrCents)}
            </p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Churn Rate
            </div>
            <p className="mt-1 text-2xl font-bold">{data.churnRate}%</p>
            <p className="text-xs text-muted-foreground">
              {data.cancelledCount} cancelled (30d)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={data.monthlyRevenue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.planDistribution.map((p) => (
              <div
                key={p.plan}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{p.plan}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {p.count} subscription{p.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="font-medium">{formatZar(p.revenue)}/mo</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

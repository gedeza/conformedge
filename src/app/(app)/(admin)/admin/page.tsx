import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import {
  Building2,
  Users,
  CreditCard,
  Handshake,
  FileText,
  AlertTriangle,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminOverview } from "./actions"
import { redirect } from "next/navigation"
import { formatZar } from "@/lib/billing/plans"

export default async function AdminOverviewPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const data = await getAdminOverview()
  if (!data) redirect("/dashboard")

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Platform Admin"
        description={`Welcome back, ${ctx.firstName}. Here's your platform overview.`}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Building2}
          label="Organizations"
          value={data.totalOrgs.toString()}
          sub={`+${data.recentOrgs} last 30 days`}
        />
        <MetricCard
          icon={Users}
          label="Users"
          value={data.totalUsers.toString()}
          sub={`+${data.recentUsers} last 30 days`}
        />
        <MetricCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={data.activeSubscriptions.toString()}
          sub={`${data.trialSubscriptions} trialing`}
        />
        <MetricCard
          icon={Handshake}
          label="Active Partners"
          value={data.totalPartners.toString()}
          sub="Managing client orgs"
        />
      </div>

      {/* Revenue */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={DollarSign}
          label="Direct MRR"
          value={formatZar(data.mrrCents)}
          sub="From direct subscriptions"
          highlight
        />
        <MetricCard
          icon={TrendingUp}
          label="Partner Revenue (30d)"
          value={formatZar(data.partnerMrrCents)}
          sub="From partner invoices"
          highlight
        />
        <MetricCard
          icon={DollarSign}
          label="Total MRR"
          value={formatZar(data.mrrCents + data.partnerMrrCents)}
          sub="Combined revenue"
          highlight
        />
      </div>

      {/* Plan Distribution + Platform Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.subscriptionsByPlan.length > 0 ? (
                data.subscriptionsByPlan.map((item) => (
                  <div key={item.plan} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.plan}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.max(20, (item.count / Math.max(data.totalOrgs, 1)) * 200)}px`,
                        }}
                      />
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active subscriptions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ActivityRow icon={FileText} label="Total Documents" value={data.totalDocuments} />
              <ActivityRow icon={AlertTriangle} label="Total CAPAs" value={data.totalCapas} />
              <ActivityRow icon={AlertTriangle} label="Total Incidents" value={data.totalIncidents} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-primary" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-bold">{value.toLocaleString()}</span>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import {
  Building2,
  FileText,
  AlertTriangle,
  Siren,
  Users,
  TrendingUp,
} from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getClientOrgsSummary } from "./actions"
import { redirect } from "next/navigation"
import { PARTNER_CLIENT_SIZES } from "@/lib/constants"
import Link from "next/link"

export default async function PartnerDashboardPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const data = await getClientOrgsSummary()
  if (!data) redirect("/dashboard")

  const { clientOrgs, alerts } = data
  const totalUsers = clientOrgs.reduce(
    (sum, co) => sum + co.organization._count.members, 0
  )
  const totalDocuments = clientOrgs.reduce(
    (sum, co) => sum + co.organization._count.documents, 0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        heading={`Welcome, ${ctx.partnerName}`}
        description="Partner Console — manage your client organizations"
      />

      {/* Alert Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Client Organizations"
          value={clientOrgs.length}
          icon={Building2}
          color="text-blue-600"
        />
        <MetricCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="text-emerald-600"
        />
        <MetricCard
          title="Total Documents"
          value={totalDocuments}
          icon={FileText}
          color="text-purple-600"
        />
        <MetricCard
          title="Compliance Health"
          value={alerts.overdueCapas === 0 && alerts.openIncidents === 0 ? "Good" : "Needs Attention"}
          icon={TrendingUp}
          color={alerts.overdueCapas === 0 && alerts.openIncidents === 0 ? "text-green-600" : "text-orange-600"}
        />
      </div>

      {/* Alerts Banner */}
      {(alerts.expiringDocs > 0 || alerts.overdueCapas > 0 || alerts.openIncidents > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {alerts.expiringDocs > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    {alerts.expiringDocs} document{alerts.expiringDocs !== 1 ? "s" : ""} expiring within 30 days
                  </span>
                </div>
              )}
              {alerts.overdueCapas > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    {alerts.overdueCapas} overdue CAPA{alerts.overdueCapas !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {alerts.openIncidents > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Siren className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">
                    {alerts.openIncidents} open incident{alerts.openIncidents !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Organization Cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Client Organizations</h2>
          <Link
            href="/partner/clients"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientOrgs.map((co) => {
            const org = co.organization
            const sizeLabel = PARTNER_CLIENT_SIZES[co.clientSize as keyof typeof PARTNER_CLIENT_SIZES]?.label ?? co.clientSize
            return (
              <Link key={co.id} href={`/partner/clients/${org.id}`}>
                <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {sizeLabel}
                      </Badge>
                    </div>
                    {org.industry && (
                      <p className="text-xs text-muted-foreground">{org.industry}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <StatItem label="Users" value={org._count.members} />
                      <StatItem label="Docs" value={org._count.documents} />
                      <StatItem label="CAPAs" value={org._count.capas} />
                      <StatItem label="Incidents" value={org._count.incidents} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          {clientOrgs.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No client organizations yet.</p>
                <Link href="/partner/clients" className="text-sm text-primary hover:underline">
                  Add your first client
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg bg-muted p-2 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

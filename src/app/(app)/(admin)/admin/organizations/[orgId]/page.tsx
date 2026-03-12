import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import {
  Building2, Users, FileText, AlertTriangle, CreditCard,
  ClipboardCheck, Truck, Shield, Target, HardHat, FolderOpen,
} from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminOrgDetail } from "../../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { OrgSubscriptionActions } from "./org-subscription-actions"

interface Props {
  params: Promise<{ orgId: string }>
}

export default async function AdminOrgDetailPage({ params }: Props) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { orgId } = await params
  const org = await getAdminOrgDetail(orgId)
  if (!org) redirect("/admin/organizations")

  const partner = org.partnerOrganizations[0]?.partner

  return (
    <div className="space-y-6">
      <PageHeader
        heading={org.name}
        description={`Organization detail — ${org.slug}`}
      />

      {/* Subscription + Credits */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {org.subscription ? (
              <>
                <Row label="Plan" value={org.subscription.plan} />
                <Row label="Status" value={org.subscription.status} />
                <Row label="Billing Cycle" value={org.subscription.billingCycle} />
                {org.subscription.trialEndsAt && (
                  <Row label="Trial Ends" value={format(org.subscription.trialEndsAt, "dd MMM yyyy")} />
                )}
                <Row
                  label="Current Period"
                  value={`${format(org.subscription.currentPeriodStart, "dd MMM")} — ${format(org.subscription.currentPeriodEnd, "dd MMM yyyy")}`}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No subscription</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              AI Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {org.creditBalance ? (
              <>
                <Row label="Balance" value={`${org.creditBalance.balance} credits`} />
                <Row label="Lifetime Earned" value={`${org.creditBalance.lifetimeEarned}`} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No credit balance</p>
            )}
          </CardContent>
        </Card>

        {partner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Partner" value={partner.name} />
              <Row label="Tier" value={partner.tier} />
              <Row label="Status" value={partner.status} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Metrics */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <CountCard icon={FolderOpen} label="Projects" value={org._count.projects} />
        <CountCard icon={FileText} label="Documents" value={org._count.documents} />
        <CountCard icon={ClipboardCheck} label="Assessments" value={org._count.assessments} />
        <CountCard icon={AlertTriangle} label="CAPAs" value={org._count.capas} />
        <CountCard icon={ClipboardCheck} label="Checklists" value={org._count.checklists} />
        <CountCard icon={Truck} label="Subcontractors" value={org._count.subcontractors} />
        <CountCard icon={AlertTriangle} label="Incidents" value={org._count.incidents} />
        <CountCard icon={Target} label="Objectives" value={org._count.objectives} />
        <CountCard icon={HardHat} label="Work Permits" value={org._count.workPermits} />
        <CountCard icon={Users} label="Active Members" value={org.members.length} />
      </div>

      {/* Admin Actions */}
      <OrgSubscriptionActions
        orgId={org.id}
        currentPlan={org.subscription?.plan ?? null}
        currentStatus={org.subscription?.status ?? null}
        currentBalance={org.creditBalance?.balance ?? 0}
      />

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members ({org.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {org.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {m.user.firstName} {m.user.lastName}
                    {m.user.isSuperAdmin && (
                      <Badge className="ml-2 bg-red-100 text-red-800">Super Admin</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{m.role}</Badge>
                  {m.user.lastLoginAt && (
                    <span className="text-xs text-muted-foreground">
                      Last login: {format(m.user.lastLoginAt, "dd MMM yyyy")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Records */}
      {org.usageRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Usage Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.usageRecords.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded border p-3 text-sm">
                  <span>
                    {format(u.periodStart, "dd MMM")} — {format(u.periodEnd, "dd MMM yyyy")}
                  </span>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>AI: {u.aiClassificationsUsed}</span>
                    <span>Docs: {u.documentsCount}</span>
                    <span>Users: {u.usersCount}</span>
                    <span>Standards: {u.standardsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      {org.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {org.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded border p-3 text-sm">
                  <span className="font-medium">
                    {format(inv.periodStart, "dd MMM")} — {format(inv.periodEnd, "dd MMM yyyy")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{formatZar(inv.totalCents)}</span>
                    <Badge variant="outline">{inv.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(inv.createdAt, "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function CountCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Building2, Users, Link2, Phone, Mail } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminPartners } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { PARTNER_TIERS, PARTNER_STATUSES } from "@/lib/constants"
import { PartnersHelpPanel } from "./partners-help-panel"
import { ApproveButton, RejectButton } from "./partner-actions"

export default async function AdminPartnersPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const partners = await getAdminPartners()

  const pendingCount = partners.filter((p) => p.status === "APPLIED").length

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Partners"
        description={`${partners.length} partner organizations${pendingCount > 0 ? ` (${pendingCount} pending approval)` : ""}`}
      >
        <PartnersHelpPanel />
      </PageHeader>

      {/* Pending Applications */}
      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base text-amber-800">
              Pending Applications ({pendingCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners
                .filter((p) => p.status === "APPLIED")
                .map((p) => {
                  const tierConfig = PARTNER_TIERS[p.tier as keyof typeof PARTNER_TIERS]

                  return (
                    <div key={p.id} className="rounded-lg border border-amber-200 bg-white p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            {tierConfig && <Badge className={tierConfig.color}>{tierConfig.label}</Badge>}
                            <Badge variant="outline" className="text-amber-700 border-amber-300">
                              Pending
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {p.contactEmail}
                            </span>
                            {p.contactPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {p.contactPhone}
                              </span>
                            )}
                            <span>Applied {format(p.createdAt, "dd MMM yyyy")}</span>
                          </div>
                          {p.description && (
                            <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
                          )}
                          {p.notes && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View bank details
                              </summary>
                              <pre className="mt-1 text-xs text-muted-foreground bg-slate-50 p-2 rounded whitespace-pre-wrap">
                                {p.notes}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <ApproveButton partnerId={p.id} />
                          <RejectButton partnerId={p.id} />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partners.map((p) => {
                const tierConfig = PARTNER_TIERS[p.tier as keyof typeof PARTNER_TIERS]
                const statusConfig = PARTNER_STATUSES[p.status as keyof typeof PARTNER_STATUSES]
                const activeReferral = p.referrals[0]
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"

                return (
                  <div key={p.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          {tierConfig && <Badge className={tierConfig.color}>{tierConfig.label}</Badge>}
                          {statusConfig && <Badge className={statusConfig.color}>{statusConfig.label}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.contactEmail}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {p.approvedAt && <p>Approved {format(p.approvedAt, "dd MMM yyyy")}</p>}
                        {!p.approvedAt && <p>Joined {format(p.createdAt, "dd MMM yyyy")}</p>}
                        {p.basePlatformFeeCents > 0 && (
                          <p>Platform fee: {formatZar(p.basePlatformFeeCents)}/mo</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {p._count.clientOrganizations} clients
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {p._count.partnerUsers} team members
                      </span>
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {p._count.referrals} referrals
                      </span>
                      <span>
                        Commission: {p.commissionPercent}%
                      </span>
                    </div>

                    {activeReferral && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Referral link: </span>
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {appUrl}/ref/{activeReferral.code}
                        </code>
                      </div>
                    )}
                  </div>
                )
              })}

            {partners.length === 0 && (
              <p className="text-sm text-muted-foreground">No partners yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

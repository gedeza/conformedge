import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Building2, Users, Link2 } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminPartners } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { PARTNER_TIERS, PARTNER_STATUSES } from "@/lib/constants"
import { PartnersHelpPanel } from "./partners-help-panel"

export default async function AdminPartnersPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const partners = await getAdminPartners()

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Partners"
        description={`${partners.length} partner organizations`}
      >
        <PartnersHelpPanel />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partners.map((p) => {
              const tierConfig = PARTNER_TIERS[p.tier as keyof typeof PARTNER_TIERS]
              const statusConfig = PARTNER_STATUSES[p.status as keyof typeof PARTNER_STATUSES]

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
                      <p>Joined {format(p.createdAt, "dd MMM yyyy")}</p>
                      <p>Platform fee: {formatZar(p.basePlatformFeeCents)}/mo</p>
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

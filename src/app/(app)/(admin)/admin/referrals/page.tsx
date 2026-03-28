import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Users, TrendingUp, Banknote, Clock, Link2, Mail, Phone } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminReferrals } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { PARTNER_STATUSES } from "@/lib/constants"
import { MarkCommissionPaidButton } from "./mark-commission-paid-button"
import { RenewLinkButton } from "./renew-link-button"
import { ResendWelcomeButton } from "./resend-welcome-button"

const REFERRAL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-800" },
  CLICKED: { label: "Clicked", color: "bg-blue-100 text-blue-800" },
  SIGNED_UP: { label: "Signed Up", color: "bg-amber-100 text-amber-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
}

export default async function AdminReferralsPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { partners, totals } = await getAdminReferrals()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Referral Management"
        description={`${partners.length} referral partners, ${totals.totalReferrals} referral links`}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard icon={Users} label="Referral Partners" value={partners.length.toString()} sub={`${partners.filter(p => p.status === "APPLIED").length} pending`} />
        <SummaryCard icon={Link2} label="Total Referrals" value={totals.totalReferrals.toString()} sub="All time" />
        <SummaryCard icon={TrendingUp} label="Conversions" value={totals.conversions.toString()} sub="Paid clients" />
        <SummaryCard icon={Banknote} label="Commission Owed" value={formatZar(totals.unpaidCommissionCents)} sub="Unpaid" highlight />
        <SummaryCard icon={Clock} label="Commission Paid" value={formatZar(totals.paidCommissionCents)} sub="Via EFT" />
      </div>

      {/* Per-Partner Breakdown */}
      {partners.map((partner) => {
        const statusConfig = PARTNER_STATUSES[partner.status as keyof typeof PARTNER_STATUSES]
        const converted = partner.referrals.filter(r => r.status === "CONVERTED")
        const partnerCommission = converted.reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
        const partnerUnpaid = converted
          .filter(r => r.commissionCents && !r.commissionPaidAt)
          .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
        const now = new Date()
        const hasActiveLink = partner.referrals.some(
          r => ["PENDING", "CLICKED"].includes(r.status) && new Date(r.expiresAt) > now
        )
        const canRenew = partner.status === "ACTIVE" && !hasActiveLink

        return (
          <Card key={partner.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{partner.name}</CardTitle>
                    {statusConfig && <Badge className={statusConfig.color}>{statusConfig.label}</Badge>}
                    <Badge variant="outline">{partner.commissionPercent}% commission</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />{partner.contactEmail}
                    </span>
                    {partner.contactPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{partner.contactPhone}
                      </span>
                    )}
                    {partner.approvedAt && <span>Approved {format(partner.approvedAt, "dd MMM yyyy")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {partner.status === "ACTIVE" && <ResendWelcomeButton partnerId={partner.id} />}
                  {canRenew && <RenewLinkButton partnerId={partner.id} />}
                  <div className="text-right text-xs">
                    <p className="font-medium">Total: {formatZar(partnerCommission)}</p>
                    {partnerUnpaid > 0 && (
                      <p className="text-amber-600 font-medium">Unpaid: {formatZar(partnerUnpaid)}</p>
                    )}
                  </div>
                </div>
              </div>
              {partner.accessToken && (
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Dashboard: </span>
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[10px]">
                    {appUrl}/referral/dashboard?token={partner.accessToken}
                  </code>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {partner.referrals.length > 0 ? (
                <div className="space-y-2">
                  {partner.referrals.map((ref) => {
                    const sc = REFERRAL_STATUS_CONFIG[ref.status]
                    return (
                      <div key={ref.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-medium">{ref.code}</code>
                            {sc && <Badge className={`${sc.color} text-[10px]`}>{sc.label}</Badge>}
                            {ref.clickCount > 0 && (
                              <span className="text-xs text-muted-foreground">{ref.clickCount} clicks</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            {ref.referredOrg && (
                              <span className="font-medium text-foreground">{ref.referredOrg.name}</span>
                            )}
                            {ref.referredCompany && !ref.referredOrg && (
                              <span>{ref.referredCompany}</span>
                            )}
                            <span>Created {format(ref.createdAt, "dd MMM yyyy")}</span>
                            {new Date(ref.expiresAt) < new Date() ? (
                              <span className="text-red-600">Expired {format(ref.expiresAt, "dd MMM yyyy")}</span>
                            ) : (
                              <span>Expires {format(ref.expiresAt, "dd MMM yyyy")}</span>
                            )}
                            {ref.convertedAt && <span>Converted {format(ref.convertedAt, "dd MMM yyyy")}</span>}
                          </div>
                          {ref.status === "CONVERTED" && ref.commissionCents && (
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              <span className="font-medium text-green-700">{formatZar(ref.commissionCents)}</span>
                              <span className="text-muted-foreground">({ref.commissionMonthsEarned}/12 months)</span>
                              {ref.commissionPaidAt ? (
                                <Badge className="bg-green-100 text-green-800 text-[10px]">
                                  Paid {format(ref.commissionPaidAt, "dd MMM yyyy")}
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px]">Unpaid</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {ref.status === "CONVERTED" && ref.commissionCents && !ref.commissionPaidAt && (
                          <MarkCommissionPaidButton referralId={ref.id} amount={ref.commissionCents} />
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No referral links generated yet.</p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {partners.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No referral partners yet. Partners register at <code>/referral/register</code>.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryCard({
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

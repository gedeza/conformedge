import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Link2, Users, TrendingUp, Banknote } from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getReferrals, getReferralSummary } from "../actions"
import { isPartnerAdmin } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { GenerateReferralButton } from "./generate-referral-button"
import { ReferralActionsMenu } from "./referral-actions-menu"

const REFERRAL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-800" },
  CLICKED: { label: "Clicked", color: "bg-blue-100 text-blue-800" },
  SIGNED_UP: { label: "Signed Up", color: "bg-amber-100 text-amber-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
}

export default async function PartnerReferralsPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const [referrals, summary] = await Promise.all([
    getReferrals(),
    getReferralSummary(),
  ])

  const isAdmin = isPartnerAdmin(ctx.partnerRole)

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Referrals"
        description="Generate referral links and track conversions"
      >
        {isAdmin && <GenerateReferralButton />}
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Link2}
          label="Total Referrals"
          value={summary?.total.toString() ?? "0"}
          sub="All time"
        />
        <SummaryCard
          icon={Users}
          label="Active Links"
          value={summary?.pending.toString() ?? "0"}
          sub="Pending + Clicked"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Conversions"
          value={summary?.converted.toString() ?? "0"}
          sub={summary?.signedUp ? `${summary.signedUp} awaiting conversion` : "None yet"}
        />
        <SummaryCard
          icon={Banknote}
          label="Commission Earned"
          value={formatZar(summary?.totalCommissionCents ?? 0)}
          sub={`${summary?.converted ?? 0} converted`}
          highlight
        />
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((ref) => {
                const statusConfig = REFERRAL_STATUS_CONFIG[ref.status]
                return (
                  <div key={ref.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-medium">{ref.code}</code>
                        {statusConfig && (
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Created {format(ref.createdAt, "dd MMM yyyy")}</span>
                        <span>Expires {format(ref.expiresAt, "dd MMM yyyy")}</span>
                        {ref.clickCount > 0 && <span>{ref.clickCount} clicks</span>}
                        {ref.referredOrg && (
                          <span className="font-medium text-foreground">
                            {ref.referredOrg.name}
                          </span>
                        )}
                      </div>
                      {ref.commissionCents && ref.status === "CONVERTED" && (
                        <p className="text-xs font-medium text-green-700">
                          Commission: {formatZar(ref.commissionCents)}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <ReferralActionsMenu
                        referralId={ref.id}
                        code={ref.code}
                        status={ref.status}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No referrals yet. Generate your first referral link above to start earning commission.
            </p>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <Step number={1} title="Generate Link" description="Create a unique referral link" />
            <Step number={2} title="Share" description="Send the link to potential clients" />
            <Step number={3} title="They Sign Up" description="Client creates an account via your link" />
            <Step number={4} title="Earn Commission" description="Get paid when they convert to a paid plan" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Your commission rate is {summary ? `${referrals[0]?.commissionPercent ?? 10}%` : "10%"} of the referred
            client&apos;s first 12 months of subscription fees. Referral links expire after 90 days.
          </p>
        </CardContent>
      </Card>
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

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {number}
      </div>
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

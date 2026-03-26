import { Metadata } from "next"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link2, TrendingUp, Banknote, Clock } from "lucide-react"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"

export const metadata: Metadata = {
  title: "Referral Dashboard | ConformEdge",
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-800" },
  CLICKED: { label: "Clicked", color: "bg-blue-100 text-blue-800" },
  SIGNED_UP: { label: "Signed Up", color: "bg-amber-100 text-amber-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  EXPIRED: { label: "Expired", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
}

export default async function ReferralDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) redirect("/referral/register")

  const partner = await db.partner.findUnique({
    where: { accessToken: token },
    include: {
      referrals: {
        include: { referredOrg: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!partner || partner.tier !== "REFERRAL") redirect("/referral/register")

  const referrals = partner.referrals
  const converted = referrals.filter((r) => r.status === "CONVERTED")
  const totalCommission = converted.reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
  const unpaidCommission = converted
    .filter((r) => r.commissionCents && !r.commissionPaidAt)
    .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
  const paidCommission = converted
    .filter((r) => r.commissionPaidAt)
    .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)

  const activeLinks = referrals.filter(
    (r) => r.status === "PENDING" || r.status === "CLICKED"
  ).length
  const signedUp = referrals.filter((r) => r.status === "SIGNED_UP").length

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const activeReferralCode = referrals.find(
    (r) => r.status === "PENDING" || r.status === "CLICKED"
  )?.code

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Referral Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {partner.name}. Commission rate: {partner.commissionPercent}%
          </p>
        </div>

        {/* Referral Link */}
        {activeReferralCode && (
          <Card className="mb-6 border-primary">
            <CardContent className="flex items-center gap-3 py-4">
              <Link2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Your Referral Link</p>
                <code className="text-sm font-medium">{appUrl}/ref/{activeReferralCode}</code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={Link2} label="Active Links" value={activeLinks.toString()} sub={`${signedUp} awaiting conversion`} />
          <SummaryCard icon={TrendingUp} label="Conversions" value={converted.length.toString()} sub="Paid clients" />
          <SummaryCard icon={Banknote} label="Commission Earned" value={formatZar(totalCommission)} sub={`${formatZar(unpaidCommission)} unpaid`} highlight />
          <SummaryCard icon={Clock} label="Commission Paid" value={formatZar(paidCommission)} sub="Via EFT" />
        </div>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((ref) => {
                  const sc = STATUS_CONFIG[ref.status]
                  return (
                    <div key={ref.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-medium">{ref.code}</code>
                          {sc && <Badge className={sc.color}>{sc.label}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Created {format(ref.createdAt, "dd MMM yyyy")}</span>
                          {ref.clickCount > 0 && <span>{ref.clickCount} clicks</span>}
                          {ref.referredOrg && (
                            <span className="font-medium text-foreground">{ref.referredOrg.name}</span>
                          )}
                        </div>
                        {ref.status === "CONVERTED" && ref.commissionCents && (
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-medium text-green-700">
                              {formatZar(ref.commissionCents)}
                            </span>
                            <span className="text-muted-foreground">
                              ({ref.commissionMonthsEarned}/12 months)
                            </span>
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
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No referrals yet. Share your referral link to start earning commission.
              </p>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">How Commission Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>You earn {partner.commissionPercent}% of each referred client&apos;s subscription for their first 12 months.</p>
            <p>Commission accrues monthly as the client pays — not as a lump sum. Annual subscribers credit all 12 months at once.</p>
            <p>Payouts are processed monthly via EFT to the bank account you registered with.</p>
          </CardContent>
        </Card>
      </div>
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

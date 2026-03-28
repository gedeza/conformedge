import { Metadata } from "next"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Link2,
  TrendingUp,
  Banknote,
  Clock,
  MousePointerClick,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { ReferralResourceHub } from "./resource-hub"
import { CopyLinkButton, RequestLinkRenewalButton } from "./dashboard-actions"
import { PartnerSettings } from "./partner-settings"
import { DashboardTabs } from "./dashboard-tabs"
import { DashboardBrandHeader, DashboardBrandFooter } from "./dashboard-header"

export const metadata: Metadata = {
  title: "Referral Dashboard | ConformEdge",
}

/* ------------------------------------------------------------------ */
/*  Status config with explanations                                    */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }>; explanation: string }
> = {
  PENDING: {
    label: "Active",
    color: "bg-blue-100 text-blue-800",
    icon: Eye,
    explanation: "Link is live and waiting for clicks",
  },
  CLICKED: {
    label: "Clicked",
    color: "bg-indigo-100 text-indigo-800",
    icon: MousePointerClick,
    explanation: "Someone clicked your link — waiting for sign-up",
  },
  SIGNED_UP: {
    label: "Signed Up",
    color: "bg-amber-100 text-amber-800",
    icon: UserPlus,
    explanation: "They created an account — waiting for paid subscription",
  },
  CONVERTED: {
    label: "Converted",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    explanation: "Paid subscriber — you are earning commission",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    explanation: "Link expired after 90 days without conversion",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-500",
    icon: XCircle,
    explanation: "This referral was cancelled",
  },
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

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
  const now = new Date()
  const converted = referrals.filter((r) => r.status === "CONVERTED")
  const totalCommission = converted.reduce(
    (sum, r) => sum + (r.commissionCents ?? 0),
    0
  )
  const unpaidCommission = converted
    .filter((r) => r.commissionCents && !r.commissionPaidAt)
    .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
  const paidCommission = converted
    .filter((r) => r.commissionPaidAt)
    .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)

  const activeLinks = referrals.filter(
    (r) =>
      (r.status === "PENDING" || r.status === "CLICKED") &&
      new Date(r.expiresAt) > now
  ).length
  const signedUp = referrals.filter((r) => r.status === "SIGNED_UP").length
  const totalClicks = referrals.reduce((sum, r) => sum + r.clickCount, 0)

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const activeReferral = referrals.find(
    (r) =>
      (r.status === "PENDING" || r.status === "CLICKED") &&
      new Date(r.expiresAt) > now
  )
  const activeReferralUrl = activeReferral
    ? `${appUrl}/ref/${activeReferral.code}`
    : null

  // ─── Overview Tab Content ───
  const overviewContent = (
    <>
      {/* Referral Link Card */}
      <Card className={activeReferralUrl ? "border-primary" : "border-dashed"}>
        <CardContent className="py-4">
          {activeReferralUrl ? (
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Your Referral Link
                  {activeReferral && (
                    <span className="ml-2 text-muted-foreground">
                      (expires{" "}
                      {format(new Date(activeReferral.expiresAt), "dd MMM yyyy")}{" "}
                      &mdash;{" "}
                      {differenceInDays(
                        new Date(activeReferral.expiresAt),
                        now
                      )}{" "}
                      days left)
                    </span>
                  )}
                </p>
                <code className="text-sm font-medium break-all">
                  {activeReferralUrl}
                </code>
              </div>
              <CopyLinkButton url={activeReferralUrl} />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">No active referral link</p>
                <p className="text-xs text-muted-foreground">
                  Generate a new link to start sharing with prospects.
                </p>
              </div>
              <RequestLinkRenewalButton token={token} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Link2}
          label="Active Links"
          value={activeLinks.toString()}
          sub={`${totalClicks} total clicks`}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Conversions"
          value={converted.length.toString()}
          sub={`${signedUp} awaiting conversion`}
        />
        <SummaryCard
          icon={Banknote}
          label="Commission Earned"
          value={formatZar(totalCommission)}
          sub={
            unpaidCommission > 0
              ? `${formatZar(unpaidCommission)} pending payout`
              : "All paid"
          }
          highlight
        />
        <SummaryCard
          icon={Clock}
          label="Commission Paid"
          value={formatZar(paidCommission)}
          sub="Via EFT"
        />
      </div>

      {/* Referral History with enhanced status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((ref) => {
                const sc = STATUS_CONFIG[ref.status]
                const StatusIcon = sc?.icon
                const isExpiringSoon =
                  (ref.status === "PENDING" || ref.status === "CLICKED") &&
                  differenceInDays(new Date(ref.expiresAt), now) <= 14 &&
                  differenceInDays(new Date(ref.expiresAt), now) > 0
                const commissionComplete =
                  ref.status === "CONVERTED" &&
                  ref.commissionMonthsEarned >= 12

                return (
                  <div
                    key={ref.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    {/* Top row: code, status, explanation */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-medium">
                            {ref.code}
                          </code>
                          {sc && (
                            <Badge className={`${sc.color} gap-1`}>
                              {StatusIcon && (
                                <StatusIcon className="h-3 w-3" />
                              )}
                              {sc.label}
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300 text-[10px]"
                            >
                              Expiring soon
                            </Badge>
                          )}
                          {commissionComplete && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                              12/12 months complete
                            </Badge>
                          )}
                        </div>
                        {sc && (
                          <p className="text-[11px] text-muted-foreground">
                            {sc.explanation}
                          </p>
                        )}
                      </div>
                      {(ref.status === "PENDING" || ref.status === "CLICKED") &&
                        new Date(ref.expiresAt) > now && (
                          <CopyLinkButton
                            url={`${appUrl}/ref/${ref.code}`}
                          />
                        )}
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>
                        Created {format(ref.createdAt, "dd MMM yyyy")}
                      </span>
                      {ref.clickCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {ref.clickCount} clicks
                        </span>
                      )}
                      {ref.referredOrg && (
                        <span className="font-medium text-foreground">
                          {ref.referredOrg.name}
                        </span>
                      )}
                      {(ref.status === "PENDING" || ref.status === "CLICKED") && (
                        <span>
                          Expires{" "}
                          {format(new Date(ref.expiresAt), "dd MMM yyyy")}
                        </span>
                      )}
                      {ref.convertedAt && (
                        <span className="text-green-700">
                          Converted {format(ref.convertedAt, "dd MMM yyyy")}
                        </span>
                      )}
                    </div>

                    {/* Commission progress */}
                    {ref.status === "CONVERTED" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-green-700">
                            {formatZar(ref.commissionCents ?? 0)} earned
                          </span>
                          <span className="text-muted-foreground">
                            {ref.commissionMonthsEarned}/12 months
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{
                              width: `${Math.min(100, (ref.commissionMonthsEarned / 12) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {ref.commissionPaidAt ? (
                            <Badge className="bg-green-100 text-green-800 text-[10px]">
                              Paid {format(ref.commissionPaidAt, "dd MMM yyyy")}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                              Pending payout
                            </Badge>
                          )}
                          {ref.commissionMonthsEarned < 12 && (
                            <span className="text-muted-foreground">
                              ~{formatZar(Math.round((ref.commissionCents ?? 0) / Math.max(1, ref.commissionMonthsEarned)))}
                              /mo
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Link2 className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No referrals yet. Share your referral link to start earning
                commission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )

  // ─── Resources Tab Content ───
  const resourcesContent = (
    <ReferralResourceHub
      commissionPercent={partner.commissionPercent}
      referralLink={activeReferralUrl || appUrl}
    />
  )

  // ─── Settings Tab Content ───
  const settingsContent = (
    <PartnerSettings
      token={token}
      partner={{
        name: partner.name,
        contactEmail: partner.contactEmail,
        contactPhone: partner.contactPhone,
        bankName: partner.bankName,
        bankAccountHolder: partner.bankAccountHolder,
        bankAccountNumber: partner.bankAccountNumber,
        bankBranchCode: partner.bankBranchCode,
        bankAccountType: partner.bankAccountType,
      }}
    />
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardBrandHeader
        partnerName={partner.name}
        commissionPercent={partner.commissionPercent}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Tabbed Layout */}
          <DashboardTabs
            overviewContent={overviewContent}
            resourcesContent={resourcesContent}
            settingsContent={settingsContent}
          />
        </div>
      </main>

      <DashboardBrandFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Summary Card                                                       */
/* ------------------------------------------------------------------ */

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
          <div
            className={`rounded-lg p-2 ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
              className={`text-xl font-bold ${highlight ? "text-primary" : ""}`}
            >
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

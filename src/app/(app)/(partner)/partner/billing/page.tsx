import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import {
  CreditCard,
  Receipt,
  TrendingDown,
  Building2,
} from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getPartnerBillingData } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { PARTNER_CLIENT_SIZES, INVOICE_STATUSES } from "@/lib/constants"
import { GenerateInvoiceButton } from "./generate-invoice-button"

export default async function PartnerBillingPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const data = await getPartnerBillingData()
  if (!data || !data.partner || !data.calculation) redirect("/partner")

  const { partner, invoices, calculation: calc } = data

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Billing"
        description="Monthly fees and invoice history"
      >
        {ctx.partnerRole === "PARTNER_ADMIN" && <GenerateInvoiceButton />}
      </PageHeader>

      {/* Current Month Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={CreditCard}
          label="Platform Fee"
          value={formatZar(calc.platformFeeCents)}
          sub="Monthly base"
        />
        <SummaryCard
          icon={Building2}
          label="Client Fees"
          value={formatZar(calc.clientFeesCents)}
          sub={`${calc.activeClientCount} client${calc.activeClientCount !== 1 ? "s" : ""}`}
        />
        {calc.discountCents > 0 && (
          <SummaryCard
            icon={TrendingDown}
            label="Volume Discount"
            value={`-${formatZar(calc.discountCents)}`}
            sub={`${calc.volumeDiscountPercent}% discount`}
          />
        )}
        <SummaryCard
          icon={Receipt}
          label="Monthly Total"
          value={formatZar(calc.totalCents)}
          sub={`Incl. ${formatZar(calc.vatCents)} VAT`}
          highlight
        />
      </div>

      {/* Per-Client Fee Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Client Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Platform fee line */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-sm font-medium">Partner Platform Fee</p>
                <p className="text-xs text-muted-foreground">{partner.tier} tier — monthly base</p>
              </div>
              <span className="font-medium">{formatZar(calc.platformFeeCents)}</span>
            </div>

            {/* Client lines */}
            {calc.clientLineItems.map((item) => {
              const sizeConfig = PARTNER_CLIENT_SIZES[item.clientSize as keyof typeof PARTNER_CLIENT_SIZES]
              return (
                <div key={item.organizationId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.organizationName}</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {sizeConfig?.label ?? item.clientSize}
                        </Badge>
                        {item.isCustom && (
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">Custom rate</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatZar(item.feeCents)}</span>
                </div>
              )
            })}

            {calc.clientLineItems.length === 0 && (
              <p className="text-sm text-muted-foreground">No active client organizations</p>
            )}

            {/* Discount line */}
            {calc.discountCents > 0 && (
              <div className="flex items-center justify-between border-t pt-3 text-green-700">
                <div>
                  <p className="text-sm font-medium">Volume Discount ({calc.volumeDiscountPercent}%)</p>
                  <p className="text-xs">{calc.activeClientCount} active clients</p>
                </div>
                <span className="font-medium">-{formatZar(calc.discountCents)}</span>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatZar(calc.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (15%)</span>
                <span>{formatZar(calc.vatCents)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatZar(calc.totalCents)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((inv) => {
                const statusConfig = INVOICE_STATUSES[inv.status as keyof typeof INVOICE_STATUSES]
                return (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(inv.periodStart, "dd MMM")} — {format(inv.periodEnd, "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatZar(inv.totalCents)}</span>
                      {statusConfig && (
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No invoices yet. Generate your first invoice above.</p>
          )}
        </CardContent>
      </Card>

      {/* Default Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["SMALL", "MEDIUM", "LARGE"] as const).map((size) => {
              const config = PARTNER_CLIENT_SIZES[size]
              const fee = size === "SMALL" ? partner.defaultSmallFeeCents
                : size === "MEDIUM" ? partner.defaultMediumFeeCents
                : partner.defaultLargeFeeCents
              return (
                <div key={size} className="rounded-lg border p-4 text-center">
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                  <p className="mt-2 text-xl font-bold">{formatZar(fee)}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            These are your negotiated default rates. Individual clients can have custom rates set on the Client Organizations page.
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

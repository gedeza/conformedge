import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getPartnerContext } from "@/lib/partner-auth"
import { getPartner, getPartnerBrandingData } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { PARTNER_TIERS, PARTNER_STATUSES } from "@/lib/constants"
import { BrandingForm } from "./branding-form"

export default async function PartnerSettingsPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const [partner, branding] = await Promise.all([
    getPartner(ctx.partnerId),
    getPartnerBrandingData(),
  ])
  if (!partner) redirect("/dashboard")

  const tierConfig = PARTNER_TIERS[partner.tier as keyof typeof PARTNER_TIERS]
  const statusConfig = PARTNER_STATUSES[partner.status as keyof typeof PARTNER_STATUSES]

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Partner Settings"
        description="View your partner account details"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow label="Partner Name" value={partner.name} />
            <SettingRow label="Tier">
              <Badge className={tierConfig?.color}>{tierConfig?.label ?? partner.tier}</Badge>
            </SettingRow>
            <SettingRow label="Status">
              <Badge className={statusConfig?.color}>{statusConfig?.label ?? partner.status}</Badge>
            </SettingRow>
            <SettingRow label="Contact Email" value={partner.contactEmail} />
            {partner.contactPhone && (
              <SettingRow label="Phone" value={partner.contactPhone} />
            )}
            {partner.website && (
              <SettingRow label="Website" value={partner.website} />
            )}
            {partner.registrationNumber && (
              <SettingRow label="Registration No." value={partner.registrationNumber} />
            )}
            <SettingRow
              label="Member Since"
              value={format(partner.createdAt, "dd MMMM yyyy")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              label="Platform Fee"
              value={`R${(partner.basePlatformFeeCents / 100).toLocaleString("en-ZA")}/mo`}
            />
            <SettingRow
              label="Small Client Default"
              value={`R${(partner.defaultSmallFeeCents / 100).toLocaleString("en-ZA")}/mo`}
            />
            <SettingRow
              label="Medium Client Default"
              value={`R${(partner.defaultMediumFeeCents / 100).toLocaleString("en-ZA")}/mo`}
            />
            <SettingRow
              label="Large Client Default"
              value={`R${(partner.defaultLargeFeeCents / 100).toLocaleString("en-ZA")}/mo`}
            />
            {partner.volumeDiscountPercent > 0 && (
              <SettingRow
                label="Volume Discount"
                value={`${partner.volumeDiscountPercent}%`}
              />
            )}
            {partner.commissionPercent > 0 && (
              <SettingRow
                label="Commission Rate"
                value={`${partner.commissionPercent}%`}
              />
            )}
            {partner.maxClientOrgs && (
              <SettingRow
                label="Max Client Orgs"
                value={`${partner.maxClientOrgs}`}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <BrandingForm
        logoKey={branding?.logoKey ?? null}
        brandName={branding?.brandName ?? null}
        primaryColor={branding?.primaryColor ?? null}
        accentColor={branding?.accentColor ?? null}
        tier={partner.tier}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow label="Your Role" value={ctx.partnerRole.replace(/_/g, " ")} />
          <SettingRow
            label="Client Organizations"
            value={`${ctx.clientOrgIds.length} active`}
          />
          <SettingRow
            label="Team Members"
            value={`${partner.partnerUsers.filter((u) => u.isActive).length} active`}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SettingRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children ?? <span className="text-sm font-medium">{value}</span>}
    </div>
  )
}

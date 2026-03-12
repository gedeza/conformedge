import { db } from "@/lib/db"

export interface PartnerBranding {
  logoKey: string | null
  brandName: string | null
  primaryColor: string | null
  accentColor: string | null
  partnerName: string
}

/**
 * Get branding for a specific partner.
 */
export async function getPartnerBranding(partnerId: string): Promise<PartnerBranding | null> {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: {
      name: true,
      logoKey: true,
      brandName: true,
      primaryColor: true,
      accentColor: true,
    },
  })

  if (!partner) return null

  return {
    logoKey: partner.logoKey,
    brandName: partner.brandName,
    primaryColor: partner.primaryColor,
    accentColor: partner.accentColor,
    partnerName: partner.name,
  }
}

/**
 * Get partner branding for a client organization (if managed by a WHITE_LABEL partner).
 */
export async function getPartnerBrandingForOrg(organizationId: string): Promise<PartnerBranding | null> {
  const partnerOrg = await db.partnerOrganization.findFirst({
    where: { organizationId, isActive: true },
    include: {
      partner: {
        select: {
          name: true,
          tier: true,
          status: true,
          logoKey: true,
          brandName: true,
          primaryColor: true,
          accentColor: true,
        },
      },
    },
  })

  if (!partnerOrg) return null
  if (partnerOrg.partner.status !== "ACTIVE") return null
  if (partnerOrg.partner.tier !== "WHITE_LABEL") return null

  return {
    logoKey: partnerOrg.partner.logoKey,
    brandName: partnerOrg.partner.brandName,
    primaryColor: partnerOrg.partner.primaryColor,
    accentColor: partnerOrg.partner.accentColor,
    partnerName: partnerOrg.partner.name,
  }
}

import { db } from "@/lib/db"
import { VAT_RATE } from "@/lib/billing/plans"
import { PARTNER_CLIENT_SIZES } from "@/lib/constants"
import type { PartnerClientSize } from "@/types"

interface ClientFeeLineItem {
  organizationId: string
  organizationName: string
  clientSize: PartnerClientSize
  feeCents: number
  isCustom: boolean
}

interface PartnerInvoiceCalculation {
  platformFeeCents: number
  clientLineItems: ClientFeeLineItem[]
  clientFeesCents: number
  activeClientCount: number
  volumeDiscountPercent: number
  discountCents: number
  subtotalCents: number
  vatCents: number
  totalCents: number
}

/**
 * Calculate a partner's monthly invoice breakdown.
 * v2.0: Flat per-client pricing (R1,499/R1,999/R2,999 by tier).
 * No volume discounts — same rate whether client #1 or #50.
 */
export async function calculatePartnerInvoice(partnerId: string): Promise<PartnerInvoiceCalculation | null> {
  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    include: {
      clientOrganizations: {
        where: { isActive: true },
        include: {
          organization: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!partner) return null

  // Calculate per-client fees
  const clientLineItems: ClientFeeLineItem[] = partner.clientOrganizations.map((co) => {
    const sizeKey = co.clientSize as PartnerClientSize
    const defaultFee = getDefaultFeeForSize(partner, sizeKey)
    const feeCents = co.customFeeCents ?? defaultFee

    return {
      organizationId: co.organizationId,
      organizationName: co.organization.name,
      clientSize: sizeKey,
      feeCents,
      isCustom: co.customFeeCents !== null,
    }
  })

  const clientFeesCents = clientLineItems.reduce((sum, item) => sum + item.feeCents, 0)
  const activeClientCount = clientLineItems.length

  // v2.0: No automatic volume discounts — flat pricing at all scales.
  // volumeDiscountPercent on the Partner model is only used for manually negotiated discounts.
  const volumeDiscountPercent = partner.volumeDiscountPercent

  const discountCents = Math.round(clientFeesCents * (volumeDiscountPercent / 100))
  const subtotalCents = partner.basePlatformFeeCents + clientFeesCents - discountCents
  const vatCents = Math.round(subtotalCents * VAT_RATE)
  const totalCents = subtotalCents + vatCents

  return {
    platformFeeCents: partner.basePlatformFeeCents,
    clientLineItems,
    clientFeesCents,
    activeClientCount,
    volumeDiscountPercent,
    discountCents,
    subtotalCents,
    vatCents,
    totalCents,
  }
}

function getDefaultFeeForSize(
  partner: { defaultSmallFeeCents: number; defaultMediumFeeCents: number; defaultLargeFeeCents: number },
  size: PartnerClientSize
): number {
  switch (size) {
    case "SMALL": return partner.defaultSmallFeeCents
    case "MEDIUM": return partner.defaultMediumFeeCents
    case "LARGE": return partner.defaultLargeFeeCents
  }
}

/**
 * Generate a new partner invoice for the current billing period.
 */
export async function generatePartnerInvoice(partnerId: string): Promise<string | null> {
  const calc = await calculatePartnerInvoice(partnerId)
  if (!calc) return null

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const dueAt = new Date(now.getFullYear(), now.getMonth() + 1, 15) // Due 15th of next month

  // Generate invoice number: PI-YYYYMM-XXXX
  const lastInvoice = await db.partnerInvoice.findFirst({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  })
  const seq = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split("-").pop() ?? "0", 10) + 1
    : 1
  const invoiceNumber = `PI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(seq).padStart(4, "0")}`

  // Build line items for the invoice JSON
  const lineItems = [
    {
      description: "Partner Platform Fee",
      quantity: 1,
      unitPriceCents: calc.platformFeeCents,
      totalCents: calc.platformFeeCents,
    },
    ...calc.clientLineItems.map((item) => ({
      description: `Client: ${item.organizationName} (${item.clientSize})${item.isCustom ? " — custom rate" : ""}`,
      quantity: 1,
      unitPriceCents: item.feeCents,
      totalCents: item.feeCents,
    })),
  ]

  if (calc.discountCents > 0) {
    lineItems.push({
      description: `Volume Discount (${calc.volumeDiscountPercent}%)`,
      quantity: 1,
      unitPriceCents: -calc.discountCents,
      totalCents: -calc.discountCents,
    })
  }

  const invoice = await db.partnerInvoice.create({
    data: {
      partnerId,
      invoiceNumber,
      platformFeeCents: calc.platformFeeCents,
      clientFeesCents: calc.clientFeesCents,
      discountCents: calc.discountCents,
      subtotalCents: calc.subtotalCents,
      vatCents: calc.vatCents,
      totalCents: calc.totalCents,
      periodStart,
      periodEnd,
      dueAt,
      lineItems,
    },
  })

  return invoice.id
}

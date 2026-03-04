"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext } from "@/lib/billing"
import {
  PLAN_DEFINITIONS,
  CREDIT_PACKS,
  VAT_RATE,
  ANNUAL_DISCOUNT_MONTHS,
  formatZar,
} from "@/lib/billing/plans"
import {
  initializeTransaction,
  generateReference,
} from "@/lib/paystack"
import { APP_URL } from "@/lib/constants"
import type { BillingContext, PlanTier, BillingCycle } from "@/types"

// ─────────────────────────────────────────────
// Page data
// ─────────────────────────────────────────────

export async function getBillingPageData(): Promise<{
  billing: BillingContext
  orgName: string
  orgEmail: string
  paystackPublicKey: string | null
  creditTransactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: Date
  }>
  invoices: Array<{
    id: string
    totalCents: number
    status: string
    periodStart: Date
    periodEnd: Date
    paidAt: Date | null
    createdAt: Date
  }>
}> {
  const { dbOrgId, dbUserId } = await getAuthContext()

  const [billing, org, user, creditTransactions, invoices] = await Promise.all([
    getBillingContext(dbOrgId),
    db.organization.findUnique({
      where: { id: dbOrgId },
      select: { name: true },
    }),
    db.user.findUnique({
      where: { id: dbUserId },
      select: { email: true },
    }),
    db.creditTransaction.findMany({
      where: { organizationId: dbOrgId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceAfter: true,
        description: true,
        createdAt: true,
      },
    }),
    db.invoice.findMany({
      where: { organizationId: dbOrgId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        totalCents: true,
        status: true,
        periodStart: true,
        periodEnd: true,
        paidAt: true,
        createdAt: true,
      },
    }),
  ])

  return {
    billing,
    orgName: org?.name ?? "Organization",
    orgEmail: user?.email ?? "",
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? null,
    creditTransactions,
    invoices,
  }
}

// ─────────────────────────────────────────────
// Plan checkout (subscription upgrade)
// ─────────────────────────────────────────────

export async function initiatePlanCheckout(
  targetTier: PlanTier,
  cycle: BillingCycle
): Promise<{ authorizationUrl: string } | { error: string }> {
  const { dbOrgId, dbUserId, role } = await getAuthContext()

  if (!["OWNER", "ADMIN"].includes(role)) {
    return { error: "Only owners and admins can change plans." }
  }

  const plan = PLAN_DEFINITIONS[targetTier]
  if (!plan.monthlyPriceZar) {
    return { error: "Enterprise plans require a custom quote. Contact sales." }
  }

  // Calculate amount
  let totalCents: number
  let description: string

  if (cycle === "ANNUAL") {
    // Annual = pay 10 months for 12
    totalCents = plan.monthlyPriceZar * ANNUAL_DISCOUNT_MONTHS
    description = `${plan.name} Plan — Annual (${ANNUAL_DISCOUNT_MONTHS} months)`
  } else {
    totalCents = plan.monthlyPriceZar
    description = `${plan.name} Plan — Monthly`
  }

  // VAT breakdown
  const netCents = Math.round(totalCents / (1 + VAT_RATE))
  const vatCents = totalCents - netCents

  const user = await db.user.findUnique({
    where: { id: dbUserId },
    select: { email: true, firstName: true, lastName: true },
  })

  if (!user?.email) {
    return { error: "User email not found." }
  }

  const reference = generateReference("plan")

  try {
    const result = await initializeTransaction({
      email: user.email,
      amount: totalCents,
      reference,
      callbackUrl: `${APP_URL}/billing?ref=${reference}`,
      metadata: {
        type: "plan_subscription",
        organizationId: dbOrgId,
        userId: dbUserId,
        targetTier,
        cycle,
        netCents,
        vatCents,
        description,
      },
    })

    return { authorizationUrl: result.authorization_url }
  } catch (err) {
    console.error("[billing] Paystack initializeTransaction failed:", err)
    return { error: "Payment provider unavailable. Please try again later." }
  }
}

// ─────────────────────────────────────────────
// Credit pack purchase (one-time)
// ─────────────────────────────────────────────

export async function initiateCreditPurchase(
  packId: string
): Promise<{ authorizationUrl: string } | { error: string }> {
  const { dbOrgId, dbUserId, role } = await getAuthContext()

  if (!["OWNER", "ADMIN", "MANAGER"].includes(role)) {
    return { error: "You don't have permission to purchase credits." }
  }

  const pack = CREDIT_PACKS.find((p) => p.id === packId)
  if (!pack) {
    return { error: "Invalid credit pack." }
  }

  const user = await db.user.findUnique({
    where: { id: dbUserId },
    select: { email: true },
  })

  if (!user?.email) {
    return { error: "User email not found." }
  }

  const totalCents = pack.priceZar
  const netCents = Math.round(totalCents / (1 + VAT_RATE))
  const vatCents = totalCents - netCents

  const reference = generateReference("credits")

  try {
    const result = await initializeTransaction({
      email: user.email,
      amount: totalCents,
      reference,
      callbackUrl: `${APP_URL}/billing?ref=${reference}`,
      metadata: {
        type: "credit_purchase",
        organizationId: dbOrgId,
        userId: dbUserId,
        packId: pack.id,
        credits: pack.credits,
        netCents,
        vatCents,
        description: `${pack.credits} AI Credits`,
      },
    })

    return { authorizationUrl: result.authorization_url }
  } catch (err) {
    console.error("[billing] Paystack credit purchase failed:", err)
    return { error: "Payment provider unavailable. Please try again later." }
  }
}

// ─────────────────────────────────────────────
// Verify payment callback
// ─────────────────────────────────────────────

export async function verifyPaymentCallback(
  reference: string
): Promise<{ success: boolean; message: string }> {
  const { dbOrgId } = await getAuthContext()

  try {
    const { verifyTransaction } = await import("@/lib/paystack")
    const tx = await verifyTransaction(reference)

    if (tx.status !== "success") {
      return { success: false, message: "Payment was not successful." }
    }

    const metadata = tx.metadata as Record<string, unknown>

    // Verify this payment belongs to this org
    if (metadata.organizationId !== dbOrgId) {
      return { success: false, message: "Payment does not match organization." }
    }

    // Payment was processed — webhook handles the actual provisioning
    return {
      success: true,
      message: metadata.type === "credit_purchase"
        ? `${metadata.credits} AI credits added to your account.`
        : `Your plan has been updated to ${PLAN_DEFINITIONS[metadata.targetTier as PlanTier]?.name ?? "the new plan"}.`,
    }
  } catch {
    return { success: false, message: "Unable to verify payment. It may still be processing." }
  }
}

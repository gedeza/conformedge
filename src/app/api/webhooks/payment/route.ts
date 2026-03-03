import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { addDays } from "date-fns"
import { db } from "@/lib/db"
import { grantCredits } from "@/lib/billing/usage"
import { PLAN_DEFINITIONS, GRACE_PERIOD_DAYS, VAT_RATE, CREDIT_PACKS } from "@/lib/billing/plans"
import { snapshotResourceCounts } from "@/lib/billing/usage"
import { sendNotificationEmail } from "@/lib/email"
import { filterEnabledUsers } from "@/lib/notification-preferences"
import { captureError } from "@/lib/error-tracking"
import type { PlanTier, BillingCycle, NotificationType } from "@/types"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

interface PaystackEvent {
  event: string
  data: {
    id: number
    reference: string
    amount: number
    currency: string
    status: string
    paid_at?: string
    channel?: string
    metadata?: Record<string, unknown>
    customer?: { email: string; customer_code: string }
    plan?: { plan_code: string }
    subscription_code?: string
  }
}

/**
 * POST /api/webhooks/payment
 *
 * Paystack webhook — processes payment events.
 * Verifies HMAC-SHA512 signature. Returns 200 immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    // Verify Paystack signature (skip in dev if secret not set)
    if (PAYSTACK_SECRET) {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(body)
        .digest("hex")

      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body) as PaystackEvent

    console.log(`[payment-webhook] Processing event: ${event.event}`)

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data)
        break
      case "charge.failed":
        await handleChargeFailed(event.data)
        break
      case "subscription.disable":
        await handleSubscriptionDisabled(event.data)
        break
      default:
        console.log(`[payment-webhook] Unhandled event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    captureError(error, { source: "webhook.payment" })
    // Always return 200 to prevent Paystack retries on processing errors
    return NextResponse.json({ received: true })
  }
}

// ─────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────

async function handleChargeSuccess(data: PaystackEvent["data"]) {
  const metadata = data.metadata
  if (!metadata?.organizationId) {
    console.error("[payment-webhook] charge.success missing organizationId in metadata")
    return
  }

  const orgId = metadata.organizationId as string
  const type = metadata.type as string

  if (type === "credit_purchase") {
    await processCreditPurchase(orgId, data, metadata)
  } else if (type === "plan_subscription") {
    await processPlanSubscription(orgId, data, metadata)
  }
}

async function processCreditPurchase(
  orgId: string,
  data: PaystackEvent["data"],
  metadata: Record<string, unknown>
) {
  const credits = metadata.credits as number
  const packId = metadata.packId as string
  const pack = CREDIT_PACKS.find((p) => p.id === packId)
  const netCents = (metadata.netCents as number) ?? Math.round(data.amount / (1 + VAT_RATE))
  const vatCents = (metadata.vatCents as number) ?? data.amount - netCents

  // Create invoice
  const now = new Date()
  const invoice = await db.invoice.create({
    data: {
      amountCents: netCents,
      vatCents,
      totalCents: data.amount,
      status: "PAID",
      billingCycle: "MONTHLY", // One-time, but needs a value
      periodStart: now,
      periodEnd: now,
      dueAt: now,
      paidAt: data.paid_at ? new Date(data.paid_at) : now,
      externalPaymentId: data.reference,
      lineItems: [
        {
          description: `${credits} AI Classification Credits${pack ? ` (${pack.id})` : ""}`,
          quantity: 1,
          unitPriceCents: netCents,
          totalCents: netCents,
        },
        {
          description: "VAT (15%)",
          quantity: 1,
          unitPriceCents: vatCents,
          totalCents: vatCents,
        },
      ],
      organizationId: orgId,
    },
  })

  // Grant credits
  await grantCredits(orgId, credits, `Purchased ${credits} AI credits`, {
    invoiceId: invoice.id,
    performedById: metadata.userId as string | undefined,
    type: "PURCHASE",
  })

  console.log(`[payment-webhook] Granted ${credits} credits to org ${orgId}`)
}

async function processPlanSubscription(
  orgId: string,
  data: PaystackEvent["data"],
  metadata: Record<string, unknown>
) {
  const targetTier = metadata.targetTier as PlanTier
  const cycle = metadata.cycle as BillingCycle
  const plan = PLAN_DEFINITIONS[targetTier]
  const netCents = (metadata.netCents as number) ?? Math.round(data.amount / (1 + VAT_RATE))
  const vatCents = (metadata.vatCents as number) ?? data.amount - netCents

  const now = new Date()
  const periodEnd = cycle === "ANNUAL" ? addDays(now, 365) : addDays(now, 30)

  // Update subscription
  await db.subscription.update({
    where: { organizationId: orgId },
    data: {
      plan: targetTier,
      status: "ACTIVE",
      billingCycle: cycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null, // Clear trial
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
      externalSubId: data.subscription_code ?? data.reference,
    },
  })

  // Create fresh usage record for the new period
  await snapshotResourceCounts(orgId, now, periodEnd)

  // Create invoice
  await db.invoice.create({
    data: {
      amountCents: netCents,
      vatCents,
      totalCents: data.amount,
      status: "PAID",
      billingCycle: cycle,
      periodStart: now,
      periodEnd,
      dueAt: now,
      paidAt: data.paid_at ? new Date(data.paid_at) : now,
      externalPaymentId: data.reference,
      lineItems: [
        {
          description: `${plan.name} Plan — ${cycle === "ANNUAL" ? "Annual" : "Monthly"}`,
          quantity: 1,
          unitPriceCents: netCents,
          totalCents: netCents,
        },
        {
          description: "VAT (15%)",
          quantity: 1,
          unitPriceCents: vatCents,
          totalCents: vatCents,
        },
      ],
      organizationId: orgId,
    },
  })

  // Notify org owners
  await notifyOrgAdmins(
    orgId,
    "Plan activated",
    `Your ${plan.name} plan (${cycle.toLowerCase()}) is now active.`,
    "SYSTEM"
  )

  console.log(`[payment-webhook] Activated ${targetTier}/${cycle} for org ${orgId}`)
}

async function handleChargeFailed(data: PaystackEvent["data"]) {
  const metadata = data.metadata
  if (!metadata?.organizationId) return

  const orgId = metadata.organizationId as string

  // Only set PAST_DUE for subscription payments, not credit packs
  if (metadata.type !== "plan_subscription") return

  const now = new Date()
  const gracePeriodEnd = addDays(now, GRACE_PERIOD_DAYS)

  await db.subscription.update({
    where: { organizationId: orgId },
    data: {
      status: "PAST_DUE",
      gracePeriodEndsAt: gracePeriodEnd,
    },
  })

  await notifyOrgAdmins(
    orgId,
    "Payment failed",
    `Your subscription payment failed. You have ${GRACE_PERIOD_DAYS} days to update your payment method before your account is suspended.`,
    "SUBSCRIPTION_PAYMENT_FAILED"
  )

  console.log(`[payment-webhook] Set PAST_DUE + ${GRACE_PERIOD_DAYS}d grace for org ${orgId}`)
}

async function handleSubscriptionDisabled(data: PaystackEvent["data"]) {
  // Find org by external subscription ID
  const sub = await db.subscription.findFirst({
    where: {
      externalSubId: data.subscription_code,
    },
  })

  if (!sub) {
    console.log(`[payment-webhook] No subscription found for code: ${data.subscription_code}`)
    return
  }

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      status: "CANCELLED",
      cancelAtPeriodEnd: true,
    },
  })

  await notifyOrgAdmins(
    sub.organizationId,
    "Subscription cancelled",
    "Your subscription has been cancelled. You can still access your data until the end of the current billing period.",
    "SUBSCRIPTION_CANCELLED"
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function notifyOrgAdmins(
  orgId: string,
  title: string,
  message: string,
  type: NotificationType
) {
  const orgManagers = await db.organizationUser.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { userId: true },
  })

  const mgrIds = orgManagers.map((m) => m.userId)
  const [inAppIds, emailIds] = await Promise.all([
    filterEnabledUsers(mgrIds, type, "IN_APP"),
    filterEnabledUsers(mgrIds, type, "EMAIL"),
  ])

  for (const userId of inAppIds) {
    await db.notification.create({
      data: { title, message, type, userId, organizationId: orgId },
    })
  }

  for (const userId of emailIds) {
    sendNotificationEmail({ userId, title, message, type })
  }
}

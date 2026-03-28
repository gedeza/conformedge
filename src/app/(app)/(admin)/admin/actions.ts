"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"
import type { ActionResult } from "@/types"
import { logAdminAction } from "@/lib/admin-audit"
import { sendReferralWelcomeEmail } from "@/lib/email"

// ─────────────────────────────────────────────
// OVERVIEW METRICS
// ─────────────────────────────────────────────

export async function getAdminOverview() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalOrgs,
    totalUsers,
    activeSubscriptions,
    trialSubscriptions,
    totalPartners,
    totalDocuments,
    totalCapas,
    totalIncidents,
    recentOrgs,
    recentUsers,
    subscriptionsByPlan,
  ] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "TRIALING" } }),
    db.partner.count({ where: { status: "ACTIVE" } }),
    db.document.count(),
    db.capa.count(),
    db.incident.count(),
    db.organization.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: true,
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
    }),
  ])

  // Calculate MRR from active subscriptions
  const subscriptions = await db.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { plan: true },
  })

  // Plan prices in cents
  const planPrices: Record<string, number> = {
    STARTER: 229900,
    PROFESSIONAL: 549900,
    BUSINESS: 849900,
    ENTERPRISE: 1699900,
  }

  const mrrCents = subscriptions.reduce(
    (sum, s) => sum + (planPrices[s.plan] ?? 0),
    0
  )

  // Partner MRR
  const partnerInvoices = await db.partnerInvoice.findMany({
    where: {
      status: { in: ["OPEN", "PAID"] },
      periodStart: { gte: thirtyDaysAgo },
    },
    select: { totalCents: true },
  })
  const partnerMrrCents = partnerInvoices.reduce((sum, i) => sum + i.totalCents, 0)

  return {
    totalOrgs,
    totalUsers,
    activeSubscriptions,
    trialSubscriptions,
    totalPartners,
    totalDocuments,
    totalCapas,
    totalIncidents,
    recentOrgs,
    recentUsers,
    mrrCents,
    partnerMrrCents,
    subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
      plan: s.plan,
      count: s._count,
    })),
  }
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

export async function getAdminOrganizations() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      createdAt: true,
      subscription: {
        select: { plan: true, status: true, trialEndsAt: true },
      },
      _count: {
        select: {
          members: { where: { isActive: true } },
          documents: true,
          capas: true,
          incidents: true,
        },
      },
      partnerOrganizations: {
        where: { isActive: true },
        select: {
          partner: { select: { name: true, tier: true } },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAdminOrgDetail(orgId: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  return db.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      creditBalance: true,
      accountBalance: true,
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              lastLoginAt: true,
              isSuperAdmin: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          checklists: true,
          vendors: true,
          incidents: true,
          objectives: true,
          workPermits: true,
          projects: true,
        },
      },
      partnerOrganizations: {
        where: { isActive: true },
        include: {
          partner: { select: { id: true, name: true, tier: true, status: true } },
        },
      },
      usageRecords: {
        orderBy: { periodStart: "desc" },
        take: 3,
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
}

// ─────────────────────────────────────────────
// SUBSCRIPTION MANAGEMENT
// ─────────────────────────────────────────────

const updateSubscriptionSchema = z.object({
  orgId: z.string().uuid(),
  plan: z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]).optional(),
  status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "PAUSED"]).optional(),
  paymentMethod: z.enum(["PAYSTACK", "EFT", "INVOICE", "PREPAID"]).optional(),
  paymentTermsDays: z.number().int().nullable().optional(),
})

export async function adminUpdateSubscription(
  data: z.infer<typeof updateSubscriptionSchema>
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const parsed = updateSubscriptionSchema.parse(data)

    const sub = await db.subscription.findUnique({
      where: { organizationId: parsed.orgId },
    })
    if (!sub) return { success: false, error: "No subscription found for this organization" }

    await db.subscription.update({
      where: { organizationId: parsed.orgId },
      data: {
        ...(parsed.plan && { plan: parsed.plan }),
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.paymentMethod && { paymentMethod: parsed.paymentMethod }),
        ...(parsed.paymentTermsDays !== undefined && { paymentTermsDays: parsed.paymentTermsDays }),
      },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "UPDATE_SUBSCRIPTION",
      targetType: "Organization",
      targetId: parsed.orgId,
      metadata: {
        plan: parsed.plan ?? "unchanged",
        status: parsed.status ?? "unchanged",
        paymentMethod: parsed.paymentMethod ?? "unchanged",
        paymentTermsDays: parsed.paymentTermsDays ?? "unchanged",
      },
      organizationId: parsed.orgId,
    })

    revalidatePath(`/admin/organizations/${parsed.orgId}`)
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (err) {
    console.error("adminUpdateSubscription error:", err)
    return { success: false, error: "Failed to update subscription" }
  }
}

// ─────────────────────────────────────────────
// INVOICE MANAGEMENT (EFT / INVOICE payments)
// ─────────────────────────────────────────────

export async function adminMarkInvoicePaid(
  invoiceId: string,
  bankReference?: string
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, status: true, organizationId: true, totalCents: true },
    })
    if (!invoice) return { success: false, error: "Invoice not found" }
    if (invoice.status === "PAID") return { success: false, error: "Invoice is already paid" }

    const now = new Date()

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: now,
        ...(bankReference && { bankReference }),
      },
    })

    // Auto-activate subscription if it's not currently active
    // This is critical for EFT/INVOICE clients where payment confirmation is manual
    const sub = await db.subscription.findUnique({
      where: { organizationId: invoice.organizationId },
    })
    if (sub && !["ACTIVE", "TRIALING"].includes(sub.status)) {
      const periodEnd = sub.billingCycle === "ANNUAL"
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

      await db.subscription.update({
        where: { organizationId: invoice.organizationId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gracePeriodEndsAt: null,
          trialEndsAt: null,
        },
      })

      logAdminAction({
        adminUserId: ctx.dbUserId,
        action: "SUBSCRIPTION_AUTO_ACTIVATED",
        targetType: "Subscription",
        targetId: sub.id,
        metadata: { trigger: "invoice_paid", invoiceId, previousStatus: sub.status },
        organizationId: invoice.organizationId,
      })
    }

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "MARK_INVOICE_PAID",
      targetType: "Invoice",
      targetId: invoiceId,
      metadata: { bankReference: bankReference ?? null, totalCents: invoice.totalCents },
      organizationId: invoice.organizationId,
    })

    revalidatePath(`/admin/organizations/${invoice.organizationId}`)
    revalidatePath("/admin/invoices")
    return { success: true }
  } catch (err) {
    console.error("adminMarkInvoicePaid error:", err)
    return { success: false, error: "Failed to mark invoice as paid" }
  }
}

export async function adminCreateManualInvoice(orgId: string): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const sub = await db.subscription.findUnique({
      where: { organizationId: orgId },
      include: { organization: { select: { name: true } } },
    })
    if (!sub) return { success: false, error: "No subscription found" }

    const { PLAN_DEFINITIONS, VAT_RATE } = await import("@/lib/billing/plans")
    const plan = PLAN_DEFINITIONS[sub.plan as keyof typeof PLAN_DEFINITIONS]
    if (!plan?.monthlyPriceZar) return { success: false, error: "Cannot generate invoice for Enterprise plan (custom pricing)" }

    const totalCents = plan.monthlyPriceZar
    const netCents = Math.round(totalCents / (1 + VAT_RATE))
    const vatCents = totalCents - netCents

    const dueAt = sub.paymentTermsDays
      ? new Date(Date.now() + sub.paymentTermsDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days for EFT

    const invoice = await db.invoice.create({
      data: {
        amountCents: netCents,
        vatCents,
        totalCents,
        status: "OPEN",
        billingCycle: sub.billingCycle,
        periodStart: sub.currentPeriodStart,
        periodEnd: sub.currentPeriodEnd,
        dueAt,
        lineItems: [
          {
            description: `${plan.name} Plan — ${sub.billingCycle === "ANNUAL" ? "Annual" : "Monthly"}`,
            quantity: 1,
            unitPriceCents: netCents,
            totalCents: netCents,
          },
          {
            description: `VAT (${Math.round(VAT_RATE * 100)}%)`,
            quantity: 1,
            unitPriceCents: vatCents,
            totalCents: vatCents,
          },
        ],
        organizationId: orgId,
      },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "CREATE_MANUAL_INVOICE",
      targetType: "Invoice",
      targetId: invoice.id,
      metadata: { totalCents, plan: sub.plan },
      organizationId: orgId,
    })

    revalidatePath(`/admin/organizations/${orgId}`)
    revalidatePath("/admin/invoices")
    return { success: true }
  } catch (err) {
    console.error("adminCreateManualInvoice error:", err)
    return { success: false, error: "Failed to create invoice" }
  }
}

// ─────────────────────────────────────────────
// ACCOUNT BALANCE (Prepaid)
// ─────────────────────────────────────────────

export async function adminFundAccount(
  orgId: string,
  amountCents: number,
  description: string
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    if (amountCents === 0) return { success: false, error: "Amount cannot be zero" }
    if (!description.trim()) return { success: false, error: "Description is required" }

    const isFunding = amountCents > 0
    const type = isFunding ? "FUND" : "ADJUSTMENT"

    await db.$transaction(async (tx) => {
      const balance = await tx.accountBalance.upsert({
        where: { organizationId: orgId },
        update: {
          balanceCents: { increment: amountCents },
          ...(isFunding && { lifetimeFundedCents: { increment: amountCents } }),
          ...(!isFunding && { lifetimeDeductedCents: { increment: Math.abs(amountCents) } }),
        },
        create: {
          organizationId: orgId,
          balanceCents: amountCents,
          lifetimeFundedCents: isFunding ? amountCents : 0,
          lifetimeDeductedCents: isFunding ? 0 : Math.abs(amountCents),
        },
      })

      await tx.accountTransaction.create({
        data: {
          type: type as "FUND" | "ADJUSTMENT",
          amountCents,
          balanceAfterCents: balance.balanceCents,
          description: `[Admin] ${description.trim()}`,
          performedById: ctx.dbUserId,
          organizationId: orgId,
        },
      })
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "FUND_ACCOUNT",
      targetType: "Organization",
      targetId: orgId,
      metadata: { amountCents, description },
      organizationId: orgId,
    })

    revalidatePath(`/admin/organizations/${orgId}`)
    return { success: true }
  } catch (err) {
    console.error("adminFundAccount error:", err)
    return { success: false, error: "Failed to fund account" }
  }
}

export async function getAccountBalance(orgId: string) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const balance = await db.accountBalance.findUnique({
    where: { organizationId: orgId },
  })

  const transactions = await db.accountTransaction.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return { balance, transactions }
}

const adjustCreditsSchema = z.object({
  orgId: z.string().uuid(),
  amount: z.number().int(),
  description: z.string().min(1).max(500),
})

export async function adminAdjustCredits(
  data: z.infer<typeof adjustCreditsSchema>
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const parsed = adjustCreditsSchema.parse(data)

    await db.$transaction(async (tx) => {
      const balance = await tx.creditBalance.upsert({
        where: { organizationId: parsed.orgId },
        update: {
          balance: { increment: parsed.amount },
          lifetimeEarned: parsed.amount > 0 ? { increment: parsed.amount } : undefined,
        },
        create: {
          organizationId: parsed.orgId,
          balance: parsed.amount,
          lifetimeEarned: Math.max(0, parsed.amount),
        },
      })

      await tx.creditTransaction.create({
        data: {
          type: "ADJUSTMENT",
          amount: parsed.amount,
          balanceAfter: balance.balance,
          description: `[Admin] ${parsed.description}`,
          organizationId: parsed.orgId,
        },
      })
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "ADJUST_CREDITS",
      targetType: "Organization",
      targetId: parsed.orgId,
      metadata: { amount: parsed.amount, description: parsed.description },
      organizationId: parsed.orgId,
    })

    revalidatePath(`/admin/organizations/${parsed.orgId}`)
    return { success: true }
  } catch (err) {
    console.error("adminAdjustCredits error:", err)
    return { success: false, error: "Failed to adjust credits" }
  }
}

// ─────────────────────────────────────────────
// SUSPEND / REACTIVATE ORGANIZATION
// ─────────────────────────────────────────────

export async function adminSuspendOrganization(
  orgId: string,
  suspend: boolean
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { id: true, subscription: { select: { id: true, status: true } } },
    })
    if (!org) return { success: false, error: "Organization not found" }

    if (suspend) {
      // Suspend: set subscription to PAUSED
      if (org.subscription) {
        await db.subscription.update({
          where: { id: org.subscription.id },
          data: { status: "PAUSED" },
        })
      }
    } else {
      // Reactivate: set subscription to ACTIVE
      if (org.subscription) {
        await db.subscription.update({
          where: { id: org.subscription.id },
          data: { status: "ACTIVE" },
        })
      }
    }

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: suspend ? "SUSPEND_ORGANIZATION" : "REACTIVATE_ORGANIZATION",
      targetType: "Organization",
      targetId: orgId,
      organizationId: orgId,
    })

    revalidatePath(`/admin/organizations/${orgId}`)
    revalidatePath("/admin/organizations")
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (err) {
    console.error("adminSuspendOrganization error:", err)
    return { success: false, error: `Failed to ${suspend ? "suspend" : "reactivate"} organization` }
  }
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getAdminUsers() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isSuperAdmin: true,
      lastLoginAt: true,
      createdAt: true,
      memberships: {
        where: { isActive: true },
        select: {
          role: true,
          organization: { select: { name: true } },
        },
      },
      partnerUsers: {
        where: { isActive: true },
        select: {
          role: true,
          partner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function adminToggleSuperAdmin(
  userId: string,
  isSuperAdmin: boolean
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    // Prevent removing your own superadmin access
    if (userId === ctx.dbUserId && !isSuperAdmin) {
      return { success: false, error: "Cannot remove your own super admin access" }
    }

    await db.user.update({
      where: { id: userId },
      data: { isSuperAdmin },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: isSuperAdmin ? "GRANT_SUPER_ADMIN" : "REVOKE_SUPER_ADMIN",
      targetType: "User",
      targetId: userId,
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    console.error("adminToggleSuperAdmin error:", err)
    return { success: false, error: "Failed to update user" }
  }
}

// ─────────────────────────────────────────────
// SUBSCRIPTIONS LIST
// ─────────────────────────────────────────────

export async function getAdminSubscriptions() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.subscription.findMany({
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─────────────────────────────────────────────
// PARTNERS LIST
// ─────────────────────────────────────────────

export async function getAdminPartners() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return []

  return db.partner.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      tier: true,
      status: true,
      contactEmail: true,
      contactPhone: true,
      notes: true,
      description: true,
      createdAt: true,
      approvedAt: true,
      commissionPercent: true,
      basePlatformFeeCents: true,
      bankName: true,
      bankAccountHolder: true,
      bankAccountNumber: true,
      bankBranchCode: true,
      bankAccountType: true,
      _count: {
        select: {
          clientOrganizations: { where: { isActive: true } },
          partnerUsers: { where: { isActive: true } },
          referrals: true,
        },
      },
      referrals: {
        select: { code: true, status: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─────────────────────────────────────────────
// PARTNER APPROVAL / REFERRAL LINK GENERATION
// ─────────────────────────────────────────────

export async function approveReferralPartner(partnerId: string): Promise<ActionResult<{ code: string; url: string; emailSent: boolean; emailError?: string }>> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, slug: true, status: true, tier: true, commissionPercent: true, contactEmail: true, name: true },
  })

  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "APPLIED") {
    return { success: false, error: `Partner status is ${partner.status}, expected APPLIED` }
  }

  // Generate referral code
  const randomPart = Math.random().toString(36).slice(2, 8)
  const code = `${partner.slug}-${randomPart}`
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 90)

  // Generate access token for self-service dashboard
  const accessToken = crypto.randomUUID()

  // Approve partner + create first referral link in a transaction
  await db.$transaction([
    db.partner.update({
      where: { id: partnerId },
      data: { status: "ACTIVE", approvedAt: new Date(), accessToken },
    }),
    db.referral.create({
      data: {
        partnerId,
        code,
        commissionPercent: partner.commissionPercent,
        expiresAt,
      },
    }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const url = `${appUrl}/ref/${code}`
  const dashboardUrl = `${appUrl}/referral/dashboard?token=${accessToken}`

  // Send welcome email with referral link (awaited for feedback)
  const emailResult = await sendReferralWelcomeEmail({
    to: partner.contactEmail,
    partnerName: partner.name,
    referralUrl: url,
    referralCode: code,
    dashboardUrl,
  })

  logAdminAction({
    action: "PARTNER_APPROVED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail, referralCode: code, emailSent: emailResult.sent },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")

  return { success: true, data: { code, url, emailSent: emailResult.sent, emailError: emailResult.error } }
}

export async function rejectReferralPartner(partnerId: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, status: true, name: true, contactEmail: true },
  })

  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "APPLIED") {
    return { success: false, error: `Partner status is ${partner.status}, expected APPLIED` }
  }

  await db.partner.update({
    where: { id: partnerId },
    data: { status: "TERMINATED", terminatedAt: new Date() },
  })

  logAdminAction({
    action: "PARTNER_REJECTED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")

  return { success: true }
}

export async function resendPartnerWelcomeEmail(partnerId: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, contactEmail: true, status: true, accessToken: true, referrals: { select: { code: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  })

  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "ACTIVE") return { success: false, error: "Partner must be active to resend email" }
  if (!partner.referrals[0]) return { success: false, error: "No referral link found" }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const code = partner.referrals[0].code
  const url = `${appUrl}/ref/${code}`
  const dashboardUrl = partner.accessToken ? `${appUrl}/referral/dashboard?token=${partner.accessToken}` : undefined

  const emailResult = await sendReferralWelcomeEmail({
    to: partner.contactEmail,
    partnerName: partner.name,
    referralUrl: url,
    referralCode: code,
    dashboardUrl,
  })

  if (!emailResult.sent) {
    return { success: false, error: emailResult.error || "Failed to send email" }
  }

  logAdminAction({
    action: "PARTNER_EMAIL_RESENT",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail },
    adminUserId: ctx.dbUserId,
  })

  return { success: true }
}

export async function renewReferralLink(partnerId: string): Promise<ActionResult<{ code: string; url: string }>> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, slug: true, status: true, commissionPercent: true, name: true, contactEmail: true },
  })

  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "ACTIVE") {
    return { success: false, error: "Only active partners can have links renewed" }
  }

  const randomPart = Math.random().toString(36).slice(2, 8)
  const code = `${partner.slug}-${randomPart}`
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 90)

  await db.referral.create({
    data: {
      partnerId,
      code,
      commissionPercent: partner.commissionPercent,
      expiresAt,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
  const url = `${appUrl}/ref/${code}`

  logAdminAction({
    action: "REFERRAL_LINK_RENEWED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, referralCode: code },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")

  return { success: true, data: { code, url } }
}

// ─────────────────────────────────────────────
// ADMIN PARTNER EDIT / SUSPEND / TERMINATE
// ─────────────────────────────────────────────

const editPartnerSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  contactEmail: z.email().optional(),
  contactPhone: z.string().max(20).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
})

export async function adminEditPartner(
  partnerId: string,
  values: z.infer<typeof editPartnerSchema>
): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true },
  })
  if (!partner) return { success: false, error: "Partner not found" }

  const parsed = editPartnerSchema.parse(values)
  const data: Record<string, unknown> = {}
  if (parsed.name !== undefined) data.name = parsed.name
  if (parsed.contactEmail !== undefined) data.contactEmail = parsed.contactEmail
  if (parsed.contactPhone !== undefined) data.contactPhone = parsed.contactPhone
  if (parsed.commissionPercent !== undefined) data.commissionPercent = parsed.commissionPercent
  if (parsed.notes !== undefined) data.notes = parsed.notes

  await db.partner.update({ where: { id: partnerId }, data })

  logAdminAction({
    action: "PARTNER_UPDATED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, fields: Object.keys(data) },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")
  return { success: true }
}

export async function adminSuspendPartner(partnerId: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, status: true, contactEmail: true },
  })
  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "ACTIVE") return { success: false, error: `Partner is ${partner.status}, not ACTIVE` }

  await db.partner.update({
    where: { id: partnerId },
    data: { status: "SUSPENDED" },
  })

  logAdminAction({
    action: "PARTNER_SUSPENDED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")
  return { success: true }
}

export async function adminReactivatePartner(partnerId: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, status: true, contactEmail: true },
  })
  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status !== "SUSPENDED") return { success: false, error: `Partner is ${partner.status}, not SUSPENDED` }

  await db.partner.update({
    where: { id: partnerId },
    data: { status: "ACTIVE" },
  })

  logAdminAction({
    action: "PARTNER_REACTIVATED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")
  return { success: true }
}

export async function adminTerminatePartner(partnerId: string): Promise<ActionResult> {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { success: false, error: "Unauthorized" }

  const partner = await db.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, status: true, contactEmail: true },
  })
  if (!partner) return { success: false, error: "Partner not found" }
  if (partner.status === "TERMINATED") return { success: false, error: "Already terminated" }

  await db.partner.update({
    where: { id: partnerId },
    data: { status: "TERMINATED", terminatedAt: new Date() },
  })

  logAdminAction({
    action: "PARTNER_TERMINATED",
    targetType: "Partner",
    targetId: partnerId,
    metadata: { name: partner.name, email: partner.contactEmail },
    adminUserId: ctx.dbUserId,
  })

  revalidatePath("/admin/partners")
  revalidatePath("/admin/referrals")
  return { success: true }
}

// ─────────────────────────────────────────────
// REVENUE DATA
// ─────────────────────────────────────────────

export async function getAdminRevenue() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const now = new Date()

  // Get all active/trialing subscriptions with plan info
  const subscriptions = await db.subscription.findMany({
    where: { status: { in: ["ACTIVE", "TRIALING"] } },
    select: { plan: true, status: true, billingCycle: true, createdAt: true },
  })

  // Plan prices in cents (monthly)
  const planPrices: Record<string, number> = {
    STARTER: 229900,
    PROFESSIONAL: 549900,
    BUSINESS: 849900,
    ENTERPRISE: 1699900,
  }

  // Calculate MRR
  const mrrCents = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + (planPrices[s.plan] ?? 0), 0)

  // ARR = MRR * 12
  const arrCents = mrrCents * 12

  // Plan distribution
  const planDistribution = Object.entries(
    subscriptions.reduce(
      (acc, s) => {
        acc[s.plan] = (acc[s.plan] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  ).map(([plan, count]) => ({
    plan,
    count,
    revenue: count * (planPrices[plan] ?? 0),
  }))

  // Monthly revenue trend (last 6 months) from invoices
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const invoices = await db.invoice.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      status: { in: ["PAID", "OPEN"] },
    },
    select: { amountCents: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  // Group by month
  const monthlyRevenue: { month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const monthLabel = d.toLocaleDateString("en-ZA", {
      month: "short",
      year: "2-digit",
    })
    const monthInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt)
      return (
        invDate.getFullYear() === d.getFullYear() &&
        invDate.getMonth() === d.getMonth()
      )
    })
    monthlyRevenue.push({
      month: monthLabel,
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.amountCents, 0),
    })
  }

  // Partner revenue
  const partnerInvoices = await db.partnerInvoice.findMany({
    where: {
      status: { in: ["OPEN", "PAID"] },
      periodStart: { gte: sixMonthsAgo },
    },
    select: { totalCents: true, createdAt: true },
  })
  const partnerMrrCents = partnerInvoices.reduce(
    (sum, i) => sum + i.totalCents,
    0
  )

  // Churn: cancelled in last 30 days
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cancelledCount = await db.subscription.count({
    where: { status: "CANCELLED", updatedAt: { gte: thirtyDaysAgo } },
  })
  const totalActive = subscriptions.filter((s) => s.status === "ACTIVE").length
  const churnRate =
    totalActive > 0
      ? (cancelledCount / (totalActive + cancelledCount)) * 100
      : 0

  return {
    mrrCents,
    arrCents,
    partnerMrrCents,
    totalMrrCents: mrrCents + partnerMrrCents,
    planDistribution,
    monthlyRevenue,
    churnRate: Math.round(churnRate * 10) / 10,
    totalActive,
    totalTrialing: subscriptions.filter((s) => s.status === "TRIALING").length,
    cancelledCount,
  }
}

// ─────────────────────────────────────────────
// ADMIN REFERRAL MANAGEMENT
// ─────────────────────────────────────────────

export async function getAdminReferrals() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { partners: [], totals: { totalReferrals: 0, conversions: 0, totalCommissionCents: 0, unpaidCommissionCents: 0, paidCommissionCents: 0 } }

  const partners = await db.partner.findMany({
    where: { tier: "REFERRAL" },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      commissionPercent: true,
      accessToken: true,
      createdAt: true,
      approvedAt: true,
      referrals: {
        select: {
          id: true,
          code: true,
          status: true,
          referredEmail: true,
          referredCompany: true,
          clickCount: true,
          commissionCents: true,
          commissionMonthsEarned: true,
          commissionPaidAt: true,
          convertedAt: true,
          expiresAt: true,
          createdAt: true,
          referredOrg: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate totals
  const allReferrals = partners.flatMap(p => p.referrals)
  const converted = allReferrals.filter(r => r.status === "CONVERTED")
  const totalCommissionCents = converted.reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)
  const paidCommissionCents = converted.filter(r => r.commissionPaidAt).reduce((sum, r) => sum + (r.commissionCents ?? 0), 0)

  return {
    partners,
    totals: {
      totalReferrals: allReferrals.length,
      conversions: converted.length,
      totalCommissionCents,
      unpaidCommissionCents: totalCommissionCents - paidCommissionCents,
      paidCommissionCents,
    },
  }
}

// ─────────────────────────────────────────────
// CROSS-ORG AUDIT TRAIL
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// COMMISSION PAYOUT
// ─────────────────────────────────────────────

export async function adminMarkCommissionPaid(
  referralId: string,
  bankReference: string
): Promise<ActionResult> {
  try {
    const ctx = await getSuperAdminContext()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const referral = await db.referral.findUnique({
      where: { id: referralId },
      select: { id: true, status: true, commissionCents: true, commissionPaidAt: true, partnerId: true },
    })
    if (!referral) return { success: false, error: "Referral not found" }
    if (referral.status !== "CONVERTED") return { success: false, error: "Referral is not converted" }
    if (referral.commissionPaidAt) return { success: false, error: "Commission already paid" }
    if (!referral.commissionCents) return { success: false, error: "No commission to pay" }

    await db.referral.update({
      where: { id: referralId },
      data: {
        commissionPaidAt: new Date(),
      },
    })

    logAdminAction({
      adminUserId: ctx.dbUserId,
      action: "COMMISSION_PAID",
      targetType: "Referral",
      targetId: referralId,
      metadata: { bankReference, commissionCents: referral.commissionCents, partnerId: referral.partnerId },
    })

    revalidatePath("/admin/partners")
    revalidatePath("/admin/referrals")
    return { success: true }
  } catch (err) {
    console.error("adminMarkCommissionPaid error:", err)
    return { success: false, error: "Failed to mark commission as paid" }
  }
}

// ─────────────────────────────────────────────
// CROSS-ORG AUDIT TRAIL
// ─────────────────────────────────────────────

/**
 * T26 — Track user seat distribution across Business tier clients.
 * Purpose: Inform future "Growth" tier decision (15-50 user gap).
 * Trigger: 20-35% of Business customers using <25 seats after 6 months.
 */
export async function getGrowthTierAnalytics() {
  const ctx = await getSuperAdminContext()
  if (!ctx) return null

  const businessSubs = await db.subscription.findMany({
    where: { plan: "BUSINESS", status: { in: ["ACTIVE", "TRIALING"] } },
    select: {
      organizationId: true,
      organization: {
        select: {
          name: true,
          _count: { select: { members: { where: { isActive: true } } } },
        },
      },
    },
  })

  const distribution = businessSubs.map(s => ({
    orgName: s.organization.name,
    activeUsers: s.organization._count.members,
  }))

  const totalBusiness = distribution.length
  const under25 = distribution.filter(d => d.activeUsers < 25).length
  const percentUnder25 = totalBusiness > 0 ? Math.round((under25 / totalBusiness) * 100) : 0

  return {
    totalBusinessClients: totalBusiness,
    distribution,
    under25Users: under25,
    percentUnder25,
    growthTierRecommended: totalBusiness >= 5 && percentUnder25 >= 20 && percentUnder25 <= 35,
  }
}

export async function getAdminAuditTrail(params: {
  q?: string
  limit?: number
  offset?: number
}) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return { events: [], total: 0 }

  const limit = params.limit ?? 50
  const offset = params.offset ?? 0

  const where: Record<string, unknown> = {}
  if (params.q) {
    where.OR = [
      { action: { contains: params.q, mode: "insensitive" } },
      { entityType: { contains: params.q, mode: "insensitive" } },
      { user: { email: { contains: params.q, mode: "insensitive" } } },
    ]
  }

  const [events, total] = await Promise.all([
    db.auditTrailEvent.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    db.auditTrailEvent.count({ where }),
  ])

  return { events, total }
}

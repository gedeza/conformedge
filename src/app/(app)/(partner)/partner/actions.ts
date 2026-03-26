"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getPartnerContext, validatePartnerOrgAccess } from "@/lib/partner-auth"
import { logAuditEvent } from "@/lib/audit"
import { isPartnerAdmin, canPartnerEdit } from "@/lib/permissions"
import { PARTNER_BASE_FEES } from "@/lib/constants"
import { createPartnerAlert, checkUserSpikeAlert } from "@/lib/billing/partner-compliance"
import { addDays } from "date-fns"
import type { ActionResult, PartnerTier, PartnerRole, PartnerClientSize, PlanTier } from "@/types"

/** Maps partner clientSize to the subscription PlanTier the org should be on */
const CLIENT_SIZE_TO_PLAN: Record<PartnerClientSize, PlanTier> = {
  SMALL: "STARTER",
  MEDIUM: "PROFESSIONAL",
  LARGE: "BUSINESS",
}

/**
 * Sync a client org's subscription tier to match the declared clientSize.
 * Activates the subscription if it's still trialing/inactive.
 * This ensures feature gates match what the partner is paying for.
 */
async function syncClientSubscription(organizationId: string, clientSize: PartnerClientSize) {
  const targetPlan = CLIENT_SIZE_TO_PLAN[clientSize]
  const now = new Date()
  const periodEnd = addDays(now, 30)

  await db.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      plan: targetPlan,
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan: targetPlan,
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  })
}

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const createPartnerSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  tier: z.enum(["CONSULTING", "WHITE_LABEL", "REFERRAL"]),
  contactEmail: z.email(),
  contactPhone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  registrationNumber: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  basePlatformFeeCents: z.number().int().min(0).optional(),
  defaultSmallFeeCents: z.number().int().min(0).optional(),
  defaultMediumFeeCents: z.number().int().min(0).optional(),
  defaultLargeFeeCents: z.number().int().min(0).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
})

const addClientOrgSchema = z.object({
  organizationId: z.string().uuid(),
  clientSize: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  customFeeCents: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(1000).optional(),
})

const addPartnerUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["PARTNER_ADMIN", "PARTNER_MANAGER", "PARTNER_VIEWER"]),
})

// ─────────────────────────────────────────────
// PARTNER CRUD (Platform Admin only)
// ─────────────────────────────────────────────

export async function createPartner(values: z.infer<typeof createPartnerSchema>): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (role !== "OWNER" && role !== "ADMIN") {
      return { success: false, error: "Only platform admins can create partners" }
    }

    const parsed = createPartnerSchema.parse(values)

    // Check slug uniqueness
    const existing = await db.partner.findUnique({ where: { slug: parsed.slug } })
    if (existing) {
      return { success: false, error: "A partner with this slug already exists" }
    }

    const tier = parsed.tier as PartnerTier
    const baseFee = parsed.basePlatformFeeCents ?? PARTNER_BASE_FEES[tier]

    const partner = await db.partner.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        tier,
        contactEmail: parsed.contactEmail,
        contactPhone: parsed.contactPhone || null,
        website: parsed.website || null,
        registrationNumber: parsed.registrationNumber || null,
        description: parsed.description || null,
        basePlatformFeeCents: baseFee,
        defaultSmallFeeCents: parsed.defaultSmallFeeCents ?? 149900,   // R1,499 Essentials
        defaultMediumFeeCents: parsed.defaultMediumFeeCents ?? 199900, // R1,999 Professional
        defaultLargeFeeCents: parsed.defaultLargeFeeCents ?? 299900,   // R2,999 Business
        commissionPercent: parsed.commissionPercent ?? 10,
      },
    })

    logAuditEvent({
      action: "PARTNER_CREATED",
      entityType: "Partner",
      entityId: partner.id,
      metadata: { name: parsed.name, tier },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/partner")
    return { success: true, data: { id: partner.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" }
    }
    console.error("createPartner error:", err)
    return { success: false, error: "Failed to create partner" }
  }
}

export async function updatePartnerStatus(
  partnerId: string,
  status: "APPROVED" | "ACTIVE" | "SUSPENDED" | "TERMINATED"
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (role !== "OWNER" && role !== "ADMIN") {
      return { success: false, error: "Only platform admins can update partner status" }
    }

    const partner = await db.partner.findUnique({ where: { id: partnerId } })
    if (!partner) return { success: false, error: "Partner not found" }

    const updateData: Record<string, unknown> = { status }
    if (status === "APPROVED") updateData.approvedAt = new Date()
    if (status === "TERMINATED") updateData.terminatedAt = new Date()

    await db.partner.update({
      where: { id: partnerId },
      data: updateData,
    })

    logAuditEvent({
      action: "PARTNER_STATUS_CHANGED",
      entityType: "Partner",
      entityId: partnerId,
      metadata: { from: partner.status, to: status },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/partner")
    return { success: true }
  } catch (err) {
    console.error("updatePartnerStatus error:", err)
    return { success: false, error: "Failed to update partner status" }
  }
}

export async function getPartner(partnerId: string) {
  return db.partner.findUnique({
    where: { id: partnerId },
    include: {
      clientOrganizations: {
        include: {
          organization: {
            select: { id: true, name: true, slug: true, industry: true },
          },
        },
        orderBy: { onboardedAt: "desc" },
      },
      partnerUsers: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true },
          },
        },
      },
    },
  })
}

export async function getPartners() {
  return db.partner.findMany({
    include: {
      _count: {
        select: {
          clientOrganizations: { where: { isActive: true } },
          partnerUsers: { where: { isActive: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ─────────────────────────────────────────────
// CLIENT ORG MANAGEMENT (Partner Admin)
// ─────────────────────────────────────────────

export async function addClientOrganization(
  values: z.infer<typeof addClientOrgSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can add client organizations" }
    }

    const parsed = addClientOrgSchema.parse(values)

    // Verify the org exists
    const org = await db.organization.findUnique({
      where: { id: parsed.organizationId },
      select: { id: true, name: true },
    })
    if (!org) return { success: false, error: "Organization not found" }

    // Check not already linked to another partner
    const existingLink = await db.partnerOrganization.findFirst({
      where: { organizationId: parsed.organizationId, isActive: true },
      include: { partner: { select: { name: true } } },
    })
    if (existingLink) {
      return {
        success: false,
        error: `This organization is already managed by ${existingLink.partner.name}`,
      }
    }

    // Check max client orgs limit
    const partner = await db.partner.findUnique({
      where: { id: ctx.partnerId },
      select: { maxClientOrgs: true },
    })
    if (partner?.maxClientOrgs) {
      const currentCount = await db.partnerOrganization.count({
        where: { partnerId: ctx.partnerId, isActive: true },
      })
      if (currentCount >= partner.maxClientOrgs) {
        return { success: false, error: `Maximum client organization limit (${partner.maxClientOrgs}) reached` }
      }
    }

    const partnerOrg = await db.partnerOrganization.upsert({
      where: {
        partnerId_organizationId: {
          partnerId: ctx.partnerId,
          organizationId: parsed.organizationId,
        },
      },
      create: {
        partnerId: ctx.partnerId,
        organizationId: parsed.organizationId,
        clientSize: parsed.clientSize as PartnerClientSize,
        customFeeCents: parsed.customFeeCents ?? null,
        notes: parsed.notes || null,
      },
      update: {
        isActive: true,
        clientSize: parsed.clientSize as PartnerClientSize,
        customFeeCents: parsed.customFeeCents ?? null,
        notes: parsed.notes || null,
        disconnectedAt: null,
      },
    })

    // Sync the client org's subscription tier to match the declared clientSize
    // This ensures feature gates align with what the partner is being billed for
    await syncClientSubscription(parsed.organizationId, parsed.clientSize as PartnerClientSize)

    // Check for user spike (new client may bring many users)
    checkUserSpikeAlert(ctx.partnerId).catch(() => {}) // fire-and-forget

    logAuditEvent({
      action: "PARTNER_CLIENT_ADDED",
      entityType: "PartnerOrganization",
      entityId: partnerOrg.id,
      metadata: { orgName: org.name, clientSize: parsed.clientSize },
      userId: ctx.dbUserId,
      organizationId: parsed.organizationId,
    })

    revalidatePath("/partner")
    return { success: true, data: { id: partnerOrg.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" }
    }
    console.error("addClientOrganization error:", err)
    return { success: false, error: "Failed to add client organization" }
  }
}

export async function disconnectClientOrganization(organizationId: string): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can disconnect client organizations" }
    }

    const link = await validatePartnerOrgAccess(ctx.partnerId, organizationId)
    if (!link) return { success: false, error: "Client organization not found" }

    await db.partnerOrganization.update({
      where: { id: link.id },
      data: { isActive: false, disconnectedAt: new Date() },
    })

    logAuditEvent({
      action: "PARTNER_CLIENT_DISCONNECTED",
      entityType: "PartnerOrganization",
      entityId: link.id,
      metadata: { organizationId },
      userId: ctx.dbUserId,
      organizationId,
    })

    // Fire CLIENT_CHURN alert for compliance monitor
    createPartnerAlert(
      ctx.partnerId,
      "CLIENT_CHURN",
      "MEDIUM",
      "Client organization disconnected",
      `A client organization was disconnected from the partner portfolio. Review whether this indicates churn risk.`,
      { organizationId, disconnectedAt: new Date().toISOString() }
    ).catch(() => {}) // fire-and-forget

    revalidatePath("/partner")
    return { success: true }
  } catch (err) {
    console.error("disconnectClientOrganization error:", err)
    return { success: false, error: "Failed to disconnect client organization" }
  }
}

export async function updateClientOrganization(
  organizationId: string,
  data: { clientSize?: PartnerClientSize; customFeeCents?: number | null; notes?: string }
): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can update client settings" }
    }

    const link = await validatePartnerOrgAccess(ctx.partnerId, organizationId)
    if (!link) return { success: false, error: "Client organization not found" }

    await db.partnerOrganization.update({
      where: { id: link.id },
      data: {
        ...(data.clientSize !== undefined && { clientSize: data.clientSize }),
        ...(data.customFeeCents !== undefined && { customFeeCents: data.customFeeCents }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    // If clientSize changed, sync the org's subscription tier to match
    if (data.clientSize) {
      await syncClientSubscription(organizationId, data.clientSize)
    }

    revalidatePath("/partner")
    return { success: true }
  } catch (err) {
    console.error("updateClientOrganization error:", err)
    return { success: false, error: "Failed to update client organization" }
  }
}

// ─────────────────────────────────────────────
// PARTNER USER MANAGEMENT
// ─────────────────────────────────────────────

export async function addPartnerUser(
  values: z.infer<typeof addPartnerUserSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can add partner users" }
    }

    const parsed = addPartnerUserSchema.parse(values)

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, email: true },
    })
    if (!user) return { success: false, error: "User not found" }

    const partnerUser = await db.partnerUser.upsert({
      where: {
        partnerId_userId: {
          partnerId: ctx.partnerId,
          userId: parsed.userId,
        },
      },
      create: {
        partnerId: ctx.partnerId,
        userId: parsed.userId,
        role: parsed.role as PartnerRole,
      },
      update: {
        isActive: true,
        role: parsed.role as PartnerRole,
      },
    })

    // Audit against first client org (partner-level actions don't have a single org context)
    if (ctx.clientOrgIds.length > 0) {
      logAuditEvent({
        action: "PARTNER_USER_ADDED",
        entityType: "PartnerUser",
        entityId: partnerUser.id,
        metadata: { email: user.email, role: parsed.role },
        userId: ctx.dbUserId,
        organizationId: ctx.clientOrgIds[0],
      })
    }

    revalidatePath("/partner")
    return { success: true, data: { id: partnerUser.id } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Validation error" }
    }
    console.error("addPartnerUser error:", err)
    return { success: false, error: "Failed to add partner user" }
  }
}

export async function removePartnerUser(userId: string): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can remove partner users" }
    }

    // Can't remove yourself
    if (userId === ctx.dbUserId) {
      return { success: false, error: "Cannot remove yourself from the partner" }
    }

    const partnerUser = await db.partnerUser.findFirst({
      where: { partnerId: ctx.partnerId, userId, isActive: true },
    })
    if (!partnerUser) return { success: false, error: "Partner user not found" }

    await db.partnerUser.update({
      where: { id: partnerUser.id },
      data: { isActive: false },
    })

    if (ctx.clientOrgIds.length > 0) {
      logAuditEvent({
        action: "PARTNER_USER_REMOVED",
        entityType: "PartnerUser",
        entityId: partnerUser.id,
        metadata: { userId },
        userId: ctx.dbUserId,
        organizationId: ctx.clientOrgIds[0],
      })
    }

    revalidatePath("/partner")
    return { success: true }
  } catch (err) {
    console.error("removePartnerUser error:", err)
    return { success: false, error: "Failed to remove partner user" }
  }
}

/**
 * Get partner users for the team management page.
 */
export async function getPartnerUsers() {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  const users = await db.partnerUser.findMany({
    where: { partnerId: ctx.partnerId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return users
}

/**
 * Update a partner user's role.
 */
export async function updatePartnerUserRole(
  userId: string,
  role: PartnerRole
): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can change roles" }
    }

    if (userId === ctx.dbUserId) {
      return { success: false, error: "Cannot change your own role" }
    }

    const partnerUser = await db.partnerUser.findFirst({
      where: { partnerId: ctx.partnerId, userId },
    })
    if (!partnerUser) return { success: false, error: "Partner user not found" }

    await db.partnerUser.update({
      where: { id: partnerUser.id },
      data: { role },
    })

    revalidatePath("/partner/team")
    return { success: true }
  } catch (err) {
    console.error("updatePartnerUserRole error:", err)
    return { success: false, error: "Failed to update role" }
  }
}

// ─────────────────────────────────────────────
// CROSS-ORG DATA ACCESS (for Partner Dashboard)
// ─────────────────────────────────────────────

/**
 * Get compliance summary across all client organizations.
 * Used by the partner dashboard for cross-org overview.
 */
export async function getClientOrgsSummary() {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  const clientOrgs = await db.partnerOrganization.findMany({
    where: { partnerId: ctx.partnerId, isActive: true },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          _count: {
            select: {
              members: { where: { isActive: true } },
              documents: true,
              assessments: true,
              capas: true,
              incidents: true,
              checklists: true,
              objectives: true,
              workPermits: true,
            },
          },
        },
      },
    },
    orderBy: { onboardedAt: "desc" },
  })

  // Get expiring documents and overdue CAPAs across all client orgs
  const orgIds = clientOrgs.map((co) => co.organizationId)

  const [expiringDocs, overdueCapas, openIncidents] = await Promise.all([
    db.document.count({
      where: {
        organizationId: { in: orgIds },
        expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
        status: { not: "ARCHIVED" },
      },
    }),
    db.capa.count({
      where: {
        organizationId: { in: orgIds },
        status: "OVERDUE",
      },
    }),
    db.incident.count({
      where: {
        organizationId: { in: orgIds },
        status: { not: "CLOSED" },
      },
    }),
  ])

  return {
    clientOrgs,
    alerts: {
      expiringDocs,
      overdueCapas,
      openIncidents,
    },
  }
}

/**
 * Get detailed data for a specific client organization.
 * Partner users access client org data through this function (not getAuthContext).
 */
export async function getClientOrgDetail(organizationId: string) {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  // Validate partner has access to this org
  const link = await validatePartnerOrgAccess(ctx.partnerId, organizationId)
  if (!link) return null

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true },
          },
        },
      },
      _count: {
        select: {
          documents: true,
          assessments: true,
          capas: true,
          incidents: true,
          checklists: true,
          objectives: true,
          workPermits: true,
          subcontractors: true,
        },
      },
    },
  })

  if (!org) return null

  // Get recent activity and compliance data
  const [recentDocs, openCapas, openIncidents, recentAudit] = await Promise.all([
    db.document.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true, expiresAt: true },
    }),
    db.capa.findMany({
      where: { organizationId, status: { in: ["OPEN", "IN_PROGRESS", "OVERDUE"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, priority: true, dueDate: true },
    }),
    db.incident.findMany({
      where: { organizationId, status: { not: "CLOSED" } },
      orderBy: { incidentDate: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, incidentType: true, incidentDate: true },
    }),
    db.auditTrailEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  return {
    organization: org,
    partnerLink: link,
    recentDocs,
    openCapas,
    openIncidents,
    recentAudit,
  }
}

// ─────────────────────────────────────────────
// PARTNER BILLING
// ─────────────────────────────────────────────

export async function getPartnerBillingData() {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  const [partner, invoices, calculation] = await Promise.all([
    db.partner.findUnique({
      where: { id: ctx.partnerId },
      select: {
        name: true,
        tier: true,
        basePlatformFeeCents: true,
        defaultSmallFeeCents: true,
        defaultMediumFeeCents: true,
        defaultLargeFeeCents: true,
        volumeDiscountPercent: true,
        commissionPercent: true,
      },
    }),
    db.partnerInvoice.findMany({
      where: { partnerId: ctx.partnerId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    // Dynamic import to avoid circular deps
    import("@/lib/billing/partner-billing").then((m) => m.calculatePartnerInvoice(ctx.partnerId)),
  ])

  return { partner, invoices, calculation }
}

export async function generateInvoice(): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can generate invoices" }
    }

    const { generatePartnerInvoice } = await import("@/lib/billing/partner-billing")
    const invoiceId = await generatePartnerInvoice(ctx.partnerId)

    if (!invoiceId) return { success: false, error: "Failed to generate invoice" }

    revalidatePath("/partner/billing")
    return { success: true, data: { id: invoiceId } }
  } catch (err) {
    console.error("generateInvoice error:", err)
    return { success: false, error: "Failed to generate invoice" }
  }
}

// ─────────────────────────────────────────────
// P5: BRANDING
// ─────────────────────────────────────────────

const brandingSchema = z.object({
  brandName: z.string().max(100).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").optional(),
})

export async function updatePartnerBranding(
  data: z.infer<typeof brandingSchema>
): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can update branding" }
    }

    const parsed = brandingSchema.parse(data)

    await db.partner.update({
      where: { id: ctx.partnerId },
      data: {
        brandName: parsed.brandName || null,
        primaryColor: parsed.primaryColor || null,
        accentColor: parsed.accentColor || null,
      },
    })

    revalidatePath("/partner/settings")
    revalidatePath("/partner")
    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message ?? "Invalid input" }
    }
    console.error("updatePartnerBranding error:", err)
    return { success: false, error: "Failed to update branding" }
  }
}

export async function getPartnerBrandingData() {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  return db.partner.findUnique({
    where: { id: ctx.partnerId },
    select: {
      tier: true,
      logoKey: true,
      brandName: true,
      primaryColor: true,
      accentColor: true,
    },
  })
}

// ─────────────────────────────────────────────
// P6: REFERRALS
// ─────────────────────────────────────────────

export async function generateReferralLink(): Promise<ActionResult<{ code: string; url: string }>> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can generate referral links" }
    }

    const partner = await db.partner.findUnique({
      where: { id: ctx.partnerId },
      select: { slug: true, commissionPercent: true },
    })
    if (!partner) return { success: false, error: "Partner not found" }

    // Generate unique code: slug-random6
    const randomPart = Math.random().toString(36).slice(2, 8)
    const code = `${partner.slug}-${randomPart}`

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    await db.referral.create({
      data: {
        partnerId: ctx.partnerId,
        code,
        commissionPercent: partner.commissionPercent,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"
    revalidatePath("/partner/referrals")
    return { success: true, data: { code, url: `${appUrl}/ref/${code}` } }
  } catch (err) {
    console.error("generateReferralLink error:", err)
    return { success: false, error: "Failed to generate referral link" }
  }
}

export async function getReferrals() {
  const ctx = await getPartnerContext()
  if (!ctx) return []

  return db.referral.findMany({
    where: { partnerId: ctx.partnerId },
    include: {
      referredOrg: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getReferralSummary() {
  const ctx = await getPartnerContext()
  if (!ctx) return null

  const referrals = await db.referral.findMany({
    where: { partnerId: ctx.partnerId },
    select: { status: true, commissionCents: true, commissionPaidAt: true, commissionMonthsEarned: true },
  })

  return {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === "PENDING" || r.status === "CLICKED").length,
    signedUp: referrals.filter((r) => r.status === "SIGNED_UP").length,
    converted: referrals.filter((r) => r.status === "CONVERTED").length,
    totalCommissionCents: referrals
      .filter((r) => r.status === "CONVERTED" && r.commissionCents)
      .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0),
    unpaidCommissionCents: referrals
      .filter((r) => r.status === "CONVERTED" && r.commissionCents && !r.commissionPaidAt)
      .reduce((sum, r) => sum + (r.commissionCents ?? 0), 0),
  }
}

export async function cancelReferral(referralId: string): Promise<ActionResult> {
  try {
    const ctx = await getPartnerContext()
    if (!ctx) return { success: false, error: "Not a partner user" }
    if (!isPartnerAdmin(ctx.partnerRole)) {
      return { success: false, error: "Only partner admins can cancel referrals" }
    }

    const referral = await db.referral.findFirst({
      where: { id: referralId, partnerId: ctx.partnerId },
    })
    if (!referral) return { success: false, error: "Referral not found" }
    if (referral.status === "CONVERTED") {
      return { success: false, error: "Cannot cancel a converted referral" }
    }

    await db.referral.update({
      where: { id: referralId },
      data: { status: "CANCELLED" },
    })

    revalidatePath("/partner/referrals")
    return { success: true }
  } catch (err) {
    console.error("cancelReferral error:", err)
    return { success: false, error: "Failed to cancel referral" }
  }
}

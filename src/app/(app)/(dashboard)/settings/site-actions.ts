"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canManageOrg } from "@/lib/permissions"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import type { ActionResult } from "@/types"

const MAX_HIERARCHY_DEPTH = 3

// ── Queries ──────────────────────────────────

export async function getSites() {
  const { dbOrgId } = await getAuthContext()

  const sites = await db.site.findMany({
    where: { organizationId: dbOrgId },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: {
        select: {
          projects: true,
          incidents: true,
          workPermits: true,
          equipment: true,
          complianceObligations: true,
          childSites: true,
        },
      },
    },
    orderBy: [{ siteType: "asc" }, { name: "asc" }],
  })

  return sites
}

// ── Mutations ────────────────────────────────

export async function createSite(values: {
  name: string
  code: string
  siteType: string
  address?: string | null
  parentSiteId?: string | null
  managerId?: string | null
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canManageOrg(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    // Feature gate
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "multiSiteHierarchy")
    if (!access.allowed) {
      return { success: false, error: access.reason ?? "Multi-site hierarchy requires Enterprise plan" }
    }

    // Validate depth
    if (values.parentSiteId) {
      const depth = await getAncestorDepth(values.parentSiteId, dbOrgId)
      if (depth >= MAX_HIERARCHY_DEPTH - 1) {
        return { success: false, error: `Maximum hierarchy depth is ${MAX_HIERARCHY_DEPTH} levels` }
      }
    }

    // Check unique code within org
    const existing = await db.site.findUnique({
      where: { organizationId_code: { organizationId: dbOrgId, code: values.code } },
    })
    if (existing) {
      return { success: false, error: `Site code "${values.code}" already exists` }
    }

    const site = await db.site.create({
      data: {
        name: values.name,
        code: values.code,
        siteType: values.siteType as any,
        address: values.address ?? null,
        parentSiteId: values.parentSiteId ?? null,
        organizationId: dbOrgId,
        managerId: values.managerId ?? null,
      },
    })

    logAuditEvent({
      action: "CREATED",
      entityType: "SITE",
      entityId: site.id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: { name: site.name, code: site.code, siteType: site.siteType },
    })

    revalidatePath("/settings")
    return { success: true, data: { id: site.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create site" }
  }
}

export async function updateSite(
  id: string,
  values: {
    name?: string
    code?: string
    siteType?: string
    address?: string | null
    parentSiteId?: string | null
    managerId?: string | null
    isActive?: boolean
  }
): Promise<ActionResult> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canManageOrg(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "multiSiteHierarchy")
    if (!access.allowed) {
      return { success: false, error: access.reason ?? "Multi-site hierarchy requires Enterprise plan" }
    }

    const existing = await db.site.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) {
      return { success: false, error: "Site not found" }
    }

    // Validate parent change — prevent circular references
    if (values.parentSiteId !== undefined && values.parentSiteId !== existing.parentSiteId) {
      if (values.parentSiteId) {
        // Check it's not setting itself as parent
        if (values.parentSiteId === id) {
          return { success: false, error: "A site cannot be its own parent" }
        }
        // Check for circular reference — walk up ancestor chain
        const isCircular = await wouldCreateCycle(id, values.parentSiteId, dbOrgId)
        if (isCircular) {
          return { success: false, error: "This would create a circular hierarchy" }
        }
        // Check depth
        const depth = await getAncestorDepth(values.parentSiteId, dbOrgId)
        const childDepth = await getDescendantDepth(id, dbOrgId)
        if (depth + childDepth + 1 >= MAX_HIERARCHY_DEPTH) {
          return { success: false, error: `Maximum hierarchy depth is ${MAX_HIERARCHY_DEPTH} levels` }
        }
      }
    }

    // Validate unique code
    if (values.code && values.code !== existing.code) {
      const duplicate = await db.site.findUnique({
        where: { organizationId_code: { organizationId: dbOrgId, code: values.code } },
      })
      if (duplicate) {
        return { success: false, error: `Site code "${values.code}" already exists` }
      }
    }

    await db.site.update({
      where: { id },
      data: {
        ...(values.name !== undefined && { name: values.name }),
        ...(values.code !== undefined && { code: values.code }),
        ...(values.siteType !== undefined && { siteType: values.siteType as any }),
        ...(values.address !== undefined && { address: values.address }),
        ...(values.parentSiteId !== undefined && { parentSiteId: values.parentSiteId }),
        ...(values.managerId !== undefined && { managerId: values.managerId }),
        ...(values.isActive !== undefined && { isActive: values.isActive }),
      },
    })

    logAuditEvent({
      action: "UPDATED",
      entityType: "SITE",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: values,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update site" }
  }
}

export async function deleteSite(id: string): Promise<ActionResult> {
  try {
    const { dbOrgId, dbUserId, role } = await getAuthContext()

    if (!canManageOrg(role)) {
      return { success: false, error: "Insufficient permissions" }
    }

    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "multiSiteHierarchy")
    if (!access.allowed) {
      return { success: false, error: access.reason ?? "Multi-site hierarchy requires Enterprise plan" }
    }

    const site = await db.site.findFirst({
      where: { id, organizationId: dbOrgId },
      include: {
        _count: { select: { childSites: true, projects: true, incidents: true, workPermits: true, equipment: true } },
      },
    })

    if (!site) {
      return { success: false, error: "Site not found" }
    }

    if (site._count.childSites > 0) {
      return { success: false, error: "Cannot delete a site that has child sites. Remove or reassign children first." }
    }

    const totalRecords = site._count.projects + site._count.incidents + site._count.workPermits + site._count.equipment
    if (totalRecords > 0) {
      return { success: false, error: `This site has ${totalRecords} linked records. Deactivate it instead, or reassign records first.` }
    }

    await db.site.delete({ where: { id } })

    logAuditEvent({
      action: "DELETED",
      entityType: "SITE",
      entityId: id,
      userId: dbUserId,
      organizationId: dbOrgId,
      metadata: { name: site.name, code: site.code },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete site" }
  }
}

// ── Helpers ──────────────────────────────────

async function getAncestorDepth(siteId: string, orgId: string): Promise<number> {
  let depth = 0
  let currentId: string | null = siteId

  while (currentId && depth < MAX_HIERARCHY_DEPTH + 1) {
    const ancestor: { parentSiteId: string | null } | null = await db.site.findFirst({
      where: { id: currentId, organizationId: orgId },
      select: { parentSiteId: true },
    })
    if (!ancestor || !ancestor.parentSiteId) break
    currentId = ancestor.parentSiteId
    depth++
  }

  return depth
}

async function getDescendantDepth(targetId: string, orgId: string): Promise<number> {
  const children = await db.site.findMany({
    where: { parentSiteId: targetId, organizationId: orgId },
    select: { id: true },
  })
  if (children.length === 0) return 0
  const depths = await Promise.all(children.map((c) => getDescendantDepth(c.id, orgId)))
  return 1 + Math.max(...depths)
}

async function wouldCreateCycle(siteId: string, newParentId: string, orgId: string): Promise<boolean> {
  let currentId: string | null = newParentId
  let steps = 0

  while (currentId && steps < MAX_HIERARCHY_DEPTH + 1) {
    if (currentId === siteId) return true
    const node: { parentSiteId: string | null } | null = await db.site.findFirst({
      where: { id: currentId, organizationId: orgId },
      select: { parentSiteId: true },
    })
    if (!node) break
    currentId = node.parentSiteId
    steps++
  }

  return false
}

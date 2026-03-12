import { db } from "@/lib/db"

/**
 * Get active standard IDs for an organization.
 * Auto-seeds OrganizationStandard rows from global defaults on first access.
 */
export async function getActiveStandardIds(orgId: string): Promise<string[]> {
  let orgStandards = await db.organizationStandard.findMany({
    where: { organizationId: orgId },
    select: { standardId: true, isActive: true },
  })

  // Auto-seed from global defaults if org has never configured standards
  if (orgStandards.length === 0) {
    const allStandards = await db.standard.findMany({
      select: { id: true, isActive: true },
    })
    if (allStandards.length > 0) {
      await db.organizationStandard.createMany({
        data: allStandards.map((s) => ({
          organizationId: orgId,
          standardId: s.id,
          isActive: s.isActive,
        })),
        skipDuplicates: true,
      })
      orgStandards = allStandards.map((s) => ({
        standardId: s.id,
        isActive: s.isActive,
      }))
    }
  }

  return orgStandards.filter((os) => os.isActive).map((os) => os.standardId)
}

/**
 * Get active standard count for an organization (billing).
 */
export async function getActiveStandardCount(orgId: string): Promise<number> {
  const ids = await getActiveStandardIds(orgId)
  return ids.length
}

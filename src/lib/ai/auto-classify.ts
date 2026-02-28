import { db } from "@/lib/db"

/**
 * Check if the organization has auto-classify on upload enabled.
 * Defaults to true (enabled) for new orgs or when the setting is absent.
 */
export async function getOrgAutoClassify(dbOrgId: string): Promise<boolean> {
  const org = await db.organization.findUnique({
    where: { id: dbOrgId },
    select: { settings: true },
  })

  const settings = (org?.settings as Record<string, unknown>) ?? {}
  return settings.autoClassifyOnUpload !== false
}

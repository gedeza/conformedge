import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { getSiteId } from "@/lib/site-context"
import { SiteSelector } from "./site-selector"

export async function SiteSelectorWrapper() {
  try {
    const { dbOrgId } = await getAuthContext()

    // Check feature gate
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "multiSiteHierarchy")
    if (!access.allowed) return null

    // Fetch sites
    const sites = await db.site.findMany({
      where: { organizationId: dbOrgId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        siteType: true,
        parentSiteId: true,
      },
      orderBy: [{ siteType: "asc" }, { name: "asc" }],
    })

    if (sites.length === 0) return null

    const currentSiteId = await getSiteId()

    return <SiteSelector sites={sites} currentSiteId={currentSiteId} />
  } catch {
    return null
  }
}

"use server"

import { cache } from "react"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"
import { computeIMSSummary } from "@/lib/ims/ims-engine"
import type { IMSSummary } from "@/lib/ims/types"

export const getIMSDashboardData = cache(
  async (projectId?: string): Promise<IMSSummary | null> => {
    const { dbOrgId } = await getAuthContext()

    // Billing: IMS requires Professional+
    const billing = await getBillingContext(dbOrgId)
    const gate = checkFeatureAccess(billing, "ims")
    if (!gate.allowed) return null

    return computeIMSSummary(dbOrgId, projectId)
  }
)

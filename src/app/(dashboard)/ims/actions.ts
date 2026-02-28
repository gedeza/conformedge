"use server"

import { cache } from "react"
import { getAuthContext } from "@/lib/auth"
import { computeIMSSummary } from "@/lib/ims/ims-engine"
import type { IMSSummary } from "@/lib/ims/types"

export const getIMSDashboardData = cache(
  async (projectId?: string): Promise<IMSSummary> => {
    const { dbOrgId } = await getAuthContext()
    return computeIMSSummary(dbOrgId, projectId)
  }
)

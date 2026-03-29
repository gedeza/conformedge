"use server"

import { cookies } from "next/headers"

const SITE_COOKIE = "ce_site"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/**
 * Get the currently selected site ID.
 * Priority: URL searchParam > cookie > null (all sites).
 */
export async function getSiteId(searchParams?: Record<string, string | string[] | undefined>): Promise<string | null> {
  // 1. URL param takes precedence (deep links, bookmarks)
  if (searchParams?.siteId && typeof searchParams.siteId === "string") {
    return searchParams.siteId
  }

  // 2. Cookie (persistent selection from sidebar)
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(SITE_COOKIE)?.value
  if (cookieValue) return cookieValue

  // 3. No site selected — shows all sites
  return null
}

/**
 * Set the site selection cookie. Pass null to clear (show all sites).
 */
export async function setSiteCookie(siteId: string | null) {
  const cookieStore = await cookies()

  if (siteId) {
    cookieStore.set(SITE_COOKIE, siteId, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })
  } else {
    cookieStore.delete(SITE_COOKIE)
  }
}

/**
 * Build a Prisma where clause fragment for site filtering.
 * Returns {} when no site is selected (no filtering).
 */
export async function siteFilter(siteId: string | null): Promise<Record<string, string>> {
  if (!siteId) return {}
  return { siteId }
}

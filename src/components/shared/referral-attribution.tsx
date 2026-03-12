import { cookies } from "next/headers"
import { getAuthContext } from "@/lib/auth"
import { attributeReferral } from "@/lib/referral-attribution"

/**
 * Invisible server component that checks for a referral cookie
 * and attributes the referral to the user's current organization.
 * Renders nothing — just performs the side effect.
 */
export async function ReferralAttribution() {
  try {
    const cookieStore = await cookies()
    const refCode = cookieStore.get("ce_ref")?.value
    if (!refCode) return null

    const { dbOrgId } = await getAuthContext()
    const success = await attributeReferral(dbOrgId, refCode)

    if (success) {
      // Clear the cookie after successful attribution
      cookieStore.delete("ce_ref")
    }
  } catch {
    // Silent — attribution is non-critical
  }

  return null
}

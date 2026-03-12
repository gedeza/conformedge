import { db } from "@/lib/db"

/**
 * Attribute a referral to an organization.
 * Called when a user with a ce_ref cookie first accesses the dashboard.
 * Returns true if attribution was successful.
 */
export async function attributeReferral(organizationId: string, refCode: string): Promise<boolean> {
  try {
    const referral = await db.referral.findUnique({
      where: { code: refCode },
      select: { id: true, status: true, expiresAt: true, referredOrgId: true },
    })

    if (!referral) return false
    if (referral.referredOrgId) return false // Already attributed
    if (referral.expiresAt < new Date()) return false
    if (referral.status === "CANCELLED" || referral.status === "EXPIRED") return false

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    })

    await db.referral.update({
      where: { id: referral.id },
      data: {
        referredOrgId: organizationId,
        referredCompany: org?.name ?? null,
        status: "SIGNED_UP",
        signedUpAt: new Date(),
      },
    })

    return true
  } catch (err) {
    console.error("[referral-attribution] Error:", err)
    return false
  }
}

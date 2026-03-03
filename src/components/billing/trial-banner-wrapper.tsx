import { getAuthContext } from "@/lib/auth"
import { getBillingContext } from "@/lib/billing"
import { TrialBanner } from "./trial-banner"

/**
 * Server component wrapper that fetches billing context
 * and conditionally renders the trial banner.
 */
export async function TrialBannerWrapper() {
  try {
    const { dbOrgId } = await getAuthContext()
    const billing = await getBillingContext(dbOrgId)

    if (billing.subscription.status !== "TRIALING" || !billing.subscription.trialEndsAt) {
      return null
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(billing.subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    )

    return <TrialBanner daysRemaining={daysRemaining} className="mx-6 mt-4" />
  } catch {
    // If auth fails or billing not bootstrapped, skip banner silently
    return null
  }
}

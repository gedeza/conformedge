import { getAuthContext } from "@/lib/auth"
import { getBillingContext } from "@/lib/billing"
import { TrialBanner } from "./trial-banner"

/**
 * Server component wrapper that fetches billing context
 * and conditionally renders the trial or past-due banner.
 */
export async function TrialBannerWrapper() {
  try {
    const { dbOrgId } = await getAuthContext()
    const billing = await getBillingContext(dbOrgId)

    // Past-due banner (payment failed, grace period active)
    if (billing.subscription.status === "PAST_DUE" && billing.subscription.gracePeriodEndsAt) {
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(billing.subscription.gracePeriodEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )

      return <TrialBanner daysRemaining={daysRemaining} variant="past_due" className="mx-6 mt-4" />
    }

    // Trial banner
    if (billing.subscription.status === "TRIALING" && billing.subscription.trialEndsAt) {
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (new Date(billing.subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )

      return <TrialBanner daysRemaining={daysRemaining} className="mx-6 mt-4" />
    }

    return null
  } catch {
    // If auth fails or billing not bootstrapped, skip banner silently
    return null
  }
}

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

interface Props {
  params: Promise<{ code: string }>
}

/**
 * Referral landing page.
 * Records the click, sets a cookie for attribution, and redirects to sign-up.
 */
export default async function ReferralPage({ params }: Props) {
  const { code } = await params

  const referral = await db.referral.findUnique({
    where: { code },
    select: { id: true, status: true, expiresAt: true },
  })

  if (!referral || referral.expiresAt < new Date()) {
    // Invalid or expired — redirect to main sign-up
    redirect("/sign-up")
  }

  // Increment click count and update status
  if (referral.status === "PENDING") {
    await db.referral.update({
      where: { id: referral.id },
      data: { clickCount: { increment: 1 }, status: "CLICKED" },
    })
  } else if (referral.status === "CLICKED") {
    await db.referral.update({
      where: { id: referral.id },
      data: { clickCount: { increment: 1 } },
    })
  }

  // Set attribution cookie (30 days)
  const cookieStore = await cookies()
  cookieStore.set("ce_ref", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })

  redirect("/sign-up")
}

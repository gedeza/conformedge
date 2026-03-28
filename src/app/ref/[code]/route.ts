import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Referral landing route.
 * Records the click, sets a cookie for attribution, and redirects to sign-up.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conformedge.isutech.co.za"

  try {
    const referral = await db.referral.findUnique({
      where: { code },
      select: { id: true, status: true, expiresAt: true },
    })

    if (!referral || referral.expiresAt < new Date()) {
      return NextResponse.redirect(`${appUrl}/sign-up`)
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

    // Redirect to sign-up with attribution cookie
    const response = NextResponse.redirect(`${appUrl}/sign-up?ref=${code}`)
    response.cookies.set("ce_ref", code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[ref] Error processing referral click:", error)
    return NextResponse.redirect(`${appUrl}/sign-up`)
  }
}

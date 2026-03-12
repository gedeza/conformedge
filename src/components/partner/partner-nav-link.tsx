import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { Handshake } from "lucide-react"

/**
 * Server component that renders a "Partner Console" link
 * only if the current user is an active partner user.
 * Designed to be placed in the dashboard layout (not in the client sidebar).
 */
export async function PartnerNavLink() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  })
  if (!user) return null

  const partnerUser = await db.partnerUser.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      partner: { select: { status: true, name: true } },
    },
  })

  if (!partnerUser || partnerUser.partner.status !== "ACTIVE") return null

  return (
    <Link
      href="/partner"
      className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
    >
      <Handshake className="h-4 w-4" />
      Partner Console
    </Link>
  )
}

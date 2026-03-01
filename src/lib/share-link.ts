import { db } from "@/lib/db"
import { hashShareToken, isValidTokenFormat } from "@/lib/share-tokens"
import { captureError } from "@/lib/error-tracking"
import type { ShareLink } from "@/generated/prisma/client"

/**
 * Validate a raw share token and return the ShareLink if valid.
 * Returns null for invalid, expired, revoked, or view-exhausted tokens.
 */
export async function validateShareToken(token: string): Promise<(ShareLink & { organization: { name: string } }) | null> {
  if (!isValidTokenFormat(token)) return null

  const tokenHash = hashShareToken(token)

  const shareLink = await db.shareLink.findUnique({
    where: { tokenHash },
    include: { organization: { select: { name: true } } },
  })

  if (!shareLink) return null
  if (shareLink.status !== "ACTIVE") return null
  if (shareLink.expiresAt < new Date()) return null
  if (shareLink.maxViews !== null && shareLink.viewCount >= shareLink.maxViews) return null

  return shareLink
}

interface ShareAccessInput {
  shareLinkId: string
  ipAddress?: string | null
  userAgent?: string | null
  action: "VIEW" | "DOWNLOAD" | "DOWNLOAD_PDF"
  metadata?: Record<string, unknown>
}

/** Fire-and-forget access log (pattern from audit.ts) */
export function logShareAccess(input: ShareAccessInput) {
  db.shareLinkAccess
    .create({
      data: {
        shareLinkId: input.shareLinkId,
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
        action: input.action,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (input.metadata ?? undefined) as any,
      },
    })
    .catch((err) => {
      captureError(err, { source: "shareLink.logAccess" })
    })
}

/** Fire-and-forget atomic view count increment + last accessed update */
export function incrementViewCount(id: string) {
  db.shareLink
    .update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    })
    .catch((err) => {
      captureError(err, { source: "shareLink.incrementView" })
    })
}

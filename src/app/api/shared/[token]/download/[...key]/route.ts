import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getPresignedDownloadUrl } from "@/lib/r2"
import { validateShareToken, logShareAccess } from "@/lib/share-link"
import { captureError } from "@/lib/error-tracking"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; key: string[] }> }
) {
  try {
    const { token, key: segments } = await params
    const shareLink = await validateShareToken(token)

    if (!shareLink) {
      return NextResponse.json({ error: "Invalid or expired share link" }, { status: 403 })
    }

    if (!shareLink.allowDownload) {
      return NextResponse.json({ error: "Downloads not permitted for this link" }, { status: 403 })
    }

    const key = segments.join("/")

    // R2 key must start with the share link's org ID
    if (segments[0] !== shareLink.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For DOCUMENT type: verify the document's fileUrl matches the requested key
    if (shareLink.type === "DOCUMENT" && shareLink.entityId) {
      const doc = await db.document.findFirst({
        where: { id: shareLink.entityId, organizationId: shareLink.organizationId },
        select: { fileUrl: true },
      })
      if (!doc || doc.fileUrl !== key) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Log the download
    logShareAccess({
      shareLinkId: shareLink.id,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent") ?? null,
      action: "DOWNLOAD",
    })

    const url = await getPresignedDownloadUrl(key)
    return NextResponse.redirect(url, 302)
  } catch (error) {
    captureError(error, { source: "shared.download" })
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getPresignedDownloadUrl } from "@/lib/r2"

/**
 * Public route for serving partner logos.
 * Only serves keys under the `partner/` prefix.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: segments } = await params
    const key = segments.join("/")

    // Only serve files under partner/ prefix
    if (!key.startsWith("partner/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = await getPresignedDownloadUrl(key)
    return NextResponse.redirect(url, 302)
  } catch {
    return NextResponse.json({ error: "Logo not found" }, { status: 404 })
  }
}

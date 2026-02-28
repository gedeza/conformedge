import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/auth"
import { getPresignedDownloadUrl } from "@/lib/r2"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { dbOrgId } = await getAuthContext()
    const { key: segments } = await params
    const key = segments.join("/")

    // First segment must be the caller's org ID
    if (segments[0] !== dbOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const url = await getPresignedDownloadUrl(key)
    return NextResponse.redirect(url, 302)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { validateShareToken, logShareAccess } from "@/lib/share-link"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"
import { uploadToR2 } from "@/lib/r2"
import { captureError } from "@/lib/error-tracking"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const shareLink = await validateShareToken(token)

    if (!shareLink) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 })
    }

    if (shareLink.type !== "SUBCONTRACTOR") {
      return NextResponse.json({ error: "Upload not allowed for this link type" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      return NextResponse.json(
        { error: "File type not supported. Please upload a PDF, Word, Excel, or image file." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    // R2 key scoped to org (server-derived, not user input)
    const key = `${shareLink.organizationId}/${safeName}`

    await uploadToR2(key, buffer, file.type)

    // Log upload access
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
    const ua = request.headers.get("user-agent") ?? null
    logShareAccess({
      shareLinkId: shareLink.id,
      ipAddress: ip,
      userAgent: ua,
      action: "UPLOAD",
      metadata: { fileName: file.name, fileSize: file.size },
    })

    return NextResponse.json({
      fileUrl: key,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
    })
  } catch (error) {
    captureError(error, { source: "shared-upload" })
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}

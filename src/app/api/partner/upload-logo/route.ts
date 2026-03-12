import { NextRequest, NextResponse } from "next/server"
import { getPartnerContext } from "@/lib/partner-auth"
import { isPartnerAdmin } from "@/lib/permissions"
import { uploadToR2, deleteFromR2 } from "@/lib/r2"
import { db } from "@/lib/db"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2MB
const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getPartnerContext()
    if (!ctx || !isPartnerAdmin(ctx.partnerRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_LOGO_SIZE) {
      return NextResponse.json({ error: "Logo too large (max 2MB)" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are supported" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = EXT_MAP[file.type] ?? ".png"
    const key = `partner/${ctx.partnerId}/${Date.now()}-logo${ext}`

    // Get current logo to delete after upload
    const partner = await db.partner.findUnique({
      where: { id: ctx.partnerId },
      select: { logoKey: true },
    })

    await uploadToR2(key, buffer, file.type)

    // Update partner record
    await db.partner.update({
      where: { id: ctx.partnerId },
      data: { logoKey: key },
    })

    // Delete old logo if exists
    if (partner?.logoKey) {
      try {
        await deleteFromR2(partner.logoKey)
      } catch {
        // Non-critical — old file cleanup failure is acceptable
      }
    }

    return NextResponse.json({ logoKey: key })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

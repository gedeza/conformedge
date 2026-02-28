import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { getAuthContext } from "@/lib/auth"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"
import { uploadToR2 } from "@/lib/r2"
import { captureError } from "@/lib/error-tracking"

export async function POST(request: NextRequest) {
  try {
    const { dbOrgId } = await getAuthContext()

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      return NextResponse.json({ error: "File type not supported. Please upload a PDF, Word, Excel, or image file." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const key = `${dbOrgId}/${safeName}`

    await uploadToR2(key, buffer, file.type)

    return NextResponse.json({
      fileUrl: key,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
    })
  } catch (error) {
    captureError(error, { source: "upload" })
    return NextResponse.json({ error: "Upload failed. Please try again or contact support." }, { status: 500 })
  }
}

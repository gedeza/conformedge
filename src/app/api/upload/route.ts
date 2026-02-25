import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { getAuthContext } from "@/lib/auth"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"

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
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", dbOrgId)
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(uploadDir, safeName)

    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${dbOrgId}/${safeName}`

    return NextResponse.json({
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

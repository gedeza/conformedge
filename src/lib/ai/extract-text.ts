import { readFile } from "fs/promises"
import path from "path"

const EXTRACTABLE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
])

export function isExtractable(fileType: string | null): boolean {
  if (!fileType) return false
  return EXTRACTABLE_TYPES.has(fileType)
}

export async function extractText(fileUrl: string, fileType: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", fileUrl)
  const buffer = await readFile(filePath)

  if (fileType === "application/pdf") {
    // Import from lib/pdf-parse directly to bypass index.js test-file loading bug
    const pdfParse = (await import("pdf-parse/lib/pdf-parse")).default
    const result = await pdfParse(buffer)
    return result.text
  }

  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword"
  ) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

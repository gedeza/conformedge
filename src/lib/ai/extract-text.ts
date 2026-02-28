import { readFile } from "fs/promises"
import path from "path"
import { extractTextViaOCR } from "./ocr-extract"
import { isExtractableMime } from "./extractable-types"
import { isR2Key, getPresignedDownloadUrl } from "@/lib/r2"

export { isExtractableMime as isExtractable }

async function fetchBuffer(fileUrl: string): Promise<Buffer> {
  if (isR2Key(fileUrl)) {
    const url = await getPresignedDownloadUrl(fileUrl)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`R2 fetch failed: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }

  // Legacy local path
  const publicDir = path.resolve(process.cwd(), "public")
  const filePath = path.resolve(publicDir, fileUrl)

  if (!filePath.startsWith(publicDir + path.sep)) {
    throw new Error("Invalid file path")
  }

  return readFile(filePath)
}

export async function extractText(fileUrl: string, fileType: string): Promise<string> {
  const buffer = await fetchBuffer(fileUrl)

  if (fileType === "application/pdf") {
    // Import from lib/pdf-parse directly to bypass index.js test-file loading bug
    const pdfParse = (await import("pdf-parse/lib/pdf-parse")).default
    const result = await pdfParse(buffer)

    // Scanned PDF fallback: if pdf-parse returns very little text, try OCR
    if (result.text.trim().length < 50) {
      return extractTextViaOCR(buffer)
    }

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

  if (fileType === "image/jpeg" || fileType === "image/png") {
    return extractTextViaOCR(buffer)
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

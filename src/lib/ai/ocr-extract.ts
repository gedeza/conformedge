import { ImageAnnotatorClient } from "@google-cloud/vision"

const globalForVision = globalThis as unknown as {
  visionClient: ImageAnnotatorClient | undefined
}

function getClient(): ImageAnnotatorClient {
  if (globalForVision.visionClient) return globalForVision.visionClient

  const client = new ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_CLOUD_API_KEY!,
  })

  if (process.env.NODE_ENV !== "production") globalForVision.visionClient = client
  return client
}

export async function extractTextViaOCR(buffer: Buffer): Promise<string> {
  const client = getClient()
  const [result] = await client.documentTextDetection(buffer)

  const text = result.fullTextAnnotation?.text ?? ""
  if (!text.trim()) {
    throw new Error("OCR could not extract any text from this file")
  }

  return text
}

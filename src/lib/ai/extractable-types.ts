/**
 * Extractable file types — pure module with no Node.js imports (safe for client components).
 */

export const EXTRACTABLE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
])

export function isExtractableMime(fileType: string | null): boolean {
  if (!fileType) return false
  return EXTRACTABLE_TYPES.has(fileType)
}

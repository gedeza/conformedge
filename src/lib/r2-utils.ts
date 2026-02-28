/**
 * Client-safe R2 helpers — no Node/AWS imports.
 * Safe to use in both server and client components.
 */

/** R2 keys have no leading slash; legacy paths start with /uploads/ */
export function isR2Key(fileUrl: string): boolean {
  return !!fileUrl && !fileUrl.startsWith("/")
}

/** Returns a download-safe URL for any file reference */
export function getDownloadUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null
  if (isR2Key(fileUrl)) return `/api/download/${fileUrl}`
  return fileUrl
}

import crypto from "crypto"

/** Generate a 64-character hex share token (256 bits of entropy) */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/** Hash a raw token with SHA-256 for storage (raw token is never stored) */
export function hashShareToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/** Validate token format before DB lookup */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token)
}

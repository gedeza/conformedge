import crypto from "crypto"

/** Generate a 48-character hex invitation code (192 bits of entropy) */
export function generateInvitationCode(): string {
  return crypto.randomBytes(24).toString("hex")
}

/** Validate invitation code format before DB lookup */
export function isValidInvitationCode(code: string): boolean {
  return /^[a-f0-9]{48}$/.test(code)
}

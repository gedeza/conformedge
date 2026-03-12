/**
 * Role-based permission helpers.
 *
 * Hierarchy: OWNER > ADMIN > MANAGER > AUDITOR > VIEWER
 *
 * VIEWER   — read-only everywhere
 * AUDITOR  — read + conduct assessments
 * MANAGER  — create + edit (no delete)
 * ADMIN    — full access
 * OWNER    — full access
 */

const ROLE_LEVEL: Record<string, number> = {
  VIEWER: 0,
  AUDITOR: 1,
  MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
}

function level(role: string): number {
  return ROLE_LEVEL[role] ?? 0
}

/** Can create new entities (MANAGER+) */
export function canCreate(role: string): boolean {
  return level(role) >= ROLE_LEVEL.MANAGER
}

/** Can edit existing entities (MANAGER+) */
export function canEdit(role: string): boolean {
  return level(role) >= ROLE_LEVEL.MANAGER
}

/** Can delete entities (ADMIN+) */
export function canDelete(role: string): boolean {
  return level(role) >= ROLE_LEVEL.ADMIN
}

/** Can conduct assessments / mark checklist items (AUDITOR+) */
export function canConduct(role: string): boolean {
  return level(role) >= ROLE_LEVEL.AUDITOR
}

/** Can manage org settings, members, standards (ADMIN+) */
export function canManageOrg(role: string): boolean {
  return level(role) >= ROLE_LEVEL.ADMIN
}

// ─────────────────────────────────────────────
// PARTNER ROLE HELPERS
// ─────────────────────────────────────────────

const PARTNER_ROLE_LEVEL: Record<string, number> = {
  PARTNER_VIEWER: 0,
  PARTNER_MANAGER: 1,
  PARTNER_ADMIN: 2,
}

function partnerLevel(role: string): number {
  return PARTNER_ROLE_LEVEL[role] ?? 0
}

/** Can view client org data (all partner roles) */
export function canPartnerRead(role: string): boolean {
  return partnerLevel(role) >= PARTNER_ROLE_LEVEL.PARTNER_VIEWER
}

/** Can edit client org data (PARTNER_MANAGER+) */
export function canPartnerEdit(role: string): boolean {
  return partnerLevel(role) >= PARTNER_ROLE_LEVEL.PARTNER_MANAGER
}

/** Can manage partner settings, users, billing (PARTNER_ADMIN only) */
export function isPartnerAdmin(role: string): boolean {
  return partnerLevel(role) >= PARTNER_ROLE_LEVEL.PARTNER_ADMIN
}

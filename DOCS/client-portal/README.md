# Client Portal — External Sharing Feature

## Overview

SA construction companies using ConformEdge need to share compliance data with external auditors (e.g., SABS certification bodies), client project managers, and other stakeholders who don't have ConformEdge accounts. This feature adds **token-based share links** that let ADMIN+ users create time-limited, scoped URLs for sharing documents, audit packs, or a curated read-only portal view.

## Approach

**Token-based share links** — no external user accounts needed. External users access shared content via unique URLs without needing to sign up. This fits the existing architecture (presigned R2 URLs already use token-based access) and avoids building a parallel auth system.

## Architecture

### Data Model

Two new Prisma models:

- **ShareLink** — Stores the token hash (SHA-256), type (DOCUMENT/AUDIT_PACK/PORTAL), status, scope, expiry, view limits, and org/creator references
- **ShareLinkAccess** — Audit log of every external access (IP, user agent, action type)

### Security Design

| Concern | Mitigation |
|---------|-----------|
| Token brute force | 64-char hex token = 2^128 entropy |
| Token storage | Only SHA-256 hash in DB; raw token shown once at creation |
| Org data leakage | All queries scoped by `shareLink.organizationId` |
| Expired access | `validateShareToken()` checks status + expiresAt on every request |
| View count bypass | Atomic `{ increment: 1 }` update |
| Download scoping | R2 key must start with org ID; DOCUMENT links restricted to specific entity |
| Audit trail | Every access logged to `ShareLinkAccess` with IP + user agent |

### Share Link Types

1. **DOCUMENT** — Share a single document with metadata, classifications, and optional download
2. **AUDIT_PACK** — Share a compiled audit pack with optional PDF download
3. **PORTAL** — Curated read-only dashboard with configurable sections (documents, assessments, CAPAs, checklists, subcontractors)

### Route Structure

- `/shared/[token]` — Public shared views (no auth required)
- `/api/shared/[token]/download/[...key]` — Token-authenticated file download
- `/api/shared/[token]/pdf` — Token-authenticated audit pack PDF
- `/settings` → "External Sharing" card — Admin management UI

## File Reference

### New Files

| File | Purpose |
|------|---------|
| `src/lib/share-tokens.ts` | Token generation + hashing |
| `src/lib/share-link.ts` | Token validation + access logging |
| `src/lib/share-data.ts` | Read-only data fetchers for shared views |
| `src/app/(dashboard)/settings/share-link-actions.ts` | CRUD server actions |
| `src/app/(dashboard)/settings/share-links.tsx` | Share links management list |
| `src/app/(dashboard)/settings/create-share-link-dialog.tsx` | Create link dialog |
| `src/app/(dashboard)/settings/share-link-access-log.tsx` | Access log viewer |
| `src/app/(shared)/layout.tsx` | Minimal public layout |
| `src/app/(shared)/shared/[token]/page.tsx` | Token router + views |
| `src/app/(shared)/shared/[token]/shared-document-view.tsx` | Read-only document view |
| `src/app/(shared)/shared/[token]/shared-audit-pack-view.tsx` | Read-only audit pack view |
| `src/app/(shared)/shared/[token]/shared-portal-view.tsx` | Read-only portal dashboard |
| `src/app/api/shared/[token]/download/[...key]/route.ts` | Token-authenticated file download |
| `src/app/api/shared/[token]/pdf/route.ts` | Token-authenticated audit pack PDF |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | 2 enums, 2 models, relations on Org + User |
| `src/types/index.ts` | ShareLinkType + ShareLinkStatus |
| `src/lib/constants.ts` | 2 new status maps |
| `src/components/shared/status-badge.tsx` | Register 2 new maps |
| `src/app/(dashboard)/settings/page.tsx` | 6th card for share links |
| `src/app/(dashboard)/documents/[id]/page.tsx` | Share button in header |
| `src/app/(dashboard)/audit-packs/[id]/page.tsx` | Share button in header |
| `src/app/api/cron/check-expiries/route.ts` | Auto-expire share links |

## User Flow

### Creating a Share Link (Admin)

1. Navigate to Settings → External Sharing, or click "Share" on a document/audit pack
2. Select type (Document, Audit Pack, or Portal)
3. Configure: label, recipient info, expiry, max views, download permission
4. For Portal type: select which sections to include
5. Click Create → raw URL shown once with copy button

### Accessing a Share Link (External User)

1. Open the shared URL in any browser (no account needed)
2. See read-only view of the shared content
3. Download files if permitted
4. All access is logged for the organization's audit trail

### Managing Share Links (Admin)

- View all links with status, type, view count, expiry
- Copy URL, revoke, delete, or view access log
- Expired links are auto-marked by the cron job

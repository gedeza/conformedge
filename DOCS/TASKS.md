# ConformEdge — Task Tracker

**Last Updated:** 2026-03-03
**Phase:** Final Polish + Billing Preparation

---

## Legend
- [ ] Pending
- [~] In Progress
- [x] Completed
- [!] Blocked / Manual Action

---

## P0 — Immediate (Before Next Deploy) — ALL COMPLETE

- [x] **T01** Add `poweredByHeader: false` to `next.config.ts`
- [x] **T02** Replace "Claude AI" → "ConformEdge AI" on landing page (`data.ts:79,123`)
- [x] **T03** Replace "Anthropic API plan" error in classify route (`classify/route.ts:223`)
- [x] **T04** Delete `public/vercel.svg` and `public/next.svg`
- [x] **T05** Strip health endpoint to `{ status: "ok", timestamp }` only (`health/route.ts`)

## P1 — This Week (Info Leak Fixes) — ALL COMPLETE

- [x] **T06** Replace "Webhook secret not configured" → "Internal server error" (`webhooks/clerk/route.ts:16`)
- [x] **T07** Replace raw `error.message` forwarding in CSV report route (`reports/csv/route.ts:126`)
- [x] **T08** Replace raw `error.message` forwarding in PDF report route (`reports/pdf/route.ts:62`)
- [x] **T09** Replace "R2 fetch failed" → "Storage fetch failed" (`extract-text.ts:13`)
- [x] **T10** Replace "OCR could not extract" → "Text extraction failed" (`ocr-extract.ts:24`)
- [x] **T11** Remove ThriveSend/KopanoWorks comment from `ecosystem.config.cjs`
- [x] **T12** Delete test PDF — not git-tracked (local file only, no action needed)
- [x] **T13** Replace "Claude analyses" → "Our AI analyses" in documents help panel (`documents-help-panel.tsx:14`)

## P2 — This Sprint (Hardening) — ALL COMPLETE

- [!] **T14** Configure custom Resend sender domain (`noreply@conformedge.co.za`) — **MANUAL: Requires Resend dashboard + DNS verification**
- [x] **T15** Verify `.env` never committed — **VERIFIED CLEAN**
- [x] **T16** Verify GitHub repo is private — **WARNING: REPO IS PUBLIC. Make private via GitHub Settings → Danger Zone**
- [x] **T17** Add trade-specific entries to industry list (Plumbing, Electrical, Manufacturing, IT, Healthcare, Logistics)
- [x] **T18** Rename `SA_CONSTRUCTION_INDUSTRIES` → `INDUSTRIES` in constants + 3 import refs
- [x] **T19** Replace `HardHat` icon → `Building2` across all 7 files (sidebar, landing, reports, subcontractors, help panel, shared portal)
- [x] **T20** Replace `app.conformedge.co.za` → `conformedge.co.za` in feature-details mock UI
- [x] **T21** Replace `console.error("R2 delete failed")` with `captureError()` in documents actions
- [x] **T22** Replace raw error forwarding in email.ts with generic message

## P3 — Before Billing Implementation

- [ ] **T23** Finalize user tier limits decision (recommended: keep 5/15/50/Unlimited)
- [ ] **T24** Design onboarding AI credit allowance (100 credits during trial)
- [ ] **T25** Plan trial-period unlimited user invites (enforce on conversion only)

## P4 — Future Consideration

- [ ] **T26** Monitor 15→50 user gap post-launch for potential "Growth" tier
- [ ] **T27** Evaluate mining sector entry (highest-value adjacent market)
- [ ] **T28** Consider configurable vendor scoring weights per organization
- [ ] **T29** Generalize Subcontractor help panel — remove CIDB references
- [ ] **T30** Consider schema rename Subcontractor → Vendor (40+ file changes)

---

## Completed Tasks

| Task | Description | Date |
|------|-------------|------|
| T01 | Added `poweredByHeader: false` to `next.config.ts` | 2026-03-03 |
| T02 | Replaced "Claude AI" → "ConformEdge AI" on landing page (2 strings) | 2026-03-03 |
| T03 | Replaced "Anthropic API plan" → generic error in classify route | 2026-03-03 |
| T04 | Deleted `public/vercel.svg` and `public/next.svg` | 2026-03-03 |
| T05 | Stripped health endpoint to `{ status: "ok", timestamp }` only | 2026-03-03 |
| T06 | Replaced "Webhook secret not configured" → "Internal server error" | 2026-03-03 |
| T07 | Replaced raw error.message forwarding in CSV report route | 2026-03-03 |
| T08 | Replaced raw error.message forwarding in PDF report route | 2026-03-03 |
| T09 | Replaced "R2 fetch failed" → "Storage fetch failed" | 2026-03-03 |
| T10 | Replaced "OCR could not extract" → "Text extraction failed" | 2026-03-03 |
| T11 | Removed ThriveSend/KopanoWorks comment from ecosystem.config.cjs | 2026-03-03 |
| T12 | Test PDF not git-tracked — no action needed | 2026-03-03 |
| T13 | Replaced "Claude analyses" → "Our AI analyses" in documents help panel | 2026-03-03 |
| T14 | Resend sender domain — flagged for manual DNS setup | 2026-03-03 |
| T15 | Verified .env never committed to git — clean | 2026-03-03 |
| T16 | Repo is PUBLIC — flagged for manual change to private | 2026-03-03 |
| T17 | Expanded industry list with 7 new sectors + renamed constant | 2026-03-03 |
| T18 | Renamed SA_CONSTRUCTION_INDUSTRIES → INDUSTRIES in 4 files | 2026-03-03 |
| T19 | Replaced HardHat → Building2 icon across 7 files | 2026-03-03 |
| T20 | Replaced app.conformedge.co.za → conformedge.co.za in mock UI | 2026-03-03 |
| T21 | Replaced console.error("R2 delete") with captureError() | 2026-03-03 |
| T22 | Replaced raw Resend error forwarding with generic message | 2026-03-03 |

---

## Manual Actions Required

| Item | Action | Owner |
|------|--------|-------|
| **T14** | Go to Resend dashboard → Domains → Add `conformedge.co.za` → Add DNS records → Verify → Update `FROM_ADDRESS` in `src/lib/email.ts` | Nhlanhla |
| **T16** | Go to GitHub repo → Settings → Danger Zone → Change visibility to Private | Nhlanhla |

---

*Updated automatically during development sessions.*

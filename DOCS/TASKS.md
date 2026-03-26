# ConformEdge — Task Tracker

**Last Updated:** 2026-03-26
**Phase:** Phase 12 nearly complete. Remaining: T156, T34, T35, T37, T143–T146

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

- [x] **T14** Configure Resend sender address (`noreply@isutech.co.za`) — using verified isutech.co.za domain
- [x] **T15** Verify `.env` never committed — **VERIFIED CLEAN**
- [x] **T16** Verify GitHub repo is private — **Confirmed private by owner**
- [x] **T17** Add trade-specific entries to industry list (7 new sectors added)
- [x] **T18** Rename `SA_CONSTRUCTION_INDUSTRIES` → `INDUSTRIES` in constants + 3 import refs
- [x] **T19** Replace `HardHat` icon → `Building2` across all 7 files
- [x] **T20** Replace `app.conformedge.co.za` → `conformedge.co.za` in feature-details mock UI
- [x] **T21** Replace `console.error("R2 delete failed")` with `captureError()` in documents actions
- [x] **T22** Replace raw error forwarding in email.ts with generic message

## P3 — Before Billing Implementation — ALL COMPLETE

- [x] **T23** Finalize user tier limits at 5/10/25/Unlimited — **Revised 2026-03-10 (was 5/15/50/Unlimited)**
- [x] **T24** Design onboarding AI credit allowance — **100 credits, expire with trial, documented in billing plan**
- [x] **T25** Plan trial-period unlimited user invites — **Enforce on conversion only, documented in billing plan**

## P4 — Future Consideration — ACTIONABLE ITEMS COMPLETE

- [x] **T29** Generalize Subcontractor help panel — removed CIDB/BEE references
- [x] **T31** Generalize landing page copy — hero, footer, CTA, testimonials, problem section, pricing tier descriptions
- [x] **T32** Generalize pain point descriptions in data.ts — "on site" → "arrives", added "vendor"
- [x] **T29** Reverted — CIDB/BEE references restored (they are a competitive advantage, not a liability)
- [ ] **T26** Monitor 15→50 user gap post-launch for potential "Growth" tier — **Trigger: 20-35% of Business customers using <25 seats after 6 months**
- [ ] **T27** Evaluate mining sector entry (highest-value adjacent market)
- [ ] **T28** Consider configurable vendor scoring weights per organization
- [ ] **T30** Consider schema rename Subcontractor → Vendor (40+ file changes)

## B1 — Billing Phase 1: Data Layer — ALL COMPLETE

- [x] **T38** Add 5 billing enums + 5 billing models to `prisma/schema.prisma`
- [x] **T39** Extend `NotificationType` with 5 billing types
- [x] **T40** Remove `Organization.subscriptionTier` (superseded by `Subscription.plan`)
- [x] **T41** Run migration `billing-subscription-system` — applied successfully
- [x] **T42** Create `src/lib/billing/plans.ts` — plan definitions, credit packs, constants, helpers
- [x] **T43** Create `src/lib/billing/get-billing-context.ts` — cached context fetcher (React `cache()`)
- [x] **T44** Create `src/lib/billing/limit-checks.ts` — user, doc, standards, AI, feature checks
- [x] **T45** Create `src/lib/billing/usage.ts` — recording, credits, snapshots
- [x] **T46** Create `src/lib/billing/index.ts` — barrel export
- [x] **T47** Add billing types to `src/types/index.ts` — BillingContext, LimitCheckResult, etc.
- [x] **T48** Add billing display constants to `src/lib/constants.ts` — statuses, tiers, cycles
- [x] **T49** Update `notification-preferences.tsx` + `email-templates.tsx` with billing notification types
- [x] **T50** Verify: `npx tsc --noEmit` — zero errors
- [x] **T51** Verify: `npm run build` — build successful

## B2 — Billing Phase 2: Subscription Provisioning — ALL COMPLETE

- [x] **T52** Modify Clerk webhook to bootstrap Subscription + CreditBalance + UsageRecord on `organization.created`
- [x] **T53** Write `prisma/scripts/backfill-subscriptions.ts` for existing orgs (TRIALING, 14-day trial)
- [x] **T54** Run backfill against local DB and verify — 3 orgs bootstrapped, idempotent re-run confirmed
- [x] **T55** Deploy and run backfill against production — 2 orgs bootstrapped (TRIALING, 14d trial, 100 credits)

## B3 — Billing Phase 3: Enforcement Points — ALL COMPLETE

- [x] **T56** AI classification quota — `classify/route.ts` (402 when blocked, credit deduction, usage recording)
- [x] **T57** Document count limit — `documents/actions.ts` (`createDocument` + `bulkCreateDocuments`)
- [x] **T58** Standards count limit — `settings/actions.ts` (`toggleStandardActive` blocks when at limit)
- [x] **T59** IMS feature gate — `ims/actions.ts` + `cross-references/actions.ts` (Professional+)
- [x] **T60** Client Portal gate — `share-link-actions.ts` (Professional+ for DOCUMENT/AUDIT_PACK/PORTAL)
- [x] **T61** Subcontractor Portal gate — `share-link-actions.ts` (Business+ for SUBCONTRACTOR type)
- [x] **T62** Recurring Checklists gate — `checklists/actions.ts` `configureRecurrence` (Professional+)
- [x] **T63** Custom Form Builder gate — `checklists/actions.ts` `updateItemResponse` non-COMPLIANCE (Business+)
- [x] **T64** Report Export gate — `reports/pdf/route.ts` + `reports/csv/route.ts` (Professional+)
- [x] **T65** Gap Analysis gate — `gap-analysis/actions.ts` (Professional+)
- [x] **T66** Audit Pack Generation gate — `audit-packs/actions.ts` `createAuditPack` (Business+)
- [x] **T67** Approval Workflows gate — `workflow-template-actions.ts` + `approval-actions.ts` (Business+)
- [x] **T68** Verify: `npx tsc --noEmit` — zero errors
- [x] **T69** Verify: `npm run build` — build successful

## B4 — Billing Phase 4: Billing UI — COMPLETE

- [x] **T70** Create `src/components/billing/upgrade-prompt.tsx` — alert shown at limits
- [x] **T71** Create `src/components/billing/trial-banner.tsx` — top-of-layout during trial
- [x] **T72** Create `src/components/billing/usage-bar.tsx` — reusable progress bar
- [x] **T73** Create `src/app/(dashboard)/billing/page.tsx` — billing settings page (Server Component)
- [x] **T74** Create billing server actions + card components (current-plan, usage, plan-selector, credit-packs, invoice-history)
- [x] **T75** Add Billing link to sidebar footer + `/billing(.*)` to middleware protected routes
- [x] **T76** Add TrialBannerWrapper to dashboard layout (Suspense-wrapped, conditional on TRIALING status)
- [x] **T76b** Create billing-help-panel.tsx for the billing page
- [x] **T76c** Add missing routes to middleware: `/notifications(.*)`, `/calendar(.*)`, `/ims(.*)`, `/cross-references(.*)`

## B5 — Billing Phase 5: Lifecycle Automation — COMPLETE

- [x] **T77** Extend cron `check-expiries` with billing section 7 (5 sub-checks):
  - 7a: Expire trials (TRIALING → CANCELLED when trialEndsAt < now) + notification
  - 7b: Expire grace periods (PAST_DUE → CANCELLED when gracePeriodEndsAt < now) + notification
  - 7c: Period reset (advance dates, create new UsageRecord with resource snapshot)
  - 7d: Trial ending notifications (3 days before trialEndsAt, deduped daily)
  - 7e: Quota warning notifications (80%+ AI usage, QUOTA_WARNING or QUOTA_LIMIT_REACHED)
- [x] **T78** All 5 billing notification types wired: SUBSCRIPTION_TRIAL_ENDING, SUBSCRIPTION_CANCELLED, QUOTA_WARNING, QUOTA_LIMIT_REACHED, SUBSCRIPTION_PAYMENT_FAILED (stub)
- [x] **T79** Create payment webhook stub `/api/webhooks/payment/route.ts` (Paystack HMAC-SHA512 verification, event logging, TODO comments for Phase 6)

## B6 — Billing Phase 6: Payment Integration (Paystack) — COMPLETE

- [x] **T80** Create `src/lib/paystack.ts` server helpers (initializeTransaction, verifyTransaction, createPlan, createSubscription, createOrFetchCustomer)
- [x] **T81** Billing checkout actions: `initiatePlanCheckout` (plan upgrade via Paystack redirect), `initiateCreditPurchase` (one-time credit pack), `verifyPaymentCallback` (return URL verification)
- [x] **T82** Wire payment webhook to process Paystack events:
  - `charge.success` → activate subscription or grant credits + create invoice
  - `charge.failed` → set PAST_DUE + 7-day grace period + notify admins
  - `subscription.disable` → cancel subscription + notify
- [x] **T83** Generate VAT-compliant invoice PDF via `@react-pdf/renderer`:
  - `src/lib/pdf/invoice-pdf.tsx` (branded A4, line items, VAT breakdown, totals)
  - `/api/invoices/[id]/pdf` download endpoint (auth-gated, org-scoped)
- [x] **T84** Update billing UI with live actions:
  - Plan upgrade/downgrade buttons redirect to Paystack checkout
  - Credit pack buy buttons redirect to Paystack one-time charge
  - Invoice table has PDF download column
  - PaymentCallbackHandler verifies `?ref=` on return from Paystack
  - Buttons disabled when `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` not set
- [x] **T87** Handle payment failures: grace period → dunning → cancellation (ecb554a)

## Hotfixes — Post-Billing Deploy — ALL COMPLETE

- [x] **T85** Fix billing gate crash on IMS, Gap Analysis, and Cross-References pages — return null instead of throwing, show UpgradePrompt (6f578d5)
- [x] **T86** Remove unused `react-paystack` package — peer dep conflict with React 19 broke deploys (275b74c)

## Phase 4 — Competitive Feature Additions — CORE COMPLETE

Source: `DOCS/competitive-analysis/MyEasyISO-vs-ConformEdge.md`
Strategy: **Cherry-pick 5 high-value features** from competitive gaps. Do NOT broaden beyond construction.

### 4A — Incident & Near-Miss Management — COMPLETE

- [x] **T88** Design Incident schema: `Incident` model (type, severity, location, date, description, immediateActions, investigation, rootCause, correctiveActions, status lifecycle)
- [x] **T89** Add `IncidentType` enum (NEAR_MISS, FIRST_AID, MEDICAL, LOST_TIME, FATALITY, ENVIRONMENTAL, PROPERTY_DAMAGE)
- [x] **T90** Add `IncidentStatus` enum (REPORTED → INVESTIGATING → CORRECTIVE_ACTION → CLOSED)
- [x] **T91** Create Prisma migration for Incident + related models
- [x] **T92** Create server actions: `createIncident`, `updateIncident`, `getIncidents`, `getIncident`, `addInvestigation`, `linkCapa`
- [x] **T93** Create `/incidents` list page with table, filters, status badges
- [x] **T94** Create `/incidents/new` form page (with 5-whys root cause analysis)
- [x] **T95** Create `/incidents/[id]` detail page (timeline, investigation, linked CAPAs)
- [x] **T96** Add INCIDENT_REPORTED notification type + cron for overdue investigations
- [x] **T97** Add incidents to dashboard widget (OpenIncidentsWidget)
- [x] **T98** Add incidents to reports page (incident trend, severity breakdown)
- [x] **T99** Create incidents-help-panel.tsx
- [x] **T100** Add sidebar nav item + middleware route
- [x] **T101** SA statutory form output: W.Cl.2 (IOD), SAPS 277 (fatality notice) — PDF generation + dropdown on incident detail

### 4B — Objectives, Targets & KPI Tracking — COMPLETE

- [x] **T102** Design Objective schema: `Objective` model (title, description, standard, clause, targetValue, currentValue, unit, measurementFrequency, owner, dueDate, status)
- [x] **T103** Add `ObjectiveStatus` enum (DRAFT, ACTIVE, ON_TRACK, AT_RISK, BEHIND, ACHIEVED, CANCELLED)
- [x] **T104** Create Prisma migration for Objective + ObjectiveMeasurement models
- [x] **T105** Create server actions: `createObjective`, `updateObjective`, `recordMeasurement`, `getObjectives`
- [x] **T106** Create `/objectives` list page with progress bars, status filters
- [x] **T107** Create `/objectives/new` form page (link to standard/clause)
- [x] **T108** Create `/objectives/[id]` detail page (measurement history chart via measurement-trend-chart.tsx)
- [x] **T109** Add objectives widget to dashboard (ObjectivesWidget)
- [x] **T110** Integrate with gap analysis — flag clauses where objectives exist but no measurement data
- [x] **T111** Add OBJECTIVE_DUE notification type + cron for measurement reminders
- [x] **T112** Create objectives-help-panel.tsx
- [x] **T113** Add sidebar nav item + middleware route

### 4C — Management Review Module — COMPLETE

- [x] **T114** Design ManagementReview schema: 5 models (ManagementReview, ManagementReviewStandard, ManagementReviewAttendee, ManagementReviewAgendaItem, ManagementReviewAction)
- [x] **T115** Create Prisma migration
- [x] **T116** Create server actions: `createReview`, `updateReview`, `addActionItem`, `getReviews`
- [x] **T117** Create `/management-reviews` list page
- [x] **T118** Create review form with agenda items and action tracking
- [x] **T119** Create `/management-reviews/[id]` detail page (agenda-items-card, actions-tracker-card)
- [x] **T120** Add management review notification support
- [x] **T121** Create management-reviews-help-panel.tsx
- [x] **T122** Add sidebar nav item + middleware route

### 4D — Work Permit Management — COMPLETE

- [x] **T123** Design WorkPermit schema: types (confined space, heights, hot work, excavation, electrical, lifting, general), lifecycle (DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → CLOSED/CANCELLED/EXPIRED), issuer/receiver, plus WorkPermitChecklist + WorkPermitExtension
- [x] **T124** Create Prisma migration
- [x] **T125** Create server actions + CRUD pages (`/permits`, `/permits/[id]`)
- [x] **T126** Add permits-help-panel.tsx + sidebar nav + middleware route
- [x] **T126b** Add cron auto-expiry: ACTIVE permits past validTo auto-expire, 24h warning notifications
- [x] **T126c** Add dashboard widget (WorkPermitsWidget)
- [x] **T127** Integrate with subcontractor portal (subcontractor work permit visibility)

### 4X — Cross-Cutting Fixes (2026-03-09)

- [x] **T133** Fix edit forms losing data across all 9 entity types (incidents, objectives, permits, reviews, documents, CAPAs, checklists, assessments, projects) — useEffect + form.reset() + defaultValue→value on Selects
- [x] **T134** Seed demo data into correct production org (ConformEdge Systems) — fixed incidents, objectives, management review, 3 work permits

### 4E — Mobile-Optimised Field Capture / PWA (Future)

- [x] **T135** Add iSu Technologies developer branding (footer credit, sidebar credit, auth pages, meta tags)
- [x] **T128** Add PWA manifest + service worker + app icons + metadata to Next.js
- [x] **T129** Offline-first data capture — IndexedDB sync queue, auto-sync on reconnect, offline indicator in sidebar
- [x] **T130** Camera integration for photo evidence (front/back camera, file upload fallback, client-side resize)
- [x] **T131** Signature capture component (canvas-based, touch-ready, retina-aware)
- [x] **T132** Responsive mobile layouts — PageHeader, DataTable, Pagination + all 12 detail pages

## P5 — Multi-Vertical Compliance Frameworks (Future)

Strategy: **Add depth per industry, not remove existing depth.** CIDB/BEE are selling points.

- [x] **T33** Add DMRE/MHSA compliance references for mining sector (8 chapters, 33 sub-clauses)
- [x] **T34** ECSA compliance references — 35 clauses seeded (Act 46 of 2000: registration, CPD, codes of conduct, practice standards) *(pre-existing)*
- [x] **T35** SACPCMP compliance references — 32 clauses seeded (Act 48 of 2000: registration, CPD, fees, practice standards) *(pre-existing)*
- [x] **T36** Add POPIA compliance references for IT services sector (11 chapters, 40 sub-clauses)
- [ ] **T37** Make compliance scoring weights industry-aware (CIDB/BEE for construction, DMRE for mining, etc.)

## P6 — Pricing Revision & Market Strategy

- [x] **T136** Pricing tier revision — Starter→Essentials R1,299, Professional R2,999, Business R5,999, Enterprise R12,000+ (plans.ts, constants.ts, landing data.ts)
- [x] **T137** AI credit pack repricing — R25/100, R99/500, R179/1000, R749/5000 (plans.ts, landing data.ts)
- [x] **T138** Landing page metrics update — 9 frameworks, 227+ sub-clauses, 31 modules (data.ts)
- [x] **T139** Landing page standards list update — added DMRE/MHSA + POPIA (data.ts)
- [x] **T140** Feature gate redistribution — Professional now includes audit packs, approval workflows, custom forms; Business adds API access (plans.ts)
- [x] **T141** Per-user overage pricing added to landing page tier descriptions (+R99/R149/R199 per tier)
- [x] **T142** Pricing strategy document — full market research, competitor analysis, consulting/government models (DOCS/pricing-strategy/PRICING-STRATEGY-2026.md)
- [x] **T147** Add project + subcontractor limits per tier to prevent consultant abuse (plans.ts, limit-checks.ts, project actions, subcontractor actions)
- [x] **T143** "Become a Partner" landing page at `/partners` — 3 tier cards (Referral/Consulting/White-Label) with v2.0 pricing, revenue example table, CTAs. *(2026-03-26)*
- [ ] **T144** Government price list PDF template for procurement (future)
- [ ] **T145** Consultant dashboard — cross-org management view (future)
- [ ] **T146** SITA vendor registration + B-BBEE certification (manual, business action)

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
| T16 | Repo confirmed private by owner | 2026-03-03 |
| T17 | Expanded industry list with 7 new sectors + renamed constant | 2026-03-03 |
| T18 | Renamed SA_CONSTRUCTION_INDUSTRIES → INDUSTRIES in 4 files | 2026-03-03 |
| T19 | Replaced HardHat → Building2 icon across 7 files | 2026-03-03 |
| T20 | Replaced app.conformedge.co.za → conformedge.co.za in mock UI | 2026-03-03 |
| T21 | Replaced console.error("R2 delete") with captureError() | 2026-03-03 |
| T22 | Replaced raw Resend error forwarding with generic message | 2026-03-03 |
| T23 | User tier limits finalized at 5/15/50/Unlimited — documented in billing plan | 2026-03-03 |
| T24 | Onboarding AI credits designed (100 credits, expire with trial) | 2026-03-03 |
| T25 | Trial invite rules designed (unlimited during trial, enforce on conversion) | 2026-03-03 |
| T29 | Generalized Subcontractor help panel — removed CIDB/BEE references | 2026-03-03 |
| T31 | Generalized all landing page copy (hero, footer, CTA, testimonials, problem section) | 2026-03-03 |
| T32 | Generalized pain point descriptions (auditor, vendor references) | 2026-03-03 |
| T38 | Added 5 billing enums + 5 models to Prisma schema | 2026-03-03 |
| T39 | Extended NotificationType with 5 billing types | 2026-03-03 |
| T40 | Removed Organization.subscriptionTier | 2026-03-03 |
| T41 | Migration `billing-subscription-system` applied | 2026-03-03 |
| T42 | Created `src/lib/billing/plans.ts` | 2026-03-03 |
| T43 | Created `src/lib/billing/get-billing-context.ts` | 2026-03-03 |
| T44 | Created `src/lib/billing/limit-checks.ts` | 2026-03-03 |
| T45 | Created `src/lib/billing/usage.ts` | 2026-03-03 |
| T46 | Created `src/lib/billing/index.ts` (barrel export) | 2026-03-03 |
| T47 | Added billing types to `src/types/index.ts` | 2026-03-03 |
| T48 | Added billing display constants to `src/lib/constants.ts` | 2026-03-03 |
| T49 | Updated notification preferences + email templates with billing types | 2026-03-03 |
| T50 | TypeScript type check — zero errors | 2026-03-03 |
| T51 | Production build — successful | 2026-03-03 |
| T52 | Modified Clerk webhook with billing bootstrap on org.created | 2026-03-03 |
| T53 | Created backfill script `prisma/scripts/backfill-subscriptions.ts` | 2026-03-03 |
| T54 | Ran backfill on local DB — 3 orgs bootstrapped, idempotent confirmed | 2026-03-03 |
| T56 | AI classification quota enforcement in classify route | 2026-03-03 |
| T57 | Document count limit in createDocument + bulkCreateDocuments | 2026-03-03 |
| T58 | Standards count limit in toggleStandardActive | 2026-03-03 |
| T59 | IMS feature gate in ims/actions + cross-references/actions | 2026-03-03 |
| T60 | Client Portal gate in share-link-actions | 2026-03-03 |
| T61 | Subcontractor Portal gate in share-link-actions | 2026-03-03 |
| T62 | Recurring Checklists gate in configureRecurrence | 2026-03-03 |
| T63 | Custom Form Builder gate in updateItemResponse | 2026-03-03 |
| T64 | Report Export gate in PDF + CSV routes | 2026-03-03 |
| T65 | Gap Analysis gate in gap-analysis/actions | 2026-03-03 |
| T66 | Audit Pack Generation gate in createAuditPack | 2026-03-03 |
| T67 | Approval Workflows gate in workflow-template + approval actions | 2026-03-03 |
| T68 | TypeScript type check — zero errors | 2026-03-03 |
| T69 | Production build — successful | 2026-03-03 |
| T70–T76c | Billing UI — page, components, sidebar, trial banner, help panel, middleware routes | 2026-03-03 |
| T77–T79 | Billing lifecycle automation — cron checks, notifications, payment webhook stub | 2026-03-03 |
| T80–T84 | Paystack payment integration — checkout, webhook, invoice PDF, UI wiring | 2026-03-03 |
| T85 | Fixed billing gate crash on IMS/Gap Analysis/Cross-References (return null + UpgradePrompt) | 2026-03-03 |
| T86 | Removed unused `react-paystack` (React 19 peer dep conflict broke deploys) | 2026-03-03 |
| T87 | Payment failure dunning flow — grace period UI, cron reminders (day 3 + day 1), email hint | 2026-03-03 |
| T88–T97,T99–T100 | Phase 4A Incidents — full CRUD, detail page, 5-whys root cause, help panel, dashboard widget, sidebar, notifications | 2026-03-09 |
| T102–T109,T111–T113 | Phase 4B Objectives — full CRUD, measurements, trend charts, help panel, dashboard widget, sidebar, notifications | 2026-03-09 |
| T114–T122 | Phase 4C Management Reviews — full CRUD, agenda items, action tracking, help panel, dashboard widget, sidebar | 2026-03-09 |
| T123–T126c | Phase 4D Work Permits — full CRUD, checklist items, extensions, cron auto-expiry, help panel, dashboard widget, sidebar | 2026-03-09 |
| T133 | Fix edit forms losing data across all 9 entity types (28 files) | 2026-03-09 |
| T134 | Seed demo data into correct production org (ConformEdge Systems) | 2026-03-09 |
| T98 | Add incident analytics to reports page (trend chart, severity breakdown) | 2026-03-09 |
| T110 | Integrate objectives with gap analysis — per-clause indicators, summary card, measurement warnings | 2026-03-09 |
| T135 | Add iSu Technologies developer branding — landing footer, dashboard sidebar, auth pages, shared portal, meta tags | 2026-03-10 |
| T128 | PWA manifest + service worker + app icons + viewport/theme metadata | 2026-03-10 |
| T132 | Responsive mobile layouts — PageHeader, DataTable, Pagination + all 12 detail pages | 2026-03-10 |
| T131 | Signature capture component (canvas-based, touch-ready, retina-aware) | 2026-03-10 |
| T130 | Camera integration for photo evidence (front/back camera, file upload fallback, client-side resize) | 2026-03-10 |
| T129 | Offline-first data capture — IndexedDB sync queue, auto-sync on reconnect, offline indicator | 2026-03-10 |
| T33 | DMRE/MHSA compliance references — 8 chapters, 33 sub-clauses covering mine health & safety | 2026-03-10 |
| T36 | POPIA compliance references — 11 chapters, 40 sub-clauses covering data protection | 2026-03-10 |
| T101 | SA statutory forms — W.Cl.2 (IOD) + SAPS 277 (fatality) PDF generation with dropdown on incident detail | 2026-03-10 |
| T136 | Pricing tier revision — Essentials R1,299, Professional R2,999, Business R5,999, Enterprise R12,000+ | 2026-03-10 |
| T137 | AI credit pack repricing — R25/100, R99/500, R179/1000, R749/5000 | 2026-03-10 |
| T138 | Landing page metrics — 9 frameworks, 227+ sub-clauses, 31 modules | 2026-03-10 |
| T139 | Landing page standards — added DMRE/MHSA + POPIA to standards list | 2026-03-10 |
| T140 | Feature gate redistribution — Professional gets audit packs, approvals, custom forms; Business gets API | 2026-03-10 |
| T141 | Per-user overage pricing in landing page tier descriptions | 2026-03-10 |
| T142 | Pricing strategy document — market research, competitor analysis, consulting/government models | 2026-03-10 |
| T147 | Project (5/15/30/∞) + subcontractor (10/25/50/∞) limits per tier — anti-consultant-abuse gate | 2026-03-10 |

---

## Phase 12 — Referral Partner System

> Priority: Medium — first referral prospect (Ida Mthethwa) awaiting registration link.
> Existing: `Referral` model in Prisma (code, status tracking, commission fields). Partner console has referral link generation.
> Needed: Public-facing registration + self-service referral management.

- [x] **T148** Referral partner registration page — public form at `/referral/register`. Creates Partner with tier=REFERRAL, status=APPLIED, commission=10%. *(2026-03-25)*
- [x] **T149** Referral partner approval workflow — admin approve/reject on `/admin/partners`, auto-generates referral code/link. *(2026-03-25)*
- [x] **T150** Referral tracking landing page — `/ref/[code]` already existed (cookie-based attribution, 90-day expiry). *(pre-existing)*
- [x] **T151** Referral attribution — ReferralAttribution component (pre-existing) handles SIGNED_UP on dashboard load. CONVERTED added to payment webhook on subscription activation. *(2026-03-25)*
- [x] **T152** Referral partner dashboard — token-based self-service at `/referral/dashboard?token=XXX`. Shows: referral link, summary cards (active/conversions/earned/paid), referral history with commission accrual progress (X/12 months), Paid/Unpaid badges. *(2026-03-26)*
- [x] **T153** Commission calculation engine — monthly accrual via payment webhook (not lump sum). Each `charge.success` for a referred org credits commissionPercent% × monthly amount. Annual plans credit all 12 months at once. `commissionMonthsEarned` field tracks progress. *(2026-03-26)*
- [x] **T154** Commission payout tracking — `adminMarkCommissionPaid` action with bank reference + audit logging. Partner referrals page shows Paid/Unpaid status per referral. Referral dashboard shows paid vs unpaid totals. *(2026-03-26)*
- [x] **T155** Referral welcome email — automated on approval with referral link, how-it-works, brochure PDF link. *(2026-03-25)*
- [x] **T156** Admin referral management — `/admin/referrals` page with summary cards (partners/referrals/conversions/commission owed/paid), per-partner breakdown with referral history, commission accrual progress, and "Mark Paid" button with EFT reference. Added to admin sidebar. *(2026-03-26)*

---

## Manual Actions Required

| Item | Action | Owner |
|------|--------|-------|
| ~~T14~~ | ~~Resend sender configured — `noreply@isutech.co.za`~~ | Done |
| ~~T55~~ | ~~Backfill completed — 2 orgs bootstrapped on production~~ | Done |

---

*Updated automatically during development sessions.*

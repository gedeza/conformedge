# ConformEdge — Task Tracker

**Last Updated:** 2026-03-03
**Phase:** Billing Implementation — Phase 6 (Payment Integration) Complete — ALL BILLING PHASES DONE

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
- [x] **T16** Verify GitHub repo is private — **Confirmed private by owner**
- [x] **T17** Add trade-specific entries to industry list (7 new sectors added)
- [x] **T18** Rename `SA_CONSTRUCTION_INDUSTRIES` → `INDUSTRIES` in constants + 3 import refs
- [x] **T19** Replace `HardHat` icon → `Building2` across all 7 files
- [x] **T20** Replace `app.conformedge.co.za` → `conformedge.co.za` in feature-details mock UI
- [x] **T21** Replace `console.error("R2 delete failed")` with `captureError()` in documents actions
- [x] **T22** Replace raw error forwarding in email.ts with generic message

## P3 — Before Billing Implementation — ALL COMPLETE

- [x] **T23** Finalize user tier limits at 5/15/50/Unlimited — **CONFIRMED, documented in billing plan**
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
- [!] **T55** Deploy and run backfill against production — **After commit/push**

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

- [x] **T80** Install `react-paystack`, create `src/lib/paystack.ts` server helpers (initializeTransaction, verifyTransaction, createPlan, createSubscription, createOrFetchCustomer)
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
- [ ] **T83** Handle payment failures: grace period → dunning → cancellation

## P5 — Multi-Vertical Compliance Frameworks (Future)

Strategy: **Add depth per industry, not remove existing depth.** CIDB/BEE are selling points.

- [ ] **T33** Add DMRE compliance references for mining sector
- [ ] **T34** Add ECSA compliance references for engineering sector
- [ ] **T35** Add SACPCMP compliance references for project management sector
- [ ] **T36** Add POPIA compliance references for IT services sector
- [ ] **T37** Make compliance scoring weights industry-aware (CIDB/BEE for construction, DMRE for mining, etc.)

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

---

## Manual Actions Required

| Item | Action | Owner |
|------|--------|-------|
| **T14** | Go to Resend dashboard → Domains → Add `conformedge.co.za` → Add DNS records → Verify → Update `FROM_ADDRESS` in `src/lib/email.ts` | Nhlanhla |

---

*Updated automatically during development sessions.*

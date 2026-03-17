# ConformEdge — Billing & Subscription Implementation Plan

**Date:** 2026-03-03
**Author:** Nhlanhla Mnyandu / ISU Technologies
**Status:** Approved — Ready for Implementation

---

## Executive Summary

Transform ConformEdge from an open-access platform into a monetised SaaS with 4-tier subscriptions, AI credit system, and payment processing. This plan covers schema design, feature gating, payment integration, billing UI, and lifecycle automation across 6 phases.

---

## 1. Current State

### What Exists
| Item | Status |
|------|--------|
| Landing page pricing (R699/R1,999/R5,499/Custom) | Shipped — annual toggle + AI credit packs |
| `Organization.subscriptionTier` column | Exists in schema, never read or written |
| `Organization.settings` JSON | Stores only `autoClassifyOnUpload` |
| AI classify route with rate limiter | In-memory 10/60s — no monthly quota |
| Clerk webhook org sync | Creates org with name/slug only |
| Cron job infrastructure | 6 existing checks — extensible |
| Notification system | Dual-channel (in-app + email via Resend) |
| `@react-pdf/renderer` | Already used for audit packs — reusable for invoices |

### What's Missing
- Subscription, Invoice, CreditBalance, CreditTransaction, UsageRecord models
- Plan enforcement layer (feature gating + quota checks)
- Usage counting for AI classifications
- Payment processor integration
- Billing settings page
- Trial flow and lifecycle automation
- Upgrade prompts at limit enforcement points

---

## 2. Payment Provider Recommendation

### Primary: Paystack

| Criteria | Paystack | PayFast | Yoco |
|----------|----------|---------|------|
| Recurring billing | Native Subscriptions API | Tokenization only (no lifecycle) | Not supported |
| Card fees | 2.9% + R1 | 3.2% + R2 | 2.55–2.95% |
| EFT | Via Ozow (no Capitec) | Native (9 banks inc. Capitec) | Not supported |
| API quality | Excellent (Stripe-owned) | Adequate but dated | Decent, limited |
| Node.js SDK | react-paystack + REST | Community libs | REST only |
| Webhooks | Comprehensive event system | ITN (basic) | Basic |
| Proration | Build yourself | Build yourself | N/A |

**Verdict:** Paystack is the clear winner — only SA provider with native subscription management, lowest card fees, best DX. Consider PayFast alongside only if Capitec EFT support proves critical for B2B customers.

### SA VAT
- Current rate: 15%
- All prices should be quoted VAT-inclusive
- Store net + VAT separately in DB
- Generate compliant tax invoices via `@react-pdf/renderer`

---

## 3. Architecture

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Plan definitions | Hardcoded in TypeScript | Never change without deploy; avoids DB table for static data |
| Billing context caching | React `cache()` per request | Same pattern as `getAuthContext()` — zero extra infrastructure |
| Credit system | Separate balance table | Monthly quota resets each period; purchased credits never expire |
| Quota enforcement | Per-action checks in server actions | Not middleware — billing should not block page loads |
| Usage tracking | DB integer counters | Simple, sufficient for per-period quota enforcement |
| Proration | Skip for now | Industry standard for new SaaS — add later when payment processor is live |

### Data Flow — AI Classification (Primary Billing Enforcement)

```
User clicks "Classify"
  → POST /api/documents/[id]/classify
    → getAuthContext()                           [cached, 1 DB hit]
    → Rate limit check                           [in-memory]
    → getBillingContext(dbOrgId)                  [cached, 1 DB hit]
    → checkAiClassificationLimit(billing, used, credits)
      → monthlyUsed < quota?     → allowed, no credit
      → quota exhausted + credits? → allowed, use 1 credit
      → no quota + no credits?    → HTTP 402
    → [AI classification proceeds]
    → recordAiClassificationUsage()              [fire-and-forget]
      → increment usageRecord.aiClassificationsUsed
      → if credit used: decrement creditBalance, log transaction
```

---

## 4. Prisma Schema Additions

### New Enums
```
SubscriptionStatus:     TRIALING | ACTIVE | PAST_DUE | CANCELLED | PAUSED
BillingCycle:           MONTHLY | ANNUAL
PlanTier:               STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE
CreditTransactionType:  PURCHASE | USAGE | ADJUSTMENT | REFUND
InvoiceStatus:          DRAFT | OPEN | PAID | VOID | UNCOLLECTIBLE
PaymentMethod:          PAYSTACK | EFT | INVOICE | PREPAID          ← Added 13 March 2026
AccountTransactionType: FUND | DEDUCT | REFUND | ADJUSTMENT          ← Added 13 March 2026
```

### New Models (6)

**Subscription** (1:1 with Organization)
- plan, status, billingCycle, currentPeriodStart/End, trialEndsAt
- cancelAtPeriodEnd, gracePeriodEndsAt, externalSubId
- paymentMethod (PAYSTACK default), paymentTermsDays (null/30/60) ← Added 13 March 2026

**Invoice**
- amountZar (cents), status, billingCycle, periodStart/End, dueAt, paidAt
- lineItems (JSON), externalPaymentId
- bankReference (EFT reference number) ← Added 13 March 2026

**AccountBalance** (1:1 with Organization) ← Added 13 March 2026
- balanceCents, lifetimeFundedCents, lifetimeDeductedCents

**AccountTransaction** ← Added 13 March 2026
- type (FUND/DEDUCT/REFUND/ADJUSTMENT), amountCents, balanceAfterCents
- description, invoiceId (nullable), performedById (nullable)

**CreditBalance** (1:1 with Organization)
- balance, lifetimeEarned, lifetimeUsed

**CreditTransaction**
- type, amount (+/-), balanceAfter, description
- documentId (nullable — links to AI usage), invoiceId (nullable — links to purchase)

**UsageRecord** (per billing period per org)
- aiClassificationsUsed, documentsCount, usersCount, standardsCount
- Unique constraint on (organizationId, periodStart)

### Extend NotificationType
```
SUBSCRIPTION_TRIAL_ENDING
SUBSCRIPTION_PAYMENT_FAILED
SUBSCRIPTION_CANCELLED
QUOTA_LIMIT_REACHED
QUOTA_WARNING (at 80%)
```

### Remove
- `Organization.subscriptionTier` — superseded by `Subscription.plan`

---

## 5. Feature-to-Tier Gate Map

### Tier Limits — FINALIZED (2026-03-03)
User limits **5 / 15 / 50 / Unlimited** are confirmed and locked. Analysis showed:
- Reducing to 3/10/30 makes every gap worse (pushes viable customers to higher tiers too early)
- Current numbers align with SA CIDB grading segments (Grade 3-5 → Starter, Grade 6-7 → Professional, Grade 7-8 → Business)
- ConformEdge offers 2x the users per tier vs competitors (Qualio)
- **Future monitor:** If after 6 months, 20-35% of Business customers use <25 seats, consider a "Growth" tier at R2,999/mo with 30 users

### Soft Limits (Count-Based)

| Resource | Starter | Professional | Business | Enterprise | Enforcement Point |
|----------|---------|-------------|----------|------------|-------------------|
| Users | 5 | 15 | 50 | Unlimited | Clerk webhook + invite action |
| Standards | 2 | 7 | Unlimited | Unlimited | `toggleStandardActive` |
| Documents | 500 | Unlimited | Unlimited | Unlimited | `createDocument`, `bulkCreateDocuments` |
| AI/month | 50 | 200 | 500 | Unlimited | Classify route |

### Hard Gates (Feature Access)

| Feature | Starter | Professional | Business | Enterprise | Key File(s) |
|---------|---------|-------------|----------|------------|-------------|
| Checklists (compliance) | Yes | Yes | Yes | Yes | — |
| Assessments + Calendar | Yes | Yes | Yes | Yes | — |
| CAPAs (basic) | Yes | Yes | Yes | Yes | — |
| Audit Trail | Yes | Yes | Yes | Yes | — |
| IMS Dashboard | No | Yes | Yes | Yes | `ims/actions.ts`, `cross-references/actions.ts` |
| Client Portal | No | Yes | Yes | Yes | `share-link-actions.ts` |
| Recurring Checklists | No | Yes | Yes | Yes | `checklists/actions.ts` |
| Report Export (PDF/CSV) | No | Yes | Yes | Yes | `reports/pdf/route.ts`, `reports/csv/route.ts` |
| Gap Analysis | No | Yes | Yes | Yes | `gap-analysis/actions.ts` |
| Subcontractor Portal | No | No | Yes | Yes | `share-link-actions.ts` (SUBCONTRACTOR type) |
| Custom Form Builder | No | No | Yes | Yes | `checklists/actions.ts` (non-COMPLIANCE fieldType) |
| Audit Pack Generation | No | No | Yes | Yes | `audit-packs/actions.ts` |
| Approval Workflows | No | No | Yes | Yes | `workflow-template-actions.ts`, `approval-actions.ts` |
| Custom Standards | No | No | Yes | Yes | `toggleStandardActive` |
| API Access | No | No | No | Yes | New API routes (future) |
| SSO | No | No | No | Yes | Clerk configuration |

---

## 6. New Files to Create

### Billing Core (`src/lib/billing/`)
| File | Purpose |
|------|---------|
| `plans.ts` | Hardcoded plan definitions, limits, credit packs, constants |
| `get-billing-context.ts` | Cached billing context fetcher (mirrors `getAuthContext`) |
| `limit-checks.ts` | Pure limit check functions: users, docs, standards, AI, features |
| `usage.ts` | Fire-and-forget usage recording helpers |

### Billing Page (`src/app/(dashboard)/billing/`)
| File | Purpose |
|------|---------|
| `page.tsx` | Billing settings page (Server Component) |
| `actions.ts` | Server actions: changePlan, purchaseCreditPack, cancelSubscription, getInvoices, getCreditTransactions |
| `current-plan-card.tsx` | Active plan display, status, cancel option |
| `usage-card.tsx` | Progress bars for all quota resources |
| `credit-packs-card.tsx` | Purchase packs, show balance + transaction history |
| `plan-selector-card.tsx` | Plan comparison table with upgrade/downgrade CTAs |
| `invoice-history-card.tsx` | Invoice table with status, amount, period |

### Billing Components (`src/components/billing/`)
| File | Purpose |
|------|---------|
| `upgrade-prompt.tsx` | Alert shown when hitting limits — link to billing page |
| `trial-banner.tsx` | Top-of-layout banner during trial period |
| `usage-bar.tsx` | Reusable progress bar component |

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/webhooks/payment/route.ts` | Payment processor webhook stub (Paystack) |

### Scripts
| File | Purpose |
|------|---------|
| `prisma/scripts/backfill-subscriptions.ts` | One-time: create Subscription + CreditBalance + UsageRecord for all existing orgs |

---

## 7. Existing Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 6 models, 5 enums, extend Organization relations, extend NotificationType, remove `subscriptionTier` |
| `src/app/api/webhooks/clerk/route.ts` | Bootstrap Subscription + CreditBalance + UsageRecord on `organization.created` |
| `src/app/api/documents/[id]/classify/route.ts` | Add getBillingContext + checkAiClassificationLimit + recordUsage |
| `src/app/(dashboard)/documents/actions.ts` | Add checkDocumentLimit in createDocument/bulkCreateDocuments |
| `src/app/(dashboard)/settings/actions.ts` | Add checkStandardsLimit in toggleStandardActive, checkUserLimit in member management |
| `src/app/(dashboard)/ims/page.tsx` | Add hasIms feature gate → redirect to /billing |
| `src/app/(dashboard)/cross-references/actions.ts` | Add hasIms feature gate |
| `src/app/(dashboard)/settings/share-link-actions.ts` | Gate DOCUMENT/AUDIT_PACK/PORTAL links (Professional+), SUBCONTRACTOR links (Business+) |
| `src/app/(dashboard)/checklists/actions.ts` | Gate configureRecurrence (Professional+), non-COMPLIANCE fieldType (Business+) |
| `src/app/(dashboard)/audit-packs/actions.ts` | Gate createAuditPack, compileAuditPack (Business+) |
| `src/app/(dashboard)/settings/workflow-template-actions.ts` | Gate all workflow template actions (Business+) |
| `src/app/(dashboard)/documents/approval-actions.ts` | Gate submitForApproval and review actions (Business+) |
| `src/app/api/reports/pdf/route.ts` | Gate PDF export (Professional+) |
| `src/app/api/reports/csv/route.ts` | Gate CSV export (Professional+) |
| `src/app/(dashboard)/gap-analysis/actions.ts` | Gate getGapAnalysis (Professional+) |
| `src/app/(dashboard)/layout.tsx` | Fetch billing context, render TrialBanner |
| `src/components/dashboard/app-sidebar.tsx` | Add Billing link to sidebar |
| `src/middleware.ts` | Add /billing to protected routes |
| `src/app/api/cron/check-expiries/route.ts` | Add section 7: trial expiry, grace period, period reset, usage record creation |
| `src/lib/constants.ts` | Add billing-related display constants |
| `src/types/index.ts` | Add billing TypeScript types |

---

## 8. Implementation Phases

### Phase 1 — Data Layer (Foundation)
**Estimated scope: Schema + core billing utilities**

1. Add all new enums and models to `prisma/schema.prisma`
2. Remove `Organization.subscriptionTier` (superseded by `Subscription.plan`)
3. Run `npx prisma migrate dev --name billing-subscription-system`
4. Create `src/lib/billing/plans.ts` — plan definitions matching landing page exactly
5. Create `src/lib/billing/get-billing-context.ts` — cached context fetcher
6. Create `src/lib/billing/limit-checks.ts` — pure check functions
7. Create `src/lib/billing/usage.ts` — fire-and-forget recording
8. Add billing types to `src/types/index.ts`
9. Verify: `npx tsc --noEmit && npm run build`

### Phase 2 — Subscription Provisioning
**Estimated scope: Webhook + backfill + notifications**

1. Modify Clerk webhook to bootstrap Subscription + CreditBalance + UsageRecord on `organization.created`
2. Write `prisma/scripts/backfill-subscriptions.ts` for existing orgs (TRIALING, 14-day trial)
3. Add new notification types to enum and constants
4. Run backfill against local DB and verify
5. Deploy and run backfill against production

### Phase 3 — Enforcement Points
**Estimated scope: Gate every server action and API route**

1. AI classification quota — classify route (primary enforcement)
2. Document count limit — `createDocument`, `bulkCreateDocuments`
3. Standards count limit — `toggleStandardActive`
4. User count limit — member invite flow
5. IMS feature gate — IMS page + cross-references
6. Client Portal gate — share link creation (DOCUMENT/AUDIT_PACK/PORTAL types)
7. Recurring checklists gate — `configureRecurrence`
8. Report export gate — PDF/CSV routes
9. Gap analysis gate
10. Subcontractor Portal gate — SUBCONTRACTOR share links + cert review
11. Custom form builder gate — non-COMPLIANCE field types
12. Audit pack gate — create + compile + PDF/email
13. Approval workflow gate — all template + approval actions

### Phase 4 — Billing UI
**Estimated scope: Settings page + prompts + banner**

1. Create `src/components/billing/` — upgrade-prompt, trial-banner, usage-bar
2. Create `src/app/(dashboard)/billing/` — page + all card components + actions
3. Add Billing link to sidebar
4. Add trial banner to dashboard layout
5. Add /billing to middleware protected routes
6. Wire upgrade prompts into feature-gated pages (IMS, etc.)

### Phase 5 — Lifecycle Automation
**Estimated scope: Cron + payment webhook**

1. Extend cron `check-expiries` with billing section:
   - Expire trials (TRIALING → CANCELLED when trialEndsAt < now)
   - Expire grace periods (PAST_DUE → CANCELLED when gracePeriodEndsAt < now)
   - Period reset (create new UsageRecord with zero counters)
   - Trial ending notifications (3 days before)
   - Quota warning notifications (at 80%)
2. Create payment webhook stub at `/api/webhooks/payment/route.ts`
3. Exclude payment webhook from Clerk middleware protection

### Phase 6 — Payment Integration (Paystack)
**Estimated scope: Live payment processing**

1. Install `react-paystack` and set up Paystack account
2. Implement checkout flow for plan selection (redirect to Paystack)
3. Implement credit pack purchase flow (one-time charge)
4. Wire payment webhook to process `charge.success` and `charge.failed` events
5. Generate VAT-compliant invoices via `@react-pdf/renderer`
6. Add invoice download endpoint
7. Handle payment failures: grace period → dunning emails → cancellation

---

## 9. Downgrade Safety Rules

When an org downgrades, existing data is never destroyed:

| Scenario | Behaviour |
|----------|-----------|
| 50 users → Starter (5 max) | Existing users remain active. Cannot invite new users until under limit. |
| 7 active standards → Starter (2 max) | Existing standards remain active. Cannot activate new ones. |
| 600 documents → Starter (500 max) | Existing documents remain. Cannot upload new ones. |
| IMS used → Starter (no IMS) | IMS page shows upgrade prompt. Existing IMS data preserved. |

Plan selector UI will show warnings when downgrading would exceed new limits.

---

## 10. Verification Checklist

### Phase 1
- [ ] `npx prisma migrate dev` succeeds
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — succeeds

### Phase 3
- [ ] Classify route returns HTTP 402 when quota exhausted + no credits
- [ ] Classify route returns HTTP 200 and deducts 1 credit when quota exhausted + credits > 0
- [ ] Document creation returns error when at 500-doc limit on Starter
- [ ] Standard toggle blocked when at 2 active standards on Starter
- [ ] IMS page redirects to /billing for Starter orgs
- [ ] All hard gates return appropriate error messages

### Phase 4
- [ ] Trial banner shows correct days remaining
- [ ] Trial banner disappears when status becomes ACTIVE
- [ ] Usage bars show correct percentages
- [ ] Upgrade prompt appears at enforcement points

### Phase 5
- [ ] Cron expires trials correctly (set trialEndsAt to past, run cron)
- [ ] Cron creates new UsageRecord with zero counters at period end
- [ ] Cron sends trial-ending notifications 3 days before expiry

### Phase 6
- [ ] Paystack checkout completes and webhook fires
- [ ] Invoice PDF generates with correct VAT breakdown
- [ ] Failed payment sets PAST_DUE + 7-day grace period

---

## 11. Credit System Design

### How Credits Work
1. Each plan includes a **monthly AI classification quota** (50/200/500/unlimited)
2. Monthly quota resets to zero at the start of each billing period
3. **Purchased credit packs** are stored in a separate `CreditBalance`
4. Purchased credits **never expire** — they persist across billing periods
5. When a user triggers AI classification:
   - If `monthlyUsed < monthlyQuota` → use monthly quota (no credit consumed)
   - If `monthlyUsed >= monthlyQuota && creditBalance > 0` → consume 1 purchased credit
   - If `monthlyUsed >= monthlyQuota && creditBalance == 0` → blocked with 402

### Credit Packs
| Pack | Price | Per Credit |
|------|-------|------------|
| 100 credits | R15 | R0.15 |
| 500 credits | R65 | R0.13 |
| 1,000 credits | R120 | R0.12 |

### Onboarding Credits (FINALIZED 2026-03-03)
Every new organization receives **100 onboarding AI credits** on creation:
- Granted automatically when Clerk webhook fires `organization.created`
- Stored as a `CreditTransaction` with type `ADJUSTMENT` and description "Onboarding bonus"
- **Expire when trial ends** — any unused onboarding credits are zeroed via cron
- Separate from purchased credits (purchased credits never expire)
- Cost per trial account: ~R4.14 at internal rates — negligible vs R9,598 LTV
- Implementation: In Phase 2 (Subscription Provisioning), add to the Clerk webhook bootstrap

### Trial Invite Rules (FINALIZED 2026-03-03)
During the 14-day trial period, **user invite limits are not enforced**:
- TRIALING status → `checkUserLimit()` always returns `allowed: true`
- Once subscription transitions to ACTIVE (payment confirmed), user limits apply
- If trial org has more users than the chosen plan allows, existing users remain active but no new invites are permitted until under the limit
- This prevents friction during onboarding — teams should experience the full product before paying
- Implementation: In `src/lib/billing/limit-checks.ts`, add early return when `subscription.status === 'TRIALING'`

### Transaction Audit Trail
Every credit movement (purchase, usage, adjustment, refund) is logged in `CreditTransaction` with:
- Amount (+/-), balance after transaction
- Reference to document (for usage) or invoice (for purchase)
- Performed by user ID
- Timestamp

---

## 12. Key File Reference

### Billing Core (NEW)
```
src/lib/billing/
├── plans.ts              — Plan definitions, limits, credit packs
├── get-billing-context.ts — Cached context fetcher
├── limit-checks.ts       — Pure limit check functions
└── usage.ts              — Fire-and-forget usage recording
```

### Billing UI (NEW)
```
src/app/(dashboard)/billing/
├── page.tsx              — Server Component shell
├── actions.ts            — Server actions
├── current-plan-card.tsx
├── usage-card.tsx
├── credit-packs-card.tsx
├── plan-selector-card.tsx
└── invoice-history-card.tsx

src/components/billing/
├── upgrade-prompt.tsx    — Shown at limit enforcement points
├── trial-banner.tsx      — Top-of-layout during trial
└── usage-bar.tsx         — Reusable progress bar
```

### Critical Enforcement Points
```
src/app/api/documents/[id]/classify/route.ts    — AI quota (primary)
src/app/(dashboard)/documents/actions.ts         — Document count
src/app/(dashboard)/settings/actions.ts          — Standards count, user count
src/app/(dashboard)/ims/page.tsx                 — IMS feature gate
src/app/(dashboard)/settings/share-link-actions.ts — Portal gates
src/app/(dashboard)/checklists/actions.ts        — Recurring + custom forms
src/app/(dashboard)/audit-packs/actions.ts       — Audit pack gate
src/app/(dashboard)/settings/workflow-template-actions.ts — Approval gate
src/app/(dashboard)/documents/approval-actions.ts — Approval actions gate
src/app/api/reports/pdf/route.ts                 — Export gate
src/app/api/reports/csv/route.ts                 — Export gate
```

### Alternative Payment Methods (Added 13 March 2026)
```
src/app/(app)/(admin)/admin/invoices/
├── page.tsx              — Admin invoice management list
├── actions.ts            — Cross-org invoice queries, mark paid
└── invoice-actions.tsx   — Mark Paid dialog component

src/app/(app)/(dashboard)/billing/
├── eft-bank-details-card.tsx     — Bank details for EFT/Invoice customers
└── prepaid-balance-card.tsx      — Account balance + transaction history
```

**Admin workflow:** Set payment method per org → create invoices → mark paid
**Cron automation:** Auto-invoice (INVOICE method) + overdue handling + prepaid auto-deduct
**Full documentation:** See `DOCS/pricing-strategy/PRICING-STRATEGY-2026.md` Section 17

# ConformEdge — Final Polish Report

**Date:** 2026-03-03
**Author:** Nhlanhla Mnyandu / ISU Technologies
**Status:** Analysis Complete — Action Items Below

---

## 1. Competitive Intelligence Leak Audit

### Summary
The codebase has **3 CRITICAL, 6 HIGH, 7 MEDIUM, and 3 LOW** severity information leaks that could reveal our tech stack, AI provider, and internal architecture to competitors and attackers.

### CRITICAL — Fix Before Next Deploy

| # | File | What Leaks | Fix |
|---|------|-----------|-----|
| C1 | `next.config.ts` | `X-Powered-By: Next.js` header on every HTTP response | Add `poweredByHeader: false` to nextConfig |
| C2 | `public/vercel.svg`, `public/next.svg` | Confirms Next.js scaffold — publicly accessible files | Delete both files |
| C3 | `.env` | Live API keys (Clerk, Anthropic, Google, Resend, R2) in working directory | Verify never committed: `git log --all -- .env` |

### HIGH — Fix This Week

| # | File:Line | What Leaks | Fix |
|---|-----------|-----------|-----|
| H1 | `src/components/landing/data.ts:79` | **"Claude AI"** named on public landing page | → "AI instantly maps it to the correct ISO standard..." |
| H2 | `src/components/landing/data.ts:123` | **"Powered by Claude AI"** subtitle | → "Powered by ConformEdge AI" |
| H3 | `src/app/api/documents/[id]/classify/route.ts:223` | **"Anthropic API plan"** in live API error response | → "AI service temporarily unavailable. Contact support." |
| H4 | `src/lib/email.ts:8` | `onboarding@resend.dev` as sender on all customer emails | Configure custom domain: `noreply@conformedge.co.za` |
| H5 | `src/app/api/health/route.ts:7-12` | Unauthenticated endpoint exposes DB status + version | Strip to `{ status: "ok", timestamp }` only |
| H6 | `src/app/api/webhooks/clerk/route.ts:16` | "Webhook secret not configured" reveals Clerk usage | → "Internal server error" |

### MEDIUM — Fix This Sprint

| # | File | What Leaks | Fix |
|---|------|-----------|-----|
| M1 | `reports/csv/route.ts:126`, `reports/pdf/route.ts:62` | Raw `error.message` forwarded to API clients | Return generic error, send real error to Sentry only |
| M2 | `documents/actions.ts:424` | `console.error("R2 delete failed")` leaks storage provider in logs | Use `captureError()` instead |
| M3 | `extract-text.ts:13` | `"R2 fetch failed"` in thrown errors | → "Storage fetch failed" |
| M4 | `ocr-extract.ts:24` | `"OCR could not extract"` reveals Google Vision | → "Text extraction failed" |
| M5 | `feature-details.tsx:69` | `app.conformedge.co.za` domain in mock UI before live | → "app.example.com" placeholder |
| M6 | `ecosystem.config.cjs:4` | Comment mentions "ThriveSend, KopanoWorks" (other ISU products) | Remove the comment |
| M7 | `documents-help-panel.tsx:14` | "Claude analyses content" in authenticated help panel | → "Our AI analyses content..." |

### LOW — Housekeeping

| # | Item | Fix |
|---|------|-----|
| L1 | `public/uploads/test/quality-policy.pdf` committed | `git rm public/uploads/test/quality-policy.pdf` |
| L2 | Sentry DSN visible in client bundle (`NEXT_PUBLIC_SENTRY_DSN`) | Accepted pattern — optional tunnel proxy for full obscurity |
| L3 | `README.md` documents full tech stack | Ensure GitHub repo is **private** |

---

## 2. User Tier Gap Analysis (5 → 15 → 50 → Unlimited)

### Verdict: KEEP CURRENT LIMITS — Do Not Reduce

The 5/15/50/Unlimited progression was derived from competitor research and SA market analysis. Tightening makes every gap worse.

### Gap-by-Gap Assessment

| Transition | Gap | Assessment |
|-----------|-----|------------|
| 5 → 15 (3x) | +10 users, +186% price | The critical "penalty zone" is 6-14 user companies forced to Professional. But reducing Starter to 3 eliminates viable micro-contractor customers. |
| 15 → 50 (3.3x) | +35 users, +125% price | Widest gap. 16-30 user companies over-provisioned on Business. Monitor post-launch; if 20-35% of Business customers use <25 seats, consider a future "Growth" tier. |
| 50 → Unlimited | Infinite, Custom price | Standard enterprise gating. Requires strong outbound sales for 51-100 person firms. |

### What Reducing Would Do

| Proposed | Impact | Verdict |
|----------|--------|---------|
| Starter at 3 | Pushes 4-person firms to R1,999/mo — kills the deal | **Bad** |
| Professional at 10 | 11-14 person firms forced to Business at R4,499 | **Bad** |
| Business at 30 | 31-49 user firms pushed to Enterprise sales process | **Bad** |

### Recommendations for Tier Gaps

1. **Keep 5/15/50/Unlimited** — the numbers are market-aligned
2. **Allow unlimited invites during 14-day trial** — enforce limits only on conversion to paid
3. **Add 100 onboarding AI credits** to every new account (expires with trial) — prevents the 50/month wall from killing first-week activation. Cost: R4.14 per trial account
4. **Monitor the 15→50 gap** — if data shows over-provisioning after 6 months, consider a "Growth" tier at R2,999/mo with 30 users
5. **500 document limit on Starter is the strongest upsell trigger** — do not change it

### Other Resource Limits — All Well-Calibrated

| Resource | Starter | Pro | Business | Enterprise | Assessment |
|----------|---------|-----|----------|------------|------------|
| Users | 5 | 15 | 50 | Unlimited | Correct |
| Standards | 2 | 7 | Unlimited | Unlimited | Best-calibrated — matches ISO 9001+45001 starter pattern |
| Documents | 500 | Unlimited | Unlimited | Unlimited | Strong upsell trigger at 12-18 months |
| AI/month | 50 | 200 | 500 | Unlimited | Proportional to price. Onboarding credits recommended. |

---

## 3. Industry Expansion Feasibility

### Key Finding: ConformEdge is Already 80% Industry-Agnostic

The construction framing is **surface-level only** — confined to:
- 11 strings on the landing page
- The `SA_CONSTRUCTION_INDUSTRIES` constant name (the list already includes non-construction entries)
- The Subcontractor module's BEE/safety scoring algorithm
- 4 minor help panel references

Every core engine — AI classification, gap detection, IMS, CAPAs, checklists, audit packs, approval workflows, client portal — is **fully generic** and works for any ISO-regulated industry today.

### Effort to Open Up

| Effort Level | Changes | Time |
|-------------|---------|------|
| **ZERO** (works today) | Document mgmt, AI classification, gap analysis, IMS, CAPAs, checklists, custom forms, audit packs, approval workflows, client portal, calendar, recurring checklists, audit trail | 0 |
| **LOW** (< 1 day) | 11 landing page strings, rename `SA_CONSTRUCTION_INDUSTRIES` → `INDUSTRIES`, change `HardHat` icon, email hint text, 4 help panel phrases | 4-6 hours |
| **MEDIUM** (1-3 days) | New ISO standard seed data (3-4 hrs each), subcontractor help panel rewrite, configurable vendor label per org | 2-3 days |
| **HIGH** (1-2 weeks) | Subcontractor compliance scoring generalization (make weights configurable per org), industry-specific report sections, optional schema rename "Subcontractor" → "Vendor" | 5-10 days |

### Construction-Specific Code Inventory

| Component | Construction-Specific? | Details |
|-----------|----------------------|---------|
| Landing page copy | YES — 11 strings in 6 files | All text, no logic |
| `SA_CONSTRUCTION_INDUSTRIES` constant | YES — name only | List already includes Telecom, PM, Facilities |
| `HardHat` nav icon | YES | Cosmetic |
| Subcontractor BEE/safety scoring | YES — hardcoded weights | BEE 25%, Safety 35%, Certs 40% |
| Subcontractor help panel | YES — CIDB references | One file rewrite |
| AI classifier | NO — fully generic | Adapts to any seeded standard |
| Gap detection | NO — fully generic | Clause coverage driven |
| IMS engine | NO — fully generic | Union-Find on cross-references |
| All other features | NO — fully generic | Universal ISO compliance |

---

## 4. Small Business Fit (Plumbing, Electrical, etc.)

### How Each Segment Maps to Tiers

| Business Type | Typical Size | Best Tier | Fit Assessment |
|--------------|-------------|-----------|----------------|
| Solo plumber (CIDB 1-2) | 1-3 people | Starter (R699) | Good fit. Needs ISO 9001 only. 2-standard limit perfect. |
| Small electrical (CIDB 3-5) | 5-15 people | Starter → Professional | Starter works until team hits 6. Professional at R1,999 is the right next step. |
| Medium construction (CIDB 6-7) | 20-50 people | Business (R4,499) | Sweet spot. Needs subcontractor management, audit packs, multiple ISOs. |
| Large contractor (CIDB 8-9) | 50-200+ people | Enterprise | Full compliance department. Needs unlimited everything. |

### Why Small SA Companies Buy ISO Software

The primary driver is **NOT quality improvement** — it's:

1. **Tender requirements** — Government tenders (CIDB Grade 5+) increasingly expect ISO certification
2. **CIDB grade upgrades** — ISO strengthens grading applications to access larger projects
3. **B-BBEE scoring** — ISO certification improves B-BBEE ratings
4. **Supply chain pressure** — Main contractors require ISO from subcontractors
5. **Insurance** — ISO 45001 can reduce COIDA premiums

### The Affordability Advantage

Traditional ISO certification costs R100,000-R400,000+ in year one (audit fees + consultant fees). ConformEdge at R699-R4,499/month replaces the consultant cost while automating gap analysis and audit preparation. The ROI pitch: **"Win bigger tenders for less than 5% of what a compliance consultant charges."**

### UX Gap for Small Trades

The onboarding industry picker uses `SA_CONSTRUCTION_INDUSTRIES` — "Plumbing" is not listed. A plumber would select "Other" or "Mechanical Engineering". Adding trade-specific entries (Plumbing, Electrical, Painting, Roofing) is a LOW effort fix.

---

## 5. Cross-Industry Applicability

### Industry-ISO Standard Fit Matrix

ConformEdge supports 7 ISO standards. Here's how each industry maps:

| Industry | 9001 | 14001 | 45001 | 27001 | 22301 | 37001 | 39001 | Fit |
|----------|:----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:---:|
| Construction (current) | X | X | X | - | - | X | - | 4/7 |
| Electrical contractors | X | X | X | - | - | - | - | 3/7 |
| Plumbing / Mechanical | X | X | X | - | - | - | - | 3/7 |
| Facilities Management | X | X | X | - | - | - | - | 3/7 |
| Manufacturing | X | X | X | - | - | - | - | 3/7 |
| Mining | X | X | X | - | - | X | X | 5/7 |
| Engineering Consultancies | X | X | X | X | - | X | - | 5/7 |
| Logistics & Transport | X | X | X | - | X | - | X | 5/7 |
| Energy / Utilities | X | X | X | - | X | - | - | 4/7 |
| IT Services / Software | X | - | - | X | X | - | - | 3/7 |
| Healthcare | X | X | X | X | X | - | - | 5/7 |
| Food & Beverage | X | X | X | - | - | - | - | 3/7 |
| Financial Services | X | - | - | X | X | - | - | 3/7 |

### Expansion Tiers

**Tier 1 — Zero Changes (Can onboard today):**
- Electrical contractors, Plumbing/Mechanical, Facilities Management, Manufacturing, Engineering consultancies
- Same ISO profile as construction. Zero code changes needed.

**Tier 2 — Minor Positioning (Landing page + help text):**
- Mining (highest-value SA market — 5/7 standards match, R500B+ annual industry)
- Logistics & Transport (ISO 39001 already seeded — unique selling point)
- Energy / Utilities

**Tier 3 — Additional Seed Data Needed:**
- Healthcare → needs ISO 13485 seed data
- Food & Beverage → needs ISO 22000/FSSC 22000 seed data
- IT Services → needs POPIA/SOC 2 checklist templates

### Recommended Expansion Strategy

| Phase | Timeline | Target | Effort |
|-------|----------|--------|--------|
| **1. Adjacent trades** | Now | Electrical, Plumbing, Facilities, Manufacturing | Zero — marketing only |
| **2. Mining + Engineering** | 6-12 months | Mining contractors, engineering consultancies | Medium — seed data + DMRE templates |
| **3. Logistics + IT** | 12-18 months | Fleet operators, IT service companies | Medium-High — templates + POPIA |
| **4. Vertical deep-dives** | 18+ months | Healthcare, Food, Finance | High — evaluate build vs partner |

### Competitive Positioning

| Competitor | Strategy | SA Presence | ConformEdge Advantage |
|-----------|----------|-------------|----------------------|
| Mango (EcoOnline) | Horizontal QHSE | Yes — SA clients | AI classification + SA market specialization |
| isoTracker | Horizontal, modular | Limited | AI features they completely lack |
| Qualio | Life sciences only | No | Different market entirely |
| MasterControl | Enterprise regulated | No | Price + SA focus |
| Vanta/Drata | InfoSec only | No | Broader standard coverage |

**The winning pattern** (proven by Qualio, Vanta): Go vertical-first, own the niche deeply, then expand. ConformEdge should own "SA built environment compliance" before going horizontal.

---

## 6. SA Market Opportunity

### Market Size
- SA ISO certification market: **~USD 520M (2025)**, growing at **15.4% CAGR**
- SA testing/inspection/certification market: **USD 2.08B (2025)** → USD 2.62B by 2030
- CIDB has **200,000+ registered contractors** (Grades 5-9 are the ConformEdge sweet spot)

### CIDB Grade → ISO Mapping

| CIDB Grade | Project Limit | Typical Size | ISO Status | ConformEdge Tier |
|-----------|--------------|-------------|------------|-----------------|
| Grade 1-3 | Up to R2M | 1-10 people | No ISO needed | Not target market |
| Grade 4-5 | R2M-R6.5M | 5-20 people | ISO optional, competitive edge | Starter / Professional |
| Grade 6-7 | R6.5M-R40M | 15-50 people | ISO recommended by CIDB | Professional / Business |
| Grade 8-9 | R40M+ | 50-200+ | ISO essentially mandatory | Business / Enterprise |

### The Sales Message
> **"Win bigger tenders. Upgrade your CIDB grading. Manage ISO compliance for less than 5% of what a consultant charges."**

Small SA companies pursue ISO for **tender access and CIDB grading**, not quality improvement. All marketing should lead with this.

---

## 7. Action Items — Priority Order

### Immediate (Before Next Deploy)
- [ ] Add `poweredByHeader: false` to `next.config.ts`
- [ ] Replace "Claude AI" → "ConformEdge AI" on landing page (2 strings in `data.ts`)
- [ ] Replace "Anthropic API plan" error message in classify route
- [ ] Delete `public/vercel.svg` and `public/next.svg`
- [ ] Strip health endpoint to `{ status: "ok", timestamp }`

### This Week
- [ ] Replace "Webhook secret not configured" → "Internal server error"
- [ ] Replace raw error.message forwarding in CSV/PDF report routes
- [ ] Replace "R2 fetch failed" → "Storage fetch failed"
- [ ] Replace "OCR could not extract" → "Text extraction failed"
- [ ] Remove ThriveSend/KopanoWorks comment from ecosystem.config.cjs
- [ ] Delete test PDF: `git rm public/uploads/test/quality-policy.pdf`
- [ ] Replace "Claude analyses" → "Our AI analyses" in documents help panel

### This Sprint
- [ ] Configure custom Resend sender domain (noreply@conformedge.co.za)
- [ ] Verify `.env` never committed (`git log --all -- .env`)
- [ ] Verify GitHub repo is private
- [ ] Add trade-specific entries to industry list (Plumbing, Electrical, Painting)

### Before Billing Implementation
- [ ] Finalize decision: keep 5/15/50/Unlimited (recommended)
- [ ] Design onboarding AI credit allowance (100 credits during trial)
- [ ] Plan trial-period unlimited user invites (enforce on conversion only)

### Future Consideration
- [ ] Monitor 15→50 user gap post-launch for potential "Growth" tier
- [ ] Evaluate mining sector entry (highest-value adjacent market)
- [ ] Consider configurable vendor scoring weights per organization

---

*Report compiled from 4 parallel research agents analyzing codebase, pricing, market data, and competitive intelligence.*

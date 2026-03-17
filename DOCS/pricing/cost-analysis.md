# ConformEdge — Full Cost & Revenue Analysis

**Date:** 2 March 2026
**Exchange Rate:** 1 USD = R18.40 (budget rate with volatility buffer)
**Prepared by:** Nhlanhla Mnyandu / ISU Technologies

---

## Table of Contents

1. [Service & API Costs](#1-service--api-costs)
2. [Operational Costs](#2-operational-costs)
3. [Per-Customer Unit Economics](#3-per-customer-unit-economics)
4. [Revenue Projections by Tier](#4-revenue-projections-by-tier)
5. [Break-Even Analysis](#5-break-even-analysis)
6. [Growth Scenarios (12-Month)](#6-growth-scenarios-12-month)
7. [Risk Factors & Sensitivity](#7-risk-factors--sensitivity)
8. [Recommendations](#8-recommendations)

---

## 1. Service & API Costs

### 1.1 Infrastructure (Fixed Monthly)

| Service | Provider | Free Tier | Paid Cost | Current Usage | Monthly Cost |
|---|---|---|---|---|---|
| VPS Hosting | Hetzner CX23 | — | €3.49/mo | Production server | **R68** |
| Database | PostgreSQL (self-hosted) | — | R0 (on VPS) | Single instance | **R0** |
| File Storage | Cloudflare R2 | 10GB + 1M Class A ops | $0.015/GB | <10GB | **R0** |
| Email Delivery | Resend | 3,000 emails/mo | $20/mo (Pro) | <500 emails/mo | **R0** |
| Error Monitoring | Sentry | 5K errors/mo | $26/mo (Team) | <1K errors/mo | **R0** |
| Uptime Monitoring | UptimeRobot | 50 monitors | $7/mo (Pro) | 1 monitor | **R0** |
| Domain | .co.za | — | R120/year | 1 domain | **R10** |
| SSL | Cloudflare/Let's Encrypt | Free | R0 | Auto-renewal | **R0** |
| **TOTAL INFRASTRUCTURE** | | | | | **R78/mo** |

### 1.2 Authentication (Clerk) — Scales with Users

| Threshold | Cost | Trigger |
|---|---|---|
| 0–10,000 MAUs | **R0/mo** | Free tier |
| 10,001+ MAUs | R1,824/mo base + R0.37/MAU | Pro plan ($99 + $0.02/MAU) |
| 100,000+ MAUs | Custom pricing | Enterprise negotiation |

**When does Clerk cost kick in?**

| Total Customers | Avg Users/Customer | Total MAUs | Clerk Cost/mo |
|---|---|---|---|
| 50 | 10 | 500 | R0 |
| 200 | 10 | 2,000 | R0 |
| 500 | 10 | 5,000 | R0 |
| 700 | 15 | 10,500 | R2,009 |
| 1,000 | 15 | 15,000 | R3,674 |

### 1.3 AI Classification (Anthropic Claude Haiku 4.5)

**Per classification call:**
- Input: ~2,000 tokens × $1.00/1M = $0.002
- Output: ~500 tokens × $5.00/1M = $0.0025
- **Total: $0.0045/call = R0.083/call**

**With Batch API (50% discount, 24hr processing):**
- **Total: $0.00225/call = R0.041/call**

| Tier | Credits/mo | Standard Cost | Batch Cost | Per Customer/mo |
|---|---|---|---|---|
| Starter | 50 | $0.225 | $0.113 | **R4.14** (standard) / **R2.07** (batch) |
| Professional | 200 | $0.90 | $0.45 | **R16.56** / **R8.28** |
| Business | 500 | $2.25 | $1.125 | **R41.40** / **R20.70** |
| Enterprise | 2,000 | $9.00 | $4.50 | **R165.60** / **R82.80** |

### 1.4 OCR (Google Cloud Vision)

| Volume | Cost |
|---|---|
| 0–1,000 pages/mo (all customers pooled) | **R0** (free tier) |
| 1,001–5,000 pages/mo | $1.50/1,000 = **R27.60/1,000 pages** |
| 5,001+ pages/mo | $1.50/1,000 pages |

**Estimated per-customer OCR usage:** 5–20 pages/month (most docs are digital, not scanned)

### 1.5 Storage (Cloudflare R2) — Scales with Documents

| Customer Tier | Est. Docs | Est. Storage | Monthly Cost |
|---|---|---|---|
| Starter (500 docs) | 500 × 2MB avg | ~1GB | R0 (within free 10GB) |
| Professional (unlimited) | ~2,000 × 2MB | ~4GB | R0–R1 |
| Business (unlimited) | ~5,000 × 2MB | ~10GB | R0–R3 |
| Enterprise | ~20,000 × 2MB | ~40GB | R8 |

**Pool effect:** 10GB free is shared across ALL customers. First ~25 Starter customers fit within free tier entirely.

**Scaling costs (aggregate storage):**

| Total Customers | Total Storage | R2 Monthly Cost |
|---|---|---|
| 25 | ~25GB | R4.14 |
| 50 | ~75GB | R17.94 |
| 100 | ~200GB | R52.44 |
| 500 | ~1TB | R273.24 |

---

## 2. Operational Costs

### 2.1 Phase 1 — Bootstrapped Founder (0–50 Customers)

| Category | Monthly (ZAR) | Annual (ZAR) | Notes |
|---|---|---|---|
| **Founder salary (CTC)** | R60,000 | R720,000 | Market-rate opportunity cost |
| **Infrastructure** | R78 | R936 | See Section 1.1 |
| **Accounting/bookkeeping** | R2,500 | R30,000 | Basic monthly reconciliation |
| **Insurance** (PI + Cyber) | R1,200 | R14,400 | Professional indemnity + cyber cover |
| **Business bank** (FNB) | R60 | R720 | Monthly account fee |
| **Legal** (amortized) | R1,667 | R20,000 | POPIA + ToS + Privacy Policy |
| **CIPC annual return** | R38 | R450 | Company compliance |
| **Marketing** (minimal) | R10,000 | R120,000 | Google Ads + LinkedIn (bootstrap) |
| **Software tools** (free tiers) | R0 | R0 | GitHub, UptimeRobot, Crisp free |
| **TOTAL (excl. founder salary)** | **R15,543** | **R186,506** |
| **TOTAL (incl. founder salary)** | **R75,543** | **R906,506** |

### 2.2 Phase 2 — Small Team (50–200 Customers)

| Category | Monthly (ZAR) | Annual (ZAR) | Notes |
|---|---|---|---|
| **Founder (CEO/CTO)** | R65,000 | R780,000 | Includes employer contributions |
| **Mid-level developer** | R38,000 | R456,000 | 3-5 years exp, full-time remote |
| **Junior developer** | R22,000 | R264,000 | Full-time remote |
| **Customer support** | R14,000 | R168,000 | Full-time remote |
| **Part-time DevOps** | R18,000 | R216,000 | 2-3 days/week |
| **Infrastructure** | R500 | R6,000 | Upgraded VPS or managed DB |
| **Accounting** | R4,000 | R48,000 | Full compliance + tax filing |
| **Insurance** | R2,500 | R30,000 | Broader coverage |
| **Legal retainer** | R5,000 | R60,000 | Ongoing advice |
| **Marketing** | R35,000 | R420,000 | Google + LinkedIn + content |
| **Software tools** | R3,500 | R42,000 | Slack, Linear, Crisp, PostHog paid |
| **Office/co-working** | R3,000 | R36,000 | Optional hot desks |
| **Payment processing** | 3.5%+R2 | Variable | PayFast per transaction |
| **TOTAL** | **R210,500** | **R2,526,000** |

### 2.3 Phase 3 — Growth Team (200–500 Customers)

| Category | Monthly (ZAR) | Annual (ZAR) | Notes |
|---|---|---|---|
| **People (8 staff)** | R280,000 | R3,360,000 | +1 senior dev, +1 support, +1 sales |
| **Infrastructure** | R2,000 | R24,000 | Dedicated DB, CDN, backups |
| **Clerk Pro** | R2,500 | R30,000 | 3,000+ MAUs |
| **Operations** | R18,000 | R216,000 | Accounting, insurance, legal, bank |
| **Marketing** | R60,000 | R720,000 | Scaled campaigns + content team |
| **Software tools** | R8,000 | R96,000 | Full paid stacks |
| **Office** | R8,000 | R96,000 | Small office lease |
| **TOTAL** | **R378,500** | **R4,542,000** |

---

## 3. Per-Customer Unit Economics

### 3.1 Revenue Per Customer (After Payment Processing)

PayFast: 3.5% + R2.00 per transaction

| Tier | Gross Revenue | PayFast Fee | **Net Revenue** |
|---|---|---|---|
| Starter | R699 | R26.47 | **R672.53** |
| Professional | R1,999 | R71.97 | **R1,927.03** |
| Business | R5,499 | R159.47 | **R4,339.53** |
| Enterprise | R10,000 | R352.00 | **R9,648.00** |

### 3.2 Variable Cost Per Customer

| Cost Item | Starter | Professional | Business | Enterprise |
|---|---|---|---|---|
| AI classification | R4.14 | R16.56 | R41.40 | R165.60 |
| Storage (R2) | R0.50 | R1.50 | R3.00 | R8.00 |
| OCR | R0 | R2.00 | R5.00 | R28.00 |
| Email (Resend) | R0 | R0 | R0.50 | R2.00 |
| Auth (Clerk share) | R0 | R0 | R0 | R0 |
| **Total variable** | **R4.64** | **R20.06** | **R49.90** | **R203.60** |

### 3.3 Customer Support Cost Allocation

Industry benchmark: SaaS support costs R300–R800/ticket (SA)
Estimate: 2 tickets/user/month, 15 min each, at R75/hr

| Tier | Users | Tickets/mo | Hours | **Support Cost** |
|---|---|---|---|---|
| Starter (5) | 5 | 10 | 2.5 | **R188** |
| Professional (15) | 15 | 30 | 7.5 | **R563** |
| Business (50) | 50 | 100 | 25 | **R1,875** |
| Enterprise (unlimited) | 100+ | 200+ | 50+ | **R3,750+** |

### 3.4 True Customer Contribution Margin

| | Starter | Professional | Business | Enterprise |
|---|---|---|---|---|
| Net revenue (after PayFast) | R672.53 | R1,927.03 | R4,339.53 | R9,648.00 |
| Variable costs (APIs) | -R4.64 | -R20.06 | -R49.90 | -R203.60 |
| Support allocation | -R188 | -R563 | -R1,875 | -R3,750 |
| **Contribution margin** | **R479.89** | **R1,343.97** | **R2,414.63** | **R5,694.40** |
| **Margin %** | **68.7%** | **67.2%** | **53.7%** | **57.0%** |

### 3.5 Customer Lifetime Value (LTV)

Assuming average churn: 5% monthly (SaaS B2B average) → avg lifetime = 20 months

| Tier | Monthly Contribution | LTV (20 months) | Acquisition Budget (3:1 ratio) |
|---|---|---|---|
| Starter | R480 | **R9,598** | R3,199 |
| Professional | R1,344 | **R26,879** | R8,960 |
| Business | R2,415 | **R48,293** | R16,098 |
| Enterprise | R5,694 | **R113,888** | R37,963 |

---

## 4. Revenue Projections by Tier

### 4.1 Monthly Revenue at Different Customer Counts

**All Starter customers:**

| Customers | Gross Revenue | Net Revenue | Variable Cost | Contribution |
|---|---|---|---|---|
| 10 | R6,990 | R6,725 | R1,926 | R4,799 |
| 25 | R17,475 | R16,813 | R4,816 | R11,997 |
| 50 | R34,950 | R33,627 | R9,632 | R23,995 |
| 100 | R69,900 | R67,253 | R19,264 | R47,989 |

**All Professional customers:**

| Customers | Gross Revenue | Net Revenue | Variable Cost | Contribution |
|---|---|---|---|---|
| 10 | R19,990 | R19,270 | R5,831 | R13,440 |
| 25 | R49,975 | R48,176 | R14,577 | R33,599 |
| 50 | R99,950 | R96,352 | R29,153 | R67,199 |
| 100 | R199,900 | R192,703 | R58,306 | R134,397 |

**All Business customers:**

| Customers | Gross Revenue | Net Revenue | Variable Cost | Contribution |
|---|---|---|---|---|
| 10 | R44,990 | R43,395 | R19,249 | R24,146 |
| 25 | R112,475 | R108,488 | R48,123 | R60,366 |
| 50 | R224,950 | R216,977 | R96,245 | R120,732 |

### 4.2 Realistic Mixed Customer Scenarios

**Mix A — Early Stage (Month 6):**
15 Starter + 8 Professional + 2 Business

| Tier | Count | Revenue | Contribution |
|---|---|---|---|
| Starter | 15 | R10,485 | R7,198 |
| Professional | 8 | R15,992 | R10,752 |
| Business | 2 | R8,998 | R4,829 |
| **Total** | **25** | **R35,475** | **R22,779** |

**Mix B — Growth Stage (Month 12):**
30 Starter + 25 Professional + 10 Business + 2 Enterprise

| Tier | Count | Revenue | Contribution |
|---|---|---|---|
| Starter | 30 | R20,970 | R14,397 |
| Professional | 25 | R49,975 | R33,599 |
| Business | 10 | R44,990 | R24,146 |
| Enterprise | 2 | R20,000 | R11,389 |
| **Total** | **67** | **R135,935** | **R83,531** |

**Mix C — Scale Stage (Month 24):**
60 Starter + 80 Professional + 30 Business + 5 Enterprise

| Tier | Count | Revenue | Contribution |
|---|---|---|---|
| Starter | 60 | R41,940 | R28,793 |
| Professional | 80 | R159,920 | R107,518 |
| Business | 30 | R134,970 | R72,439 |
| Enterprise | 5 | R50,000 | R28,472 |
| **Total** | **175** | **R386,830** | **R237,222** |

---

## 5. Break-Even Analysis

### 5.1 Phase 1 — Bootstrapped (Excl. Founder Salary)

**Fixed costs: R15,543/mo**

| Scenario | Customers Needed | Monthly Revenue |
|---|---|---|
| All Starter (R480 contribution each) | **33 customers** | R23,067 |
| All Professional (R1,344 each) | **12 customers** | R23,988 |
| All Business (R2,415 each) | **7 customers** | R31,465 |
| Mix (40% S, 40% P, 20% B) | **17 customers** | R19,694 |

### 5.2 Phase 1 — Bootstrapped (Incl. Founder Salary R60K)

**Fixed costs: R75,543/mo**

| Scenario | Customers Needed | Monthly Revenue |
|---|---|---|
| All Starter | **158 customers** | R110,442 |
| All Professional | **57 customers** | R114,000 |
| All Business | **32 customers** | R143,968 |
| Mix (40% S, 40% P, 20% B) | **82 customers** | R94,826 |

### 5.3 Phase 2 — Small Team (5 People)

**Fixed costs: R210,500/mo**

| Scenario | Customers Needed | Monthly Revenue |
|---|---|---|
| All Starter | **439 customers** | R306,861 |
| All Professional | **157 customers** | R314,000 |
| All Business | **88 customers** | R395,912 |
| **Realistic mix:** | | |
| 40% Starter, 40% Pro, 20% Business | **228 customers** | R263,589 |

### 5.4 Phase 3 — Growth Team (8 People)

**Fixed costs: R378,500/mo**

| Scenario | Customers Needed | Monthly Revenue |
|---|---|---|
| All Professional | **282 customers** | R563,718 |
| Realistic mix (30/45/20/5%) | **345 customers** | R453,800 |

---

## 6. Growth Scenarios (12-Month Projections)

### 6.1 Conservative Growth — Bootstrapped Founder

New customers per month: 3 Starter, 2 Professional, 1 Business
Monthly churn: 5%

| Month | Starter | Pro | Business | Total | MRR | Fixed Costs | Net Profit |
|---|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 1 | 6 | R8,696 | R15,543 | **-R6,847** |
| 2 | 6 | 4 | 2 | 12 | R16,424 | R15,543 | **R881** |
| 3 | 9 | 5 | 3 | 17 | R23,237 | R15,543 | **R7,694** |
| 4 | 11 | 7 | 3 | 21 | R27,893 | R15,543 | **R12,350** |
| 5 | 13 | 9 | 4 | 26 | R34,448 | R15,543 | **R18,905** |
| 6 | 15 | 10 | 5 | 30 | R39,901 | R15,543 | **R24,358** |
| 7 | 17 | 12 | 5 | 34 | R43,736 | R15,543 | **R28,193** |
| 8 | 19 | 13 | 6 | 38 | R49,049 | R15,543 | **R33,506** |
| 9 | 21 | 14 | 6 | 41 | R52,548 | R15,543 | **R37,005** |
| 10 | 22 | 15 | 7 | 44 | R57,537 | R15,543 | **R41,994** |
| 11 | 24 | 17 | 7 | 48 | R61,051 | R15,543 | **R45,508** |
| 12 | 25 | 18 | 8 | 51 | R66,388 | R15,543 | **R50,845** |

**Year 1 totals (conservative, bootstrapped):**
- **Total revenue: ~R481,000**
- **Total fixed costs: R186,516**
- **Total profit: ~R294,484**
- **Break-even: Month 2**
- **ARR at Month 12: R796,656**

### 6.2 Moderate Growth — Hire at Month 6

New customers: 5 Starter, 3 Professional, 1 Business per month
Hire team of 5 starting Month 7 (R210,500/mo)
Monthly churn: 4%

| Month | Total Customers | MRR | Fixed Costs | Net Profit |
|---|---|---|---|---|
| 1 | 9 | R13,444 | R15,543 | **-R2,099** |
| 2 | 17 | R24,892 | R15,543 | **R9,349** |
| 3 | 25 | R35,407 | R15,543 | **R19,864** |
| 4 | 33 | R45,043 | R15,543 | **R29,500** |
| 5 | 40 | R53,854 | R15,543 | **R38,311** |
| 6 | 47 | R62,012 | R15,543 | **R46,469** |
| 7 (hire team) | 54 | R69,547 | R210,500 | **-R140,953** |
| 8 | 61 | R76,782 | R210,500 | **-R133,718** |
| 9 | 67 | R83,374 | R210,500 | **-R127,126** |
| 10 | 73 | R89,533 | R210,500 | **-R120,967** |
| 11 | 79 | R95,336 | R210,500 | **-R115,164** |
| 12 | 85 | R101,042 | R210,500 | **-R109,458** |

**Year 1 totals (moderate, hire at Month 6):**
- **Total revenue: ~R750,000**
- **Cash-positive months 2–6, then burn after hiring**
- **Monthly burn post-hire: ~R110K–R141K**
- **Break-even post-hire requires: ~228 customers (mix)**
- **Projected break-even post-hire: Month 18–20**

### 6.3 Aggressive Growth — Funded

New customers: 10 Starter, 8 Professional, 3 Business per month
Team of 8 from Day 1 (R378,500/mo)
Monthly churn: 3%

| Month | Total Customers | MRR | Fixed Costs | Net Profit | Cumulative P/L |
|---|---|---|---|---|---|
| 1 | 21 | R32,483 | R378,500 | -R346,017 | -R346,017 |
| 3 | 60 | R88,146 | R378,500 | -R290,354 | -R972,388 |
| 6 | 114 | R163,289 | R378,500 | -R215,211 | -R1,729,782 |
| 9 | 163 | R229,912 | R378,500 | -R148,588 | -R2,277,978 |
| 12 | 207 | R289,378 | R378,500 | -R89,122 | -R2,632,674 |
| 15 | 247 | R342,610 | R378,500 | -R35,890 | -R2,820,088 |
| **17** | **268** | **R371,156** | **R378,500** | **~Break-even** | **-R2,863,000** |
| 18 | 278 | R384,894 | R378,500 | +R6,394 | -R2,856,606 |
| 24 | 335 | R462,783 | R378,500 | +R84,283 | -R2,580,000 |

**Funding required: ~R2.9M to reach break-even at Month 17**

---

## 7. Risk Factors & Sensitivity

### 7.1 Churn Sensitivity

| Monthly Churn | Avg Customer Lifetime | LTV (Professional) | Impact |
|---|---|---|---|
| 3% | 33 months | R44,351 | Healthy — strong retention |
| 5% (baseline) | 20 months | R26,879 | Normal B2B SaaS |
| 8% | 12.5 months | R16,800 | Concerning — fix product |
| 10% | 10 months | R13,440 | Critical — unsustainable |

### 7.2 AI Cost Sensitivity

If Anthropic raises prices 2x:

| Tier | Current AI Cost | 2x Cost | Margin Impact |
|---|---|---|---|
| Starter | R4.14 | R8.28 | -0.6% margin (negligible) |
| Professional | R16.56 | R33.12 | -0.8% margin |
| Business | R41.40 | R82.80 | -0.9% margin |
| Enterprise | R165.60 | R331.20 | -1.7% margin |

**Verdict:** Even a 2x price increase in AI costs has minimal impact (<2%).

### 7.3 Exchange Rate Sensitivity

Most costs are USD-denominated. If ZAR weakens:

| Rate | Monthly Impact (50 customers) | Annual Impact |
|---|---|---|
| R16/USD (strong) | Base costs -13% | -R25,000 |
| R18.40/USD (current) | Baseline | Baseline |
| R22/USD (weak) | Base costs +20% | +R38,000 |
| R25/USD (crisis) | Base costs +36% | +R69,000 |

**Verdict:** ZAR weakness impacts costs but margins are wide enough to absorb even R25/USD.

### 7.4 Support Cost Sensitivity

Support is the largest per-customer cost. Self-service options reduce it dramatically:

| Strategy | Support Cost Reduction | Impact on Contribution |
|---|---|---|
| In-app help panels (already built) | -20% | +R38–R375/customer |
| Knowledge base / FAQ | -30% | +R56–R563/customer |
| AI chatbot (Claude-powered) | -50% | +R94–R938/customer |
| Community forum | -15% | +R28–R281/customer |

### 7.5 Pricing Sensitivity — What if We Price Lower?

| Tier | Current Price | -20% Price | Contribution at -20% | Still Profitable? |
|---|---|---|---|---|
| Starter | R699 | R559 | R339 | Yes (margin 60.7%) |
| Professional | R1,999 | R1,599 | R958 | Yes (margin 59.9%) |
| Business | R5,499 | R3,599 | R1,614 | Yes (margin 44.8%) |

**Verdict:** Even 20% lower pricing maintains 45-61% margins. Room to offer early-adopter discounts.

---

## 8. Recommendations

### 8.1 Pricing Structure — Confirmed

The 4-tier structure is financially sound:

| Tier | Price | Contribution | Margin | Verdict |
|---|---|---|---|---|
| Starter R699 | R699/mo | R480 | 68.7% | **Go** — accessible entry point |
| Professional R1,999 | R1,999/mo | R1,344 | 67.2% | **Go** — best margin/volume balance |
| Business R5,499 | R5,499/mo | R2,415 | 53.7% | **Go** — support cost is manageable |
| Enterprise Custom | R10K+ | R5,694+ | 57%+ | **Go** — high-touch, high-value |

### 8.2 Revenue Milestones

| Milestone | Customers | MRR | ARR | What It Enables |
|---|---|---|---|---|
| **Ramen profitable** | 33 (mix) | R38K | R456K | Founder salary + all costs covered |
| **First hire** | 50 (mix) | R62K | R744K | Junior dev or support agent |
| **Small team (5)** | 120 (mix) | R156K | R1.87M | Full dev team + support |
| **Growth team (8)** | 230 (mix) | R310K | R3.72M | Sales + marketing + expanded team |
| **Series A ready** | 500+ | R700K+ | R8.4M+ | Proven unit economics at scale |

### 8.3 Key Decisions

1. **Annual billing discount:** Offer 2 months free (17% discount) for annual payment — improves cash flow and reduces churn
2. **Early-access pricing:** 30% discount for first 50 customers (R489/R1,399/R3,149) — still profitable at all tiers
3. **AI credits as upsell:** Allow purchasing additional AI credits at R0.15/classification (3.6x markup over cost)
4. **Batch processing:** Use Batch API for non-urgent classifications to halve AI costs
5. **Self-service support investment:** Every R1 spent on knowledge base/AI chatbot saves R3–R5 in support costs

### 8.4 Critical Metrics to Track

| Metric | Target | Action if Below |
|---|---|---|
| Monthly churn | <5% | Improve onboarding, add stickiness features |
| CAC (customer acquisition cost) | <3 months revenue | Reduce marketing spend, focus on organic |
| LTV:CAC ratio | >3:1 | Adjust pricing or acquisition channels |
| Net Revenue Retention | >100% | Upsell Professional → Business tier |
| Support tickets/user | <2/mo | Invest in self-service |
| AI credits utilization | >30% | Customers finding value in AI features |

---

## Appendix: Source Data

### API Pricing Sources (March 2026)
- Anthropic Claude API: $1/1M input, $5/1M output (Haiku 4.5)
- Cloudflare R2: $0.015/GB, zero egress
- Resend: Free 3K/mo, Pro $20/mo for 50K
- Google Cloud Vision: $1.50/1,000 pages
- Clerk: Free 10K MAUs, Pro $99 + $0.02/MAU
- Sentry: Free 5K errors/mo
- Hetzner CX23: €3.49/mo

### SA Business Cost Sources
- Developer salaries: OfferZen, Glassdoor SA, PayScale
- Accounting: Evergreen Accounting, BAN
- Insurance: Bi-me, Santam
- PayFast: 3.5% + R2 per transaction
- CIPC: R450/year annual return

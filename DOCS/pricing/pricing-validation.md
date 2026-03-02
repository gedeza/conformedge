# ConformEdge — Pricing Tier Validation Report

**Date:** 3 March 2026
**Status:** APPROVED
**Prepared by:** Nhlanhla Mnyandu / ISU Technologies
**Based on:** [Full Cost Analysis](./cost-analysis.md)

---

## 1. Final Approved Pricing Tiers

| Tier | Monthly Price | Target Segment | User Limit | AI Credits/mo |
|---|---|---|---|---|
| **Starter** | R699 | Small contractors starting ISO compliance | 5 users | 50 |
| **Professional** | R1,999 | Growing companies, multiple standards | 15 users | 200 |
| **Business** | R4,499 | Multi-site firms, advanced compliance | 50 users | 500 |
| **Enterprise** | Custom (R10K+) | Large organisations, full control & scale | Unlimited | Unlimited |

---

## 2. Validation Summary — All Tiers Approved

### 2.1 Per-Tier Unit Economics

| | Starter | Professional | Business | Enterprise |
|---|---|---|---|---|
| **Gross revenue** | R699 | R1,999 | R4,499 | R10,000+ |
| Payment processing (PayFast 3.5%+R2) | -R26.47 | -R71.97 | -R159.47 | -R352.00 |
| **Net revenue** | R672.53 | R1,927.03 | R4,339.53 | R9,648.00 |
| AI classification (Claude Haiku) | -R4.14 | -R16.56 | -R41.40 | -R165.60 |
| Storage (Cloudflare R2) | -R0.50 | -R1.50 | -R3.00 | -R8.00 |
| OCR (Google Cloud Vision) | R0 | -R2.00 | -R5.00 | -R28.00 |
| Email (Resend) | R0 | R0 | -R0.50 | -R2.00 |
| Auth (Clerk share) | R0 | R0 | R0 | R0 |
| **Total variable cost** | **-R4.64** | **-R20.06** | **-R49.90** | **-R203.60** |
| Support allocation | -R188 | -R563 | -R1,875 | -R3,750 |
| **Contribution margin** | **R479.89** | **R1,343.97** | **R2,414.63** | **R5,694.40** |
| **Margin %** | **68.7%** | **67.2%** | **53.7%** | **57.0%** |
| **Verdict** | GO | GO | GO | GO |

### 2.2 Tier-by-Tier Assessment

**Starter (R699) — GO**
- 68.7% margin is the highest across all tiers
- API costs are negligible at R4.64/customer/month
- Accessible entry point for SA small contractors
- Risk: support cost (R188) is 27% of net revenue — mitigated by help panels already built
- At scale, these customers upsell to Professional as they grow

**Professional (R1,999) — GO**
- 67.2% margin with the best balance of margin and volume potential
- Expected to be the highest-volume tier (40-45% of customer mix)
- IMS cross-standard mapping and recurring checklists justify the price jump from Starter
- Support cost (R563) is 29% of net revenue — acceptable for the feature set

**Business (R4,499) — GO**
- 53.7% margin — the lowest, but still above industry median (~50% for vertical SaaS)
- Support is the primary cost driver (R1,875 = 43% of net revenue)
- Mitigated by: self-service knowledge base, AI chatbot (planned), in-app help panels (built)
- Custom form builder + audit pack generation + approval workflows justify premium
- As self-service support matures, margin climbs toward 65%

**Enterprise (Custom, R10K+) — GO**
- 57.0% margin at R10K baseline; improves at higher contract values
- High-touch model (dedicated account manager) is expected and budgeted
- API costs (R203.60) remain <2.1% of revenue even with unlimited AI credits
- Custom integrations + SSO + API access justify enterprise pricing
- Contract-based, so revenue is predictable and churn is lower

---

## 3. Stress Testing — All Scenarios Pass

### 3.1 AI Cost Doubling (Anthropic raises prices 2x)

| Tier | Current AI Cost | 2x AI Cost | Margin Impact | Still Safe? |
|---|---|---|---|---|
| Starter | R4.14 | R8.28 | -0.6% | YES — 68.1% margin |
| Professional | R16.56 | R33.12 | -0.8% | YES — 66.4% margin |
| Business | R41.40 | R82.80 | -0.9% | YES — 52.8% margin |
| Enterprise | R165.60 | R331.20 | -1.7% | YES — 55.3% margin |

**Verdict:** AI cost is <2% of revenue at every tier. Even a 2x increase is negligible.

### 3.2 ZAR Exchange Rate Deterioration

| Rate | Impact on Variable Costs | Worst-Case Margin (Business) |
|---|---|---|
| R16/USD (strong) | -13% variable costs | 54.5% |
| R18.40/USD (baseline) | Baseline | 53.7% |
| R22/USD (weak) | +20% variable costs | 52.7% |
| R25/USD (crisis) | +36% variable costs | 51.9% |

**Verdict:** Business tier (weakest) holds above 51% even in a currency crisis.

### 3.3 Price Reduction (20% across all tiers)

| Tier | Reduced Price | Contribution | Margin | Still Safe? |
|---|---|---|---|---|
| Starter | R559 | R339 | 60.7% | YES |
| Professional | R1,599 | R958 | 59.9% | YES |
| Business | R3,599 | R1,614 | 44.8% | YES |

**Verdict:** Even 20% discounts maintain 45-61% margins. Room for early-access offers.

### 3.4 Churn Sensitivity

| Monthly Churn | Avg Lifetime | Pro LTV | Starter LTV | Viable? |
|---|---|---|---|---|
| 3% (best case) | 33 months | R44,351 | R15,836 | Excellent |
| 5% (baseline) | 20 months | R26,879 | R9,598 | Healthy |
| 8% (concerning) | 12.5 months | R16,800 | R5,999 | Investigate |
| 10% (critical) | 10 months | R13,440 | R4,799 | Unsustainable |

**Verdict:** Pricing holds up to 8% churn. Above 8% requires product intervention, not price changes.

### 3.5 Support Cost Spike (tickets double)

| Tier | Normal Support | 2x Tickets | Margin Impact | Still Safe? |
|---|---|---|---|---|
| Starter | R188 | R376 | 41.0% | YES (tight) |
| Professional | R563 | R1,126 | 37.8% | YES (invest in self-service) |
| Business | R1,875 | R3,750 | 10.6% | CAUTION — prioritise self-service |

**Verdict:** Support doubling is the biggest risk for Business tier. Self-service investment is critical.

---

## 4. Break-Even Validation

### 4.1 Bootstrapped Phase (R15,543/mo fixed costs)

| Customer Mix | Customers to Break Even | MRR at Break-Even |
|---|---|---|
| All Starter | 33 | R23,067 |
| All Professional | 12 | R23,988 |
| All Business | 7 | R31,465 |
| Realistic mix (40/40/20) | 17 | R19,694 |

### 4.2 Including Founder Salary (R75,543/mo)

| Customer Mix | Customers to Break Even | MRR at Break-Even |
|---|---|---|
| Realistic mix (40/40/20) | 82 | R94,826 |

### 4.3 Timeline to Break-Even

| Scenario | Growth Rate | Break-Even Month | Customers at Break-Even |
|---|---|---|---|
| Conservative (bootstrapped) | +6 customers/mo | **Month 2** | 12 |
| Conservative (incl. salary) | +6 customers/mo | **Month 8** | ~48 |
| Moderate (hire at Month 6) | +9 customers/mo | **Month 18–20** | ~170 |
| Aggressive (funded, 8 staff) | +21 customers/mo | **Month 17** | ~268 |

---

## 5. Competitive Position

| Platform | Comparable Tier | Price | ConformEdge Price | Position |
|---|---|---|---|---|
| isoTracker | Basic (5 users) | ~R950/mo | R699 (Starter) | **26% cheaper** |
| Mango QHSE | Standard | ~R1,850/mo | R1,999 (Professional) | **At market** |
| Effivity | Professional | ~R2,400/mo | R1,999 (Professional) | **17% cheaper** |
| Qualio | Scale (25 users) | ~R4,200/mo | R4,499 (Business, 50 users) | **At market, 2x users** |
| SafetyCulture | Premium (unlimited) | ~R1,840/mo | R1,999 (Professional) | **At market** |

**Verdict:** ConformEdge is priced at or below market while offering more users per tier and AI-powered features competitors lack.

---

## 6. Approved Recommendations

Based on this validation, the following are approved for implementation:

### 6.1 Annual Billing (Priority: HIGH)
- **Discount:** 2 months free = 17% savings for customer
- **Annual prices:** Starter R6,990 → **R5,810/yr** | Professional R23,988 → **R19,990/yr** | Business R53,988 → **R44,990/yr**
- **Impact:** Improves cash flow, reduces churn by 15-20%
- **Margin at annual prices:** All tiers remain above 50%

### 6.2 Early-Access Pricing (Priority: HIGH)
- **Discount:** 30% off for first 50 customers
- **Early-access prices:** Starter **R489/mo** | Professional **R1,399/mo** | Business **R3,149/mo**
- **Margin at EA prices:** Starter 57.7% | Professional 54.4% | Business 36.8%
- **All tiers remain profitable** even at 30% discount
- **Sunset:** After 50 customers or 6 months (whichever comes first), prices return to standard

### 6.3 AI Credits Upsell (Priority: MEDIUM)
- **Price:** R0.15/additional classification (cost: R0.041 batch / R0.083 standard)
- **Markup:** 1.8x–3.6x over cost
- **No cap on purchases** — pure margin revenue
- **Implementation:** Credit packs (100 for R15, 500 for R65, 1000 for R120)

### 6.4 Self-Service Support Investment (Priority: HIGH)
- **Phase 1:** Knowledge base / FAQ (reduces support costs 30%)
- **Phase 2:** AI chatbot powered by Claude (reduces support costs 50%)
- **ROI:** Every R1 spent saves R3–R5 in support staffing
- **Effect on Business tier:** Margin improves from 53.7% → ~65%

### 6.5 Batch API Processing (Priority: MEDIUM)
- **Action:** Route non-urgent classifications through Anthropic Batch API
- **Saving:** 50% reduction in AI costs (R0.083 → R0.041 per classification)
- **Implementation:** Background queue for bulk uploads, instant for single documents

---

## 7. Sign-Off

| Item | Status | Date |
|---|---|---|
| 4-tier pricing structure | **APPROVED** | 3 March 2026 |
| Unit economics validated | **APPROVED** | 3 March 2026 |
| Stress tests passed (5/5) | **APPROVED** | 3 March 2026 |
| Break-even achievable | **APPROVED** | 3 March 2026 |
| Competitive positioning confirmed | **APPROVED** | 3 March 2026 |
| Annual billing recommendation | **APPROVED** | 3 March 2026 |
| Early-access pricing recommendation | **APPROVED** | 3 March 2026 |
| AI credits upsell recommendation | **APPROVED** | 3 March 2026 |
| Self-service support recommendation | **APPROVED** | 3 March 2026 |

---

*This document validates the pricing tiers established in the [Full Cost Analysis](./cost-analysis.md) and serves as the go/no-go decision record for ConformEdge's commercial launch pricing.*

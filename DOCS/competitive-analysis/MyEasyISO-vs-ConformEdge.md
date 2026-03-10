# Competitive Analysis: MyEasyISO QHSE vs ConformEdge

**Date:** 2026-03-09
**Analyst:** ISU Technologies Product Team (AI-assisted multi-agent review)
**Source:** MyEasyISO_QHSE_Features_Presentation.pdf (47 pages)
**Competitor:** Effivity Technologies LLC — MyEasyISO QHSE platform

---

## 1. Executive Summary

MyEasyISO (by Effivity Technologies, 20+ years, 7,500 customers globally) offers 30+ modules covering every conceivable QHSE function. ConformEdge now offers **31 modules** with AI-powered intelligence, SA-specific regulatory automation, and 9 compliance frameworks that MyEasyISO cannot replicate without a full rebuild. **Update (2026-03-10):** All 5 recommended features have been built (Incidents, Objectives, Management Reviews, Work Permits, PWA). Module count has grown from 14 to 31. Pricing revised upward — see `DOCS/pricing-strategy/PRICING-STRATEGY-2026.md`.

**Key finding:** MyEasyISO is broad but outdated. ConformEdge is focused but intelligent. Neither is a direct threat to the other — they serve different paradigms. The strategic question is not "should we worry?" but rather "what should we selectively add to close deal-breaking gaps?"

**Verdict:** Do NOT build a new application. Do NOT broaden scope beyond construction. Cherry-pick 5 high-value features. Sharpen the supply chain compliance network angle.

---

## 2. Competitor Profile: MyEasyISO

| Attribute | Detail |
|---|---|
| **Company** | Effivity Technologies LLC |
| **Age** | 20+ years |
| **Customers** | 7,500+ globally |
| **Offices** | USA, Africa, Mexico, Singapore, India, Europe, UAE, Middle East, Russia, Latin America, Australia |
| **Standards** | ISO 9001, 14001, OHSAS 18001/45001, 50001, 22000, HACCP, 13485, 17025 |
| **Modules** | 30+ QHSE modules |
| **Pricing** | $24–$259/month USD (6 tiers, bi-annual subscription) |
| **Deployment** | SaaS (Azure) + on-premise option |
| **Tech** | Legacy web application (estimated 15+ year architecture) |
| **USP Claim** | "World's only 100% complete and comprehensive QHSE software" |

### MyEasyISO Complete Module List

1. Context of the Organization (SWOT, PESTEL, interested parties)
2. Risk & Opportunity Management (risk register, categorization, graphical matrix)
3. QHSE Policy & Objective Management
4. HR — Roles, Responsibility & Authority
5. HR — Competence & Training Management
6. Sales — Enquiry/Lead Management
7. Sales — Customer Complaint Management
8. Sales — Customer Feedback/Satisfaction
9. Purchase/Supplier Management (POs, supplier eval)
10. Design & Development (D&D stages)
11. Operations Planning
12. Operations Process Management (SOPs)
13. Operations Asset Management (maintenance, calibration)
14. Quality Assurance (inspection plans/checklists)
15. Document Management (upload, on-screen editor, version control)
16. Policies & Procedures (SOP library)
17. QHSE Performance & KPI Management
18. Internal Audit & Assessment
19. Non-Conformance Management
20. Management Review
21. Hazard-Risk & Aspect-Impact (HIRA)
22. HSE Operational Control
23. Incident/Accident Management
24. Inspection Management
25. Waste Management
26. Safety Data Sheets (SDS)
27. PPE Management
28. Compliance Management (legal/regulatory register)
29. Work Permits & Approvals
30. Emergency Preparedness

---

## 3. Feature Comparison Matrix

### 3.1 Features BOTH Platforms Have (12 shared areas)

| Feature Area | ConformEdge | MyEasyISO | Parity Assessment |
|---|---|---|---|
| Document Management | Upload, version control (parentDocumentId chain), 5-status lifecycle, R2 cloud storage | Central repository, on-screen editor, version control | CE: full lifecycle + cloud. MyISO: adds in-browser editor |
| CAPA/Non-Conformance | 5-status workflow, priority levels, action sub-items, 5-Whys RCA with Ishikawa categories, cross-standard clause linking | Assign, RCA, corrective actions, effectiveness evaluation | CE: more structured RCA. MyISO: adds effectiveness eval step |
| Internal Audit | Schedule, conduct (question-by-question), scoring, AI question generation, status derivation | Planning, scheduling, execution, reporting, built-in checklists | Near-parity. CE: AI generation. MyISO: dedicated reporting |
| Checklists | 5 field types, templates, recurring schedules, per-item evidence + CAPA raise | Quality assurance, inspection checklists | CE: richer field types + auto-recurrence |
| Risk Management | RiskLevel enum on assessments/CAPAs | Standalone risk register, graphical matrix | MyISO: dedicated module. CE: embedded in entities |
| Reporting/KPIs | 9 chart types, date-range filter, CSV/PDF export | Department/process KPIs, graphical | CE: compliance-centric. MyISO: broader KPI definition |
| Approval Workflows | Configurable multi-step sequential chains | Version control, role-based access | CE: more sophisticated (configurable chains) |
| Audit Trail | Every mutation logged, queryable, filterable | Implied across modules | CE: explicit, queryable — clear advantage |
| Team/RBAC | 5 roles (OWNER/ADMIN/MANAGER/AUDITOR/VIEWER) | Departments, designations, employee master | MyISO: richer HR. CE: compliance-focused RBAC |
| Notifications | 14 types, dual channel, user preferences, cron triggers | Auto-notifications for KPI alerts | CE: more types and user control |
| Multi-standard Support | 7 ISO standards (49 clauses + 187 sub-clauses seeded) | 8 standards (adds HACCP explicitly) | Largely equivalent |
| Subcontractor/Supplier | Tiered rating, BEE level, safety rating, cert tracking, self-service portal | Supplier eval, POs, re-evaluation | CE: self-service portal. MyISO: purchase order integration |

### 3.2 ConformEdge Unique Differentiators (MyEasyISO DOESN'T have)

| Feature | Description | Strategic Value |
|---|---|---|
| **AI Document Classification** | Claude Haiku auto-classifies to ISO clause level with confidence scores. Bulk classify (3 concurrent). Low-coverage alerts (<25%) | Eliminates manual tagging — #1 time cost in compliance |
| **AI Gap Analysis Engine** | Clause-level COVERED/PARTIAL/GAP across all standards and projects. Weighted coverage (100% covered, 50% partial) | Instant audit readiness — no manual gap spreadsheets |
| **IMS Engine (Union-Find)** | Cross-standard equivalence grouping, integration score, consolidated readiness, gap cascade analysis, shared requirements matrix | Do work once, satisfy multiple standards. Unique in market |
| **Cross-Standard Gap Cascades** | Shows how one gap affects multiple standards simultaneously | Prevents compliance silos |
| **Client Portal** | Token-based sharing (SHA-256 hashed), view limits, expiry, access log | Share with auditors/clients — no license cost |
| **Subcontractor Self-Service Portal** | Subs upload own certs via token link, admin review/approve | Supply chain compliance without platform accounts |
| **AI Question Generation** | Claude generates assessment questions per ISO clause | Non-experts can conduct structured audits |
| **AI Checklist Generation** | Claude generates checklist items from clause context | Accelerates checklist creation |
| **Audit Pack PDF Generation** | Compile documents + assessments into certification evidence pack | One-click audit submission |
| **Custom Form Builder** | 5 field types (Compliance, Boolean, Number, Rating, Select) | Adapts checklists to any inspection need |
| **5-Whys RCA with Ishikawa** | Structured root cause chain with category tagging | More rigorous than text field |
| **SA Market Localization** | BEE tracking, ZAR pricing, Paystack, construction industry focus | Defensible niche MyEasyISO can't match |
| **Per-Document Gap Insights** | After AI classification, shows clause coverage and cross-standard implications | Immediate feedback loop |
| **Subcontractor Compliance Scorecard** | Calculated score, tier classification (PLATINUM to UNRATED) | Quantifies supply chain risk |
| **Modern Tech Stack** | Next.js 15, TypeScript, Prisma 7, Server Components, CI/CD | Performance + developer velocity advantage |

### 3.3 Features MyEasyISO Has That ConformEdge LACKS

| Module | Priority | ISO Clause | Rationale |
|---|---|---|---|
| **Incident/Accident Management** | CRITICAL | ISO 45001 §9.1 | SA Construction Regulations 2014 + OHS Act mandate formal incident reporting. Legal requirement. |
| **HIRA Register** (Hazard-Risk & Aspect-Impact) | CRITICAL | ISO 45001 §6.1, ISO 14001 §6.1 | Core requirement for both environmental and safety standards |
| **Management Review** | HIGH | ALL standards §9.3 | Required by every ISO standard. High auditor visibility |
| **Legal/Regulatory Compliance Register** | HIGH | ISO 14001 §6.1.3, ISO 45001 §6.1.3 | Mandatory for environmental and safety certification |
| **Objectives & KPI Tracking** | HIGH | ISO 9001 §6.2, ISO 45001 §6.2 | Every auditor asks for measurable objectives with targets |
| **Competence & Training Management** | HIGH | ISO 9001 §7.2, ISO 45001 §7.2 | Competence mapping, training calendar, effectiveness eval |
| **Emergency Preparedness** | HIGH | ISO 14001 §8.2, ISO 45001 §8.2 | Emergency scenario register, plans, drill records |
| **Context of Organization** (SWOT/PESTEL) | HIGH | ISO 9001 §4.1-4.2 | Formal clause 4 tooling |
| **Work Permit Management** | MEDIUM-HIGH | ISO 45001 §8.1 | Mandatory for high-risk construction work in SA |
| **PPE Management** | MEDIUM | ISO 45001 §8.1 | Requirements register, inspection records, PPE matrix |
| **Asset/Equipment Management** | MEDIUM | ISO 9001 §7.1.5 | Equipment register, maintenance, calibration |
| **Customer Complaint Management** | MEDIUM | ISO 9001 §8.2.1 | Distinct from CAPAs — complaint-specific intake |
| **Customer Feedback/Satisfaction** | MEDIUM | ISO 9001 §9.1.2 | Survey creation, satisfaction index |
| **Design & Development** | MEDIUM | ISO 9001 §8.3 | D&D stages with review/verification/validation |
| **Operations Process Management** | MEDIUM | ISO 9001 §8.1 | SOP builder with process validation workflow |
| **Waste Management** | LOW-MEDIUM | ISO 14001 §8.1 | Environmental specialist territory |
| **Safety Data Sheets** | LOW-MEDIUM | ISO 45001 | Structured SDS fields |
| **Sales/CRM** | LOW | N/A | Different product category entirely |
| **Purchase Order Management** | LOW | N/A | Procurement, not compliance |
| **On-Premise Deployment** | LOW | N/A | Strategic choice — cloud-only is correct for our market |

---

## 4. Scope Assessment: Has MyEasyISO Over-Built?

**Yes, significantly.** This is the classic enterprise software mistake of conflating comprehensiveness with value.

### Risks of their "everything" approach:
- **Complexity creep:** 30+ modules = massive onboarding friction. Compliance managers in construction want to get their audit sorted, not navigate an HR/CRM/EHS hybrid
- **Tech debt:** 20+ years on ageing infrastructure = incoherent UX patchwork across modules
- **Market diffusion:** "Everything to everyone" = first choice for no one
- **No AI capability:** Manual clause mapping architecture cannot absorb LLM-based intelligence without complete redesign
- **Pricing pressure:** $24–$259 range suggests competing on price, not value

### Their actual moat:
Brand recognition and procurement inertia (7,500 customers already on it). Technical moat is near-zero against a modern competitor with AI capabilities.

---

## 5. ConformEdge Technical Moats (Code-Verified)

### Moat 1 — AI Document Intelligence
- Calibrated confidence model (0.9+ = direct, 0.5-0.69 = partial)
- Multi-layer extraction: PDF → Word → OCR fallback (Google Cloud Vision if <50 chars from pdf-parse)
- `DocumentClassification` table purpose-built for AI data with human override (`isVerified` flag)
- Cross-standard classification with 90% confidence decay (capped at 0.85)

### Moat 2 — Graph-Based IMS Engine
- Union-Find with path compression and union-by-rank
- Computes actual mathematical equivalence, not just "multiple standard names on a dashboard"
- Gap cascades, integration scoring, shared requirements matrix
- Architecturally isolated in `src/lib/ims/` — extensible without touching other modules

### Moat 3 — Iteration Velocity
- Next.js 15 App Router, TypeScript end-to-end, Prisma schema-as-truth
- `getAuthContext()` wrapped in React `cache()` for per-request deduplication
- Zod validation at every server action boundary
- CI/CD deploys on push to main
- Clear, repeatable patterns across all 14 dashboard pages

---

## 6. Strategic Recommendations

### Evaluated Options

| Strategy | Verdict | Rationale |
|---|---|---|
| **A. Stay the course** (SA construction focus) | CORRECT for 12-18 months | Own the niche before expanding. Clear ICP, shorter sales cycle, word-of-mouth in relationship-driven industry |
| **B. Cherry-pick 5 features** | DO THIS NOW | Closes deal-breaking gaps. Moves from "interesting tool" to "operational system of record" |
| **C. Build a totally new application** | DO NOT DO THIS | Would discard AI moat, IMS engine, subcontractor portal. Enter crowded mid-market with no differentiation. Worst strategic option. |
| **D. Pivot — supply chain compliance network** | SHARPEN within current strategy | Subcontractor portal → supply chain compliance network. B2B2B play with network effects. Long-term story no competitor is telling |

### Recommended Feature Additions (Priority Order)

| # | Feature | Effort | Timeline | Rationale |
|---|---|---|---|---|
| **1** | Incident & Near-Miss Management | Medium | Build now | Legal requirement (Construction Regulations 2014, OHS Act). SA-specific statutory form output (W.Cl.2, SAPS 277) — MyEasyISO can't match |
| **2** | Objectives, Targets & KPI Tracking | Low-Medium | Build now | ISO 9001/45001 §6.2. Every auditor asks. Recharts already in stack. ~2-3 weeks |
| **3** | Management Review Module | Low-Medium | Build within 3 months | Required by ALL ISO standards (§9.3). Pre-populate agenda from live dashboard data |
| **4** | Work Permit Management | Medium-High | Build within 6 months | Mandatory for high-risk SA construction. Natural cross-sell to subcontractor ecosystem |
| **5** | Mobile-Optimised Field Capture (PWA) | High | Build within 9 months | Construction compliance is a field activity. Desktop-only = back-office tool. Biggest UX gap |

### Secondary Features (Phase 5+)

| Feature | Effort | Notes |
|---|---|---|
| HIRA Register | Medium | Can leverage existing risk infrastructure |
| Legal/Regulatory Register | Low-Medium | Renewal reminders + compliance status |
| Competence & Training | Medium | Training calendar, competence matrix |
| Emergency Preparedness | Low-Medium | Scenario register + drill records |
| Context of Org (SWOT/PESTEL) | Low | Simple structured forms |

---

## 7. Long-Term Strategic Vision

### The Supply Chain Compliance Network Play

ConformEdge's subcontractor portal is the seed of a **network-effect business**. The pivot is not away from construction but upward in the value chain:

1. **Current state:** Individual org compliance tool
2. **Near-term:** Principal contractors use ConformEdge to onboard, monitor, and report on their subcontractor ecosystem
3. **Long-term:** ConformEdge becomes the platform — each principal contractor brings 10-50 subcontractors. Network effects create high switching costs

This is a B2B2B play that no competitor is telling. MyEasyISO's model is a closed org-internal tool — they cannot pivot to this without architectural changes.

### Geographic Expansion Path
1. SA construction (current)
2. SADC region (Botswana, Namibia, Mozambique)
3. East Africa (Kenya, Tanzania)
4. Adjacent verticals (mining, manufacturing)

---

## 8. Conclusion

> ConformEdge's strategic position is strong but incomplete. The AI and IMS architecture is a genuine moat that MyEasyISO cannot replicate without a full rebuild. The subcontractor portal is the seed of a network-effect business.
>
> The real threat is not MyEasyISO — it is being perceived as incomplete by SA construction buyers who need incident management and work permits before they can replace their current system.
>
> The two immediate builds (Incident Management + Objectives/KPI Tracking) are what move ConformEdge from "interesting tool" to **operational system of record**.

---

*Analysis conducted 2026-03-09 by ISU Technologies Product Team*
*Multi-agent review: Feature Mapping, Strategic Analysis, Technical Review*

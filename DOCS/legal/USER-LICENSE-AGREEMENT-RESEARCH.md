# ConformEdge — User License & Agreement Research Report

**Date:** 13 March 2026
**Compiled by:** 4-agent parallel research team
**Purpose:** Inform implementation of user license agreements in the ConformEdge platform

---

## Executive Summary

ConformEdge needs a **SaaS Subscription Agreement** (not a EULA — we're cloud-hosted, not installed software) with supporting agreements. Implementation should use **clickwrap** (checkbox + "I Accept") gated in Next.js middleware via Clerk session claims, with full audit trail in PostgreSQL.

### Key Findings

| Area | Recommendation |
|---|---|
| **License type** | SaaS Subscription Agreement (MSA + Order Form structure) |
| **Acceptance UX** | Clickwrap with unchecked checkbox — strongest legal enforceability |
| **SA legal basis** | ECT Act explicitly validates click-to-accept; POPIA requires written DPA |
| **AI disclaimer** | Critical — must disclaim AI outputs as advisory only, not professional advice |
| **Cross-border** | Explicit consent needed for data transfers to Anthropic (US), Cloudflare, Clerk |
| **Implementation** | Clerk publicMetadata for fast middleware gating + DB for audit trail |
| **Partner model** | Three-tier agreement: partner agreement, sub-processing DPA, flow-down terms |

---

## 1. License Type: SaaS Subscription Agreement

### Why NOT a EULA

| Type | Purpose | Fit for ConformEdge |
|---|---|---|
| **EULA** | License to use *installed* software | No — we're cloud-hosted |
| **SaaS Agreement** | Access to a *cloud service* — covers data rights, IP, payment, SLAs | **Yes** |
| **Terms of Service** | Broader behavioural/legal terms | Too generic for B2B |
| **Subscription Agreement** | Commercial wrapper — pricing, seats, billing | Combine with SaaS Agreement |

### Recommended Document Structure

```
Master Subscription Agreement (MSA)
├── Order Form / Schedule (tier, seats, AI credits, pricing, term)
├── Service Level Agreement (SLA)
├── Data Processing Addendum (DPA / POPIA Operator Agreement)
├── Acceptable Use Policy (AUP)
├── AI Supplemental Terms
└── Privacy Policy
```

This multi-document structure lets you negotiate enterprise deals via custom Order Forms without changing the MSA.

**Sources:** Kader Law, Law 365, CloudContracts365, TermsFeed, Promise Legal, American Bar Association

---

## 2. Agreements Required (Prioritized)

### Tier 1 — Legally Required (Must Have Before Launch)

| Agreement | Legal Basis | Purpose |
|---|---|---|
| **Privacy Policy** | POPIA Section 18 | Data collection disclosure, data subject rights |
| **Terms of Service / MSA** | ECT Act, common law | Core customer contract |
| **Data Processing Agreement** | POPIA Section 21 | Operator agreement for processing client data |
| **Cookie Policy** | POPIA + ECTA | Cookie usage disclosure and consent |

### Tier 2 — Contractually Essential (Business Necessity)

| Agreement | Purpose |
|---|---|
| **Acceptable Use Policy** | Multi-tenant protection, AI credit abuse prevention |
| **Service Level Agreement** | Uptime commitments for Business/Enterprise tiers |
| **AI Supplemental Terms** | AI output disclaimers, sub-processor disclosure |

### Tier 3 — Best Practice (Differentiator)

| Agreement | Purpose |
|---|---|
| **Sub-processor List** | Public list: Anthropic, Cloudflare, Clerk, Resend, Hetzner |
| **Data Retention Policy** | How long data is kept, deletion procedures |
| **Security Policy** | Encryption standards, access controls, incident response |

### Tier 4 — Partner-Specific

| Agreement | Audience |
|---|---|
| **Partner Agreement (Consulting)** | Sub-license, client management, flow-down terms |
| **Partner Agreement (White-Label)** | Branding license, IP restrictions |
| **Referral Terms** | Commission structure, attribution, payment |

---

## 3. Agreement Hierarchy & Precedence

In case of conflict between documents:

1. **Data Processing Agreement** (POPIA compliance cannot be overridden)
2. **Master Subscription Agreement / Terms of Service**
3. **Service Level Agreement**
4. **Acceptable Use Policy**
5. **Order Form / Subscription Details**
6. **Product documentation and policies**

---

## 4. Critical Clauses for ConformEdge

### 4.1 AI Output Disclaimer (Highest Priority)

```
AI-GENERATED OUTPUTS DISCLAIMER: The AI-powered features of the
Service, including but not limited to document classification, gap
analysis, and compliance recommendations, are provided as decision-
support tools only and do not constitute professional compliance,
legal, or auditing advice. AI Outputs may contain errors,
inaccuracies, or omissions. Customer acknowledges that:
(i) AI Outputs should be reviewed by qualified personnel before
any compliance decision is made;
(ii) Provider does not guarantee that AI Outputs will ensure
compliance with any ISO standard, regulation, or law; and
(iii) Customer retains sole responsibility for all compliance
decisions and outcomes.
```

### 4.2 AI Data Processing

```
Customer Data submitted to the AI engine is processed solely to
generate Outputs for Customer's use. Provider does not use Customer
Data to train, improve, or fine-tune any AI models. Customer Data
is transmitted to the AI sub-processor (Anthropic) via API and is
subject to Anthropic's API data usage policy, which prohibits
training on API inputs.
```

### 4.3 AI Sub-Processor Disclosure

```
The Service utilizes Anthropic's Claude AI as a sub-processor for
document analysis features. Customer consents to this sub-processing
arrangement. Provider will notify Customer of any material change
to AI sub-processors with 30 days' notice.
```

### 4.4 Named User Licensing

```
Each User Account is for a single named individual and may not be
shared. Customer shall not allow more than one individual to use a
User Account. Customer's User count will be reviewed quarterly. If
actual Users exceed the subscribed quantity, Customer will be
invoiced for additional Users at the then-current per-User rate.
```

### 4.5 AI Credit Definition

```
One AI Credit equals one document classification or gap analysis
request submitted to the AI engine, regardless of document length
or complexity. AI Credits are allocated at the Organization level.
Unused Credits do not roll over to subsequent billing periods.
```

### 4.6 POPIA Operator Obligations (DPA Core)

```
Provider, acting as Operator under POPIA, shall:
(a) process Personal Information only on the documented instructions
    of Customer (the Responsible Party);
(b) ensure that persons authorized to process Personal Information
    are bound by confidentiality obligations;
(c) implement appropriate technical and organizational security
    measures as required by Section 19 of POPIA;
(d) not engage a sub-operator without prior written consent;
(e) assist Customer in responding to data subject requests under
    Sections 23-25 of POPIA;
(f) notify Customer without undue delay of any security compromise;
(g) upon termination, return or securely destroy all Personal
    Information and certify destruction in writing.
```

### 4.7 Cross-Border Data Transfer Consent

```
Customer acknowledges and consents to the transfer of Personal
Information outside the Republic of South Africa to the following
sub-processors for the purposes described:
- Anthropic (United States) — AI document classification
- Cloudflare (United States/EU) — file storage (R2)
- Clerk (United States) — user authentication
- Resend (United States) — email notifications
- Hetzner (Germany) — hosting infrastructure

Provider maintains data processing agreements with each sub-
processor providing protections substantially similar to POPIA.
```

### 4.8 Partner Sub-License (Consulting)

```
Partner is granted a non-exclusive, non-transferable right to
provision and manage Client Organizations on the Platform. Partner
shall: (a) execute a Client Agreement incorporating Provider's
AUP and AI Output Disclaimer without modification ('Flow-Down
Terms'); (b) remain responsible for Client's compliance with
Flow-Down Terms; (c) not modify, reverse engineer, or create
derivative works of the Platform.
```

### 4.9 White-Label Branding License

```
Partner is granted a limited, non-exclusive license to present
the Platform under Partner's branding. Provider retains all IP
rights in the Platform. Upon termination, Partner shall immediately
cease all use of the Platform under Partner's branding.
```

### 4.10 Limitation of Liability

```
Provider's total aggregate liability shall not exceed the fees
paid by Customer in the 12 months preceding the claim. Provider
shall not be liable for any indirect, consequential, special,
or incidental damages. This limitation does not apply to
liability for fraud, wilful misconduct, or gross negligence.
```

---

## 5. South African Legal Requirements

### 5.1 POPIA (Protection of Personal Information Act)

| Requirement | Detail |
|---|---|
| **Privacy Policy** | Must include: responsible party identity, purpose, categories of recipients, cross-border transfers, data subject rights, retention periods, Information Officer contact |
| **Consent** | Must be voluntary, specific, informed, unambiguous. Pre-ticked boxes are non-compliant. Separate consent needed for AI processing. |
| **DPA** | Written contract mandatory between responsible party and operator (Section 21) |
| **Cross-border** | Section 72 — requires contractual safeguards + explicit consent for transfers to US-based services |
| **Data subject rights** | Access, correct, delete — mechanisms must exist (Sections 23-24) |
| **Information Officer** | Must register with Information Regulator (Section 55) |
| **Penalties** | Up to R10 million or 10% of annual turnover + up to 10 years imprisonment |
| **Breach notification** | Must notify responsible party "without undue delay" |

### 5.2 ECT Act (Electronic Communications and Transactions Act)

| Requirement | Detail |
|---|---|
| **Click-to-accept** | Legally valid — ECT Act Part 2 explicitly recognizes click-wrap agreements |
| **Electronic signatures** | Standard electronic signatures (typed name, click) sufficient for SaaS agreements |
| **Record retention** | Data must be accessible, in original format, with origin/destination/date determinable |
| **Business info** | Must display: legal name, registration, physical address, website |

### 5.3 CPA (Consumer Protection Act)

| Requirement | Detail |
|---|---|
| **Applicability** | Does NOT apply to companies with turnover > R2 million. Most ConformEdge clients exceed this. |
| **Best practice** | Comply anyway — covers smaller clients, builds trust |
| **Plain language** | Section 22 — terms must be understandable |
| **Auto-renewal** | Must notify 40-80 business days before expiry (Section 14) |
| **Cooling-off** | Only applies to direct marketing, NOT self-initiated sign-ups |
| **Unfair terms** | Cannot exclude liability for gross negligence or wilful misconduct |

### 5.4 Industry-Specific Retention Periods

| Record Type | Retention Period | Source |
|---|---|---|
| Medical surveillance | 40 years | MHSA |
| Noise/lead/asbestos | 30 years | MHSA |
| Incident/accident records | 10 years minimum | MHSA |
| General OHS records | 3 years | OHS Act |
| Project H&S files | 3 years after completion | OHS Act |

---

## 6. Implementation Pattern

### 6.1 Acceptance UX — Clickwrap

**Enforceability ranking:**

| Pattern | Enforceability | Notes |
|---|---|---|
| **Clickwrap** | **Highest** | Unchecked checkbox + "I Accept" button |
| Sign-in-wrap | Medium | Weakened by Feb 2025 Chabolla v. ClassPass ruling |
| Browsewrap | Lowest | Courts consistently decline to enforce |

**Requirements:**
- Never pre-check the checkbox
- Full terms must be accessible (scrollable or linked)
- Mobile: minimum 44x44px tap targets
- Show change summary on re-acceptance

### 6.2 Technical Architecture — Clerk + Database Hybrid

**Why dual storage:**
- **Clerk `publicMetadata`** in session token → fast middleware check, no DB query per request
- **Database `AgreementAcceptance`** table → full audit trail (IP, user agent, content hash)

**Flow:**
1. User signs in → middleware checks `termsAcceptedVersion` in session claims
2. If version mismatch → redirect to `/terms/accept`
3. User reads terms, checks checkbox, clicks "I Accept"
4. Server action: writes DB audit record + updates Clerk metadata
5. Redirect to original destination

**Middleware integration (adapting existing `src/middleware.ts`):**

```typescript
// After auth.protect() check:
const acceptedVersion = sessionClaims?.metadata?.termsAcceptedVersion
if (acceptedVersion !== CURRENT_TERMS_VERSION && !isTermsRoute(req)) {
  return NextResponse.redirect(new URL("/terms/accept", req.url))
}
```

**Clerk session token customization:**
```json
{ "metadata": "{{user.public_metadata}}" }
```

### 6.3 Database Schema (Prisma)

```prisma
enum AgreementType {
  TERMS_OF_SERVICE
  PRIVACY_POLICY
  DATA_PROCESSING_ADDENDUM
  SUBSCRIPTION_AGREEMENT
  PARTNER_AGREEMENT
  ACCEPTABLE_USE_POLICY
}

enum AgreementVersionStatus {
  DRAFT
  PUBLISHED
  SUPERSEDED
  ARCHIVED
}

model Agreement {
  id        String         @id @default(uuid()) @db.Uuid
  type      AgreementType  @unique
  title     String
  slug      String         @unique   // for URLs: "terms-of-service"
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")

  versions  AgreementVersion[]

  @@map("agreements")
}

model AgreementVersion {
  id                   String                 @id @default(uuid()) @db.Uuid
  agreementId          String                 @map("agreement_id") @db.Uuid
  version              String                 // "2026.1"
  content              String                 @db.Text   // Markdown
  changeSummary        String?                @map("change_summary") @db.Text
  contentHash          String                 @map("content_hash")   // SHA-256
  status               AgreementVersionStatus @default(DRAFT)
  requiresReacceptance Boolean                @default(true) @map("requires_reacceptance")
  effectiveDate        DateTime?              @map("effective_date")
  notificationDate     DateTime?              @map("notification_date")
  publishedAt          DateTime?              @map("published_at")
  createdAt            DateTime               @default(now()) @map("created_at")

  agreement   Agreement              @relation(fields: [agreementId], references: [id])
  acceptances AgreementAcceptance[]

  @@unique([agreementId, version])
  @@index([agreementId, status])
  @@map("agreement_versions")
}

model AgreementAcceptance {
  id                      String   @id @default(uuid()) @db.Uuid
  userId                  String   @map("user_id")
  agreementVersionId      String   @map("agreement_version_id") @db.Uuid
  organizationId          String?  @map("organization_id")
  acceptedAt              DateTime @default(now()) @map("accepted_at")
  ipAddress               String?  @map("ip_address")
  userAgent               String?  @map("user_agent") @db.Text
  acceptanceMethod        String   @map("acceptance_method")
  contentHashAtAcceptance String   @map("content_hash_at_acceptance")

  agreementVersion AgreementVersion @relation(fields: [agreementVersionId], references: [id])

  // NEVER delete — append only
  @@index([userId, agreementVersionId])
  @@index([userId])
  @@index([organizationId])
  @@map("agreement_acceptances")
}
```

### 6.4 Multi-Entity Acceptance

| Who | What they accept | When |
|---|---|---|
| **Individual user** | Terms of Service + Privacy Policy | First login |
| **Org owner/admin** | Subscription Agreement + DPA | Org creation |
| **Partner** | Partner Agreement + User Terms | Partner onboarding |

### 6.5 Version Management

- `DRAFT → PUBLISHED → SUPERSEDED → ARCHIVED` lifecycle
- Only one PUBLISHED version per agreement type at a time
- **Material changes** (liability, data, pricing) → force re-acceptance
- **Non-material changes** (typos, formatting) → notify only, no re-acceptance
- **30-day grace period** before new terms take effect
- Store content as Markdown, hash with SHA-256 at publish time

---

## 7. Action Items (Prioritized)

### Immediate (Before Partner Onboarding)

| # | Action | Effort |
|---|---|---|
| 1 | Register Information Officer with Information Regulator | Low |
| 2 | Add 3 Prisma models + 2 enums to schema | Low |
| 3 | Build `/terms/accept` page with clickwrap UI | Medium |
| 4 | Add middleware terms-version gate | Low |
| 5 | Draft Terms of Service content | High (legal review) |
| 6 | Draft Privacy Policy content | High (legal review) |
| 7 | Draft AI Supplemental Terms | Medium |

### Short-Term (Before Public Launch)

| # | Action | Effort |
|---|---|---|
| 8 | Draft DPA template | High (legal review) |
| 9 | Draft AUP | Medium |
| 10 | Build agreement version management (admin) | Medium |
| 11 | Implement re-acceptance flow for version updates | Medium |
| 12 | Add sub-processor list page | Low |
| 13 | Configure Clerk session token with metadata | Low |

### Medium-Term

| # | Action | Effort |
|---|---|---|
| 14 | Draft SLA per tier | Medium |
| 15 | Draft Partner Agreements (3 types) | High (legal review) |
| 16 | Build data subject request mechanism | Medium |
| 17 | Auto-renewal notification system (40-80 days) | Medium |
| 18 | Engage SA attorney for legal review | External |

---

## 8. Governing Law & Dispute Resolution

**Governing law:** South African law

**Dispute resolution (recommended):** Tiered approach:
1. Informal negotiation (30 days)
2. Mediation
3. Arbitration under AFSA (Arbitration Foundation of Southern Africa) rules

**Liability cap:** Fees paid in 12 months preceding claim. Exclude consequential/indirect damages except for data breaches caused by Provider's negligence.

---

## Sources

### License Types
- Kader Law — Terms of Service vs SaaS Agreement vs EULA
- Law 365 — EULA vs SaaS Agreement differences
- TermsFeed — SaaS: EULA, SLA or ToS
- Promise Legal — SaaS Agreements: MSA Structure Guide 2025
- American Bar Association — SaaS Key Contractual Provisions

### AI-Specific
- Venable LLP — Practical Tips for AI SaaS Agreements 2026
- Vorys — Key Contract Terms for AI Products (Parts 1 & 2)
- Tascon Legal — AI Clauses in Contracts 2025
- Bonterms — AI Standard Clauses v1.0
- Galkin Law — AI Issues in SaaS Agreements

### SA Legal
- POPIA Official Website (popia.co.za) — Sections 11, 18, 19, 21, 23-24, 55, 72
- Michalsons — Guide to the ECT Act, Cross-border Transfer Guidance
- Bowmans — Information Officer Registration, First R5M POPIA Fine
- VDT Attorneys — Operator Role and Liability Under POPIA
- Barter McKellar — SaaS Agreements in South Africa
- Eversheds Sutherland — POPIA Amendments 2025
- GoLegal — CPA Fixed-Term Contracts
- Webber Wentzel — Arbitration in SA, Indemnity Clauses

### Implementation
- Clerk Docs — User Metadata, Custom Session Tokens, Onboarding Flow, Middleware
- Ironclad — Clickwrap Best Practices, Force Scroll, Updating Terms
- Hunton — Ninth Circuit Sign-In Wrap Ruling (Chabolla v. ClassPass 2025)
- TermsFeed — Clickwrap vs Browsewrap Enforceability
- Securiti — POPIA Compliance Checklist

### Partner/Reseller
- Callin.io — White-Label SaaS Reseller Agreement
- UpCounsel — SaaS Reseller Agreement
- HubSpot — Partner Program Agreement
- SPZ Legal — Enterprise SaaS: Entities vs Users

---

*Research compiled 13 March 2026 by 4-agent team. This is research guidance — engage a South African attorney specializing in POPIA/data protection for final legal review of agreement drafts.*

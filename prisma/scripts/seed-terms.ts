/**
 * Seed the initial Terms of Service & Privacy Policy
 * Run: npx tsx prisma/scripts/seed-terms.ts
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const TERMS_CONTENT = `# ConformEdge Terms of Service, Privacy Policy & Acceptable Use Policy

**Effective Date:** 13 March 2026
**Version:** 1.0
**Provider:** ISU Technologies (Pty) Ltd ("ISU Technologies", "we", "us", "Provider")
**Registration:** Republic of South Africa
**Contact:** nhlanhla@isutech.co.za

---

## PART A: TERMS OF SERVICE

### 1. Agreement Overview

These Terms of Service ("Terms") govern your access to and use of the ConformEdge platform ("Service"), an AI-powered SHEQ & compliance management platform operated by ISU Technologies (Pty) Ltd.

By clicking "Accept & Continue", creating an account, or using the Service, you agree to be bound by these Terms, our Privacy Policy (Part B), and our Acceptable Use Policy (Part C). If you are accepting on behalf of an organization, you represent that you have the authority to bind that organization.

This agreement is legally binding under the Electronic Communications and Transactions Act 25 of 2002 (ECT Act) of the Republic of South Africa.

### 2. Service Description

ConformEdge provides:
- AI-powered document classification and gap analysis
- SHEQ & compliance management across multiple standards (ISO 9001, 14001, 45001, 27001, 22301, 37001, 39001, DMRE/MHSA, POPIA)
- Incident management, work permits, objectives tracking, and management reviews
- Subcontractor compliance portals
- Audit pack generation and reporting
- Integrated Management System (IMS) cross-standard mapping

### 3. User Accounts & Licensing

**3.1 Named Users.** Each User Account is for a single named individual and may not be shared. You shall not allow more than one individual to use a User Account.

**3.2 Subscription Tiers.** Access to features is governed by your subscription tier (Essentials, Professional, Business, or Enterprise). Feature availability and limits (users, standards, AI credits, projects, subcontractors) are defined by your active subscription.

**3.3 AI Credits.** One AI Credit equals one document classification or gap analysis request submitted to the AI engine. AI Credits are allocated at the Organization level and do not roll over to subsequent monthly billing periods unless on an annual plan.

**3.4 Roles.** The Service supports five user roles: Owner, Admin, Manager, Auditor, and Viewer. Access permissions are determined by assigned role.

### 4. AI-Powered Features — Important Disclaimers

**4.1 Advisory Only.** The AI-powered features of the Service, including document classification, gap analysis, compliance scoring, and recommendations, are provided as **decision-support tools only** and do not constitute professional compliance, legal, or auditing advice.

**4.2 No Guarantee of Accuracy.** AI-generated outputs may contain errors, inaccuracies, or omissions. You acknowledge that:
- AI outputs should be reviewed by qualified personnel before any compliance decision is made
- We do not guarantee that AI outputs will ensure compliance with any ISO standard, regulation, or law
- You retain sole responsibility for all compliance decisions and outcomes

**4.3 AI Data Processing.** Data submitted to the AI engine is processed solely to generate outputs for your use. We do not use your data to train, improve, or fine-tune any AI models. Data is transmitted to our AI sub-processor (Anthropic) via API, which prohibits training on API inputs.

**4.4 AI Sub-Processor.** The Service utilizes Anthropic's Claude AI as a sub-processor for document analysis. We will notify you of any material change to AI sub-processors with 30 days' notice.

**4.5 AI Availability.** AI features depend on third-party infrastructure. AI-specific downtime is excluded from SLA uptime calculations. In the event of extended AI unavailability exceeding 72 hours, you may request a pro-rata credit for unused AI Credits.

### 5. Subscription & Payment

**5.1 Billing.** Subscriptions are billed monthly or annually as selected. Annual billing provides a 17% discount (pay 10 months for 12).

**5.2 Seat True-Up.** User counts may be reviewed periodically. If actual users exceed the subscribed quantity, you will be invoiced for additional users at the then-current per-user rate.

**5.3 Renewal.** Subscriptions auto-renew at the end of each billing period. We will notify you at least 40 business days before annual renewal. You may cancel with 20 business days' written notice before the renewal date.

**5.4 Cancellation.** You may cancel your subscription at any time. Access continues until the end of the current billing period. No refunds for partial periods.

### 6. Data Ownership & Portability

**6.1 Your Data.** You retain all rights to your data. We do not claim ownership of any content you upload or create on the platform.

**6.2 Data Isolation.** In our multi-tenant architecture, each organization's data is logically isolated and inaccessible to other tenants.

**6.3 Export.** You may export your data at any time in standard formats (CSV, PDF). Upon termination, we provide 30 days of read-only access for data extraction.

**6.4 Deletion.** Upon written request after termination, we will delete your data within 30 days and provide written confirmation of deletion.

### 7. Intellectual Property

**7.1 Platform IP.** The ConformEdge platform, including its software, design, algorithms, IMS engine, and documentation, is the intellectual property of ISU Technologies (Pty) Ltd. You receive a non-exclusive, non-transferable license to access the Service during your subscription term.

**7.2 Your Content.** Templates, documents, and content you create remain your property.

### 8. Limitation of Liability

**8.1 Liability Cap.** Our total aggregate liability shall not exceed the fees paid by you in the 12 months preceding the claim.

**8.2 Exclusion.** We shall not be liable for any indirect, consequential, special, or incidental damages, including but not limited to loss of profits, data loss, or business interruption.

**8.3 Exceptions.** This limitation does not apply to liability arising from fraud, wilful misconduct, or gross negligence.

**8.4 Compliance Disclaimer.** We do not guarantee that use of the Service will result in achieving or maintaining ISO certification or regulatory compliance. You are solely responsible for your compliance obligations.

### 9. Termination

**9.1 By You.** You may terminate at any time by cancelling your subscription.

**9.2 By Us.** We may suspend or terminate your access for material breach of these Terms, non-payment exceeding 30 days, or violation of the Acceptable Use Policy, with reasonable notice where practicable.

**9.3 Effect.** Upon termination: (a) your access ceases at the end of the billing period; (b) we provide 30 days for data export; (c) after the export period, we delete your data per our retention policy.

### 10. Governing Law & Dispute Resolution

**10.1 Governing Law.** This Agreement is governed by the laws of the Republic of South Africa.

**10.2 Dispute Resolution.** Any dispute arising from this Agreement shall first be subject to good-faith negotiation for 30 days. If unresolved, the dispute shall be referred to arbitration under the rules of the Arbitration Foundation of Southern Africa (AFSA). The seat of arbitration shall be Durban, KwaZulu-Natal.

---

## PART B: PRIVACY POLICY

This Privacy Policy is issued in compliance with the Protection of Personal Information Act 4 of 2013 (POPIA).

### 11. Responsible Party

**ISU Technologies (Pty) Ltd**
Email: nhlanhla@isutech.co.za
Information Officer: Nhlanhla Mnyandu

### 12. Personal Information We Collect

| Category | Examples | Purpose |
|---|---|---|
| Account information | Name, email, profile image | Service delivery, authentication |
| Organization data | Company name, industry, team members | Multi-tenant service provision |
| Compliance documents | Uploaded files, classifications | Core service functionality |
| Usage data | Login times, feature usage, audit trail | Service improvement, security |
| Device data | IP address, browser type, user agent | Security, terms acceptance audit |

### 13. Legal Basis for Processing

We process personal information based on:
- **Contract performance** (Section 11(1)(c) of POPIA): necessary to deliver the Service
- **Legitimate interest** (Section 11(1)(f)): service improvement, security monitoring
- **Consent** (Section 11(1)(a)): for AI processing and cross-border data transfers

### 14. Cross-Border Data Transfers

Your data may be transferred to the following sub-processors outside the Republic of South Africa:

| Sub-Processor | Location | Purpose | Safeguards |
|---|---|---|---|
| Anthropic | United States | AI document classification | API data usage policy (no training on inputs), contractual safeguards |
| Cloudflare (R2) | United States / EU | File storage | DPA, SOC 2 certified, encryption at rest |
| Clerk | United States | User authentication | DPA, SOC 2 certified, GDPR compliant |
| Resend | United States | Email notifications | DPA, encryption in transit |
| Hetzner | Germany | Hosting infrastructure | DPA, ISO 27001 certified, GDPR compliant |

These transfers are made under Section 72 of POPIA, based on contractual safeguards providing protection substantially similar to POPIA, and your explicit consent given upon acceptance of these Terms.

### 15. Data Subject Rights

Under POPIA, you have the right to:
- **Access** your personal information (Section 23)
- **Correct** inaccurate or incomplete information (Section 24)
- **Delete** information we are no longer authorized to retain (Section 24)
- **Object** to processing of your personal information (Section 11(3))
- **Withdraw consent** at any time (without affecting prior lawful processing)
- **Lodge a complaint** with the Information Regulator

To exercise these rights, contact: nhlanhla@isutech.co.za

### 16. Data Retention

- **Account data:** Retained for the duration of your subscription plus 90 days
- **Compliance documents:** Retained per your organization's settings and applicable regulations (up to 40 years for MHSA medical records)
- **Audit trail:** Retained for the duration of your subscription plus 7 years (regulatory requirement)
- **Terms acceptance records:** Retained indefinitely (legal compliance)

### 17. Security Measures

We implement appropriate technical and organizational measures per Section 19 of POPIA, including:
- Clerk authentication with multi-factor authentication support
- Role-based access control (5 roles)
- Encrypted file storage (Cloudflare R2)
- Full audit trail of all system actions
- Tenant data isolation in multi-tenant architecture
- Regular security assessments

### 18. Cookies

The Service uses essential cookies for:
- Authentication session management (Clerk)
- Session state and preferences

We do not use tracking or advertising cookies. By using the Service, you consent to essential cookies as described.

### 19. Breach Notification

In the event of a security compromise affecting your personal information, we will:
- Notify you without undue delay
- Notify the Information Regulator where required by Section 22 of POPIA
- Provide details of the breach and remedial measures taken

---

## PART C: ACCEPTABLE USE POLICY

### 20. Permitted Use

You may use ConformEdge solely for lawful SHEQ and compliance management purposes consistent with your subscription tier.

### 21. Prohibited Conduct

You shall not:
- Share login credentials or allow unauthorized access to your account
- Upload malicious files, malware, or content that infringes third-party rights
- Attempt to access other tenants' data or circumvent data isolation
- Use the AI features to generate content unrelated to compliance management
- Submit bulk automated requests exceeding 50 documents per hour without prior arrangement
- Circumvent subscription limits, including creating multiple organizations to bypass tier restrictions
- Reverse engineer, decompile, or create derivative works of the platform
- Use the Service for any purpose that violates South African law

### 22. Fair Use — AI Credits

AI Credits are subject to fair use. We reserve the right to throttle requests that exceed reasonable usage patterns to maintain service quality for all users. Systematic abuse of AI Credits may result in account suspension.

### 23. Content Standards

All content uploaded to the platform must:
- Be lawful and not infringe any third-party intellectual property rights
- Not contain personal information beyond what is necessary for compliance purposes
- Be relevant to your organization's compliance management activities

### 24. Enforcement

Violation of this Acceptable Use Policy may result in:
- Warning and request to cease the prohibited activity
- Temporary suspension of access
- Permanent termination of your account
- Reporting to relevant authorities where required by law

---

## PART D: GENERAL PROVISIONS

### 25. Changes to These Terms

We may update these Terms from time to time. Material changes will be communicated with at least 30 days' notice via email and an in-platform notification. Continued use after the effective date of updated Terms constitutes acceptance. If you do not agree with updated Terms, you may terminate your subscription.

### 26. Entire Agreement

These Terms, together with any Order Form or subscription details, constitute the entire agreement between you and ISU Technologies regarding the Service.

### 27. Severability

If any provision of these Terms is held to be unenforceable, the remaining provisions shall continue in full force and effect.

### 28. Contact

For any questions about these Terms, contact:

**ISU Technologies (Pty) Ltd**
Email: nhlanhla@isutech.co.za
Platform: conformedge.isutech.co.za

---

*ConformEdge Terms of Service, Privacy Policy & Acceptable Use Policy v1.0*
*Effective 13 March 2026*
*ISU Technologies (Pty) Ltd — Republic of South Africa*
*All prices in South African Rand (ZAR), excluding VAT where applicable.*
`

async function main() {
  console.log("Seeding Terms of Service v1.0...")

  // Upsert to avoid duplicates on re-run
  await db.termsVersion.upsert({
    where: { version: "1.0" },
    create: {
      version: "1.0",
      title: "Terms of Service, Privacy Policy & Acceptable Use Policy",
      content: TERMS_CONTENT,
      status: "ACTIVE",
      effectiveAt: new Date("2026-03-13T00:00:00Z"),
      publishedAt: new Date(),
    },
    update: {
      content: TERMS_CONTENT,
      title: "Terms of Service, Privacy Policy & Acceptable Use Policy",
    },
  })

  console.log("Terms v1.0 seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

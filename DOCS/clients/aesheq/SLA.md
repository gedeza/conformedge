# Service Level Agreement (SLA)

## ConformEdge SHEQ & Compliance Platform

---

> **Agreement Date:** 18 March 2026
> **Agreement Number:** SLA-AESHEQ-2026-001
> **Effective Date:** Upon platform go-live

---

### Parties

**Service Provider:**
ISU Technologies
Contact: Nhlanhla Mnyandu, Software Developer
Email: nhlanhla@isutech.co.za

**Client:**
AE SHEQ (PTY) LTD
Registration No.: 2020/574070/07
Contact: Sachache Simon Moletsane, Director
Address: House No 1136 Morula Street, Mokopane, Mahwelereng Zone 1, Limpopo, 0626

---

## 1. Definitions

| Term | Definition |
|------|-----------|
| **Platform** | The ConformEdge SHEQ & Compliance Platform, a cloud-based SaaS application for SHEQ & compliance management |
| **Uptime** | The percentage of time the Platform is available and operational during a calendar month, excluding Scheduled Maintenance |
| **Downtime** | Any period during which the Platform is unavailable to the Client due to issues within ISU Technologies' control |
| **Scheduled Maintenance** | Pre-planned maintenance windows communicated to the Client in advance |
| **Business Hours** | Monday to Friday, 08:00–17:00 SAST (South African Standard Time, UTC+2), excluding South African public holidays |
| **Response Time** | The time between a support request being received and ISU Technologies acknowledging the request |
| **Resolution Target** | The target time to resolve or provide a workaround for a reported issue (best-effort, not guaranteed) |
| **Service Credit** | A credit applied to the Client's account as a remedy for failure to meet the Uptime Guarantee |

---

## 2. Service Description

ISU Technologies provides AE SHEQ (PTY) LTD with access to the ConformEdge SHEQ & Compliance Platform on the **Business Tier**, which includes:

- Up to 25 users (+R199/user beyond)
- All 11 compliance frameworks (ISO 9001, 14001, 45001, 27001, 19011, 31000, 44001, DMRE/MHSA, POPIA, ECSA, SACPCMP)
- Full incident management suite with COIDA and MHSA statutory reporting
- Work permits (7 types), compliance checklists, subcontractor management
- AI-powered document classification (500 classifications/month)
- Management reviews, objectives & KPI tracking, audit pack generation
- Client portal, document approval workflows, email notifications
- API access

The full feature set is detailed in the Client Brief (ref: CLIENT-BRIEF.md).

---

## 3. Uptime Guarantee

### 3.1 Commitment

ISU Technologies guarantees a minimum monthly uptime of **99.5%**, equivalent to no more than **3 hours and 36 minutes** of unscheduled Downtime per calendar month.

### 3.2 Uptime Calculation

```
Uptime % = ((Total Minutes in Month − Scheduled Maintenance − Downtime) / (Total Minutes in Month − Scheduled Maintenance)) × 100
```

### 3.3 Exclusions from Downtime Calculation

The following are **not** counted as Downtime:
- Scheduled Maintenance windows (see Section 6)
- Issues caused by the Client's internet connection, devices, or browser
- Third-party service outages beyond ISU Technologies' control (e.g., Clerk authentication, Cloudflare, payment processors)
- Force Majeure events (see Section 10)
- Issues resulting from Client misuse or unauthorised modifications
- DNS propagation delays

---

## 4. Support

### 4.1 Support Channels

| Channel | Availability |
|---------|-------------|
| **Email** | nhlanhla@isutech.co.za |
| **In-App** | Help panel and support request form within ConformEdge |
| **Phone** | By arrangement during Business Hours |

### 4.2 Severity Levels & Response Times

| Severity | Definition | Response Time | Resolution Target |
|----------|-----------|---------------|-------------------|
| **Critical (S1)** | Platform completely unavailable; all users affected | 2 hours | 8 hours |
| **High (S2)** | Major feature non-functional with no workaround; business operations impaired | 4 hours | 24 hours |
| **Medium (S3)** | Feature impaired but workaround available; limited business impact | 8 hours | 48 hours |
| **Low (S4)** | General questions, minor cosmetic issues, feature requests | 24 hours | 5 business days |

**Notes:**
- Response times are measured during **Business Hours** (Mon–Fri, 08:00–17:00 SAST)
- Critical severity (S1) issues are monitored outside Business Hours on a best-effort basis
- Resolution targets are best-effort and not subject to Service Credits
- ISU Technologies will provide status updates at reasonable intervals for S1 and S2 issues

### 4.3 Escalation Path

| Level | Contact | Triggered When |
|-------|---------|---------------|
| **Level 1** | ISU Tech Support | Initial support request |
| **Level 2** | Nhlanhla Mnyandu (Lead Developer) | S1/S2 unresolved within Response Time |
| **Level 3** | ISU Technologies Management | S1 unresolved within Resolution Target |

---

## 5. Service Credits

### 5.1 Credit Schedule

If ISU Technologies fails to meet the 99.5% Uptime Guarantee in any calendar month, the Client is entitled to the following Service Credits:

| Monthly Uptime | Credit (% of Monthly Fee) |
|----------------|--------------------------|
| 99.0% – 99.49% | 5% |
| 98.0% – 98.99% | 10% |
| Below 98.0% | 25% |

### 5.2 Credit Terms

- Service Credits are applied to future invoices; no cash refunds
- Maximum credit per month: **25% of one month's subscription fee** (R2,124.75)
- Client must request Service Credits within 30 days of the affected month
- Credits are not cumulative across months
- ISU Technologies will provide uptime reports upon request

---

## 6. Scheduled Maintenance

### 6.1 Maintenance Window

- **Primary window:** Sundays, 02:00–06:00 SAST
- Maintenance during this window does not count toward Downtime

### 6.2 Notification

| Type | Notice Period |
|------|--------------|
| **Planned maintenance** | 48 hours advance notice via email |
| **Emergency maintenance** | As soon as reasonably possible; no minimum notice |

### 6.3 Maintenance Scope

Scheduled maintenance may include:
- Platform updates and new feature deployments
- Database maintenance and optimisation
- Security patches and updates
- Infrastructure upgrades

ISU Technologies will make reasonable efforts to minimise disruption and perform maintenance outside Business Hours.

---

## 7. Data Management & Security

### 7.1 Data Ownership

All data uploaded to or generated within the ConformEdge platform by AE SHEQ (PTY) LTD remains the **sole property of the Client**. ISU Technologies acts as a data processor, not a data owner.

### 7.2 Backups

| Item | Detail |
|------|--------|
| **Frequency** | Daily automated backups |
| **Retention** | 30 days (7 daily, 4 weekly, 3 monthly) |
| **Storage** | Geographically separate from production |
| **Recovery** | Best-effort restoration within 24 hours of request |

### 7.3 Security Measures

- All data encrypted in transit (TLS 1.2+)
- All data encrypted at rest
- Authentication via Clerk (industry-standard, SOC 2 compliant)
- Role-based access control (RBAC) with 5 permission levels
- Organisation-scoped data isolation (multi-tenant architecture)
- OWASP Top 10 compliance
- File storage on Cloudflare R2 with organisation-scoped access controls

### 7.4 POPIA Compliance

ISU Technologies processes personal information in accordance with the Protection of Personal Information Act (POPIA). The Client remains the responsible party for personal information processed through the platform.

---

## 8. Incident Communication

### 8.1 Outage Notification

In the event of unplanned Downtime, ISU Technologies will:

1. **Acknowledge** — Notify the Client via email within the applicable Response Time
2. **Update** — Provide status updates at regular intervals (minimum every 2 hours for S1, every 4 hours for S2)
3. **Resolve** — Notify the Client when service is restored
4. **Report** — Provide a post-incident summary within 5 business days for S1 and S2 incidents, including root cause and preventive measures

### 8.2 Monitoring

ISU Technologies maintains proactive monitoring of the ConformEdge platform, including:
- Application health and process monitoring (PM2)
- Database connectivity and performance
- SSL certificate validity
- Automated deployment pipeline health checks

---

## 9. Client Responsibilities

The Client agrees to:

1. Maintain a stable internet connection for platform access
2. Use supported web browsers (latest versions of Chrome, Firefox, Safari, or Edge)
3. Report issues promptly with sufficient detail for diagnosis
4. Maintain the confidentiality of user login credentials
5. Not attempt to circumvent platform security measures
6. Ensure users are appropriately trained (training provided during implementation)
7. Designate a primary contact for support communication

**Designated Client Contact:** Sachache Simon Moletsane (simon@aesheq.co.za or as advised)

---

## 10. Exclusions & Force Majeure

### 10.1 Exclusions

This SLA does not apply to:
- Beta features or preview functionality
- Custom integrations developed outside the standard platform
- Issues arising from Client-provided data that does not meet input requirements
- Performance degradation due to excessive usage beyond the Business tier limits

### 10.2 Force Majeure

Neither party shall be liable for failure to meet obligations under this SLA due to events beyond reasonable control, including but not limited to:
- Natural disasters, fire, flood, or extreme weather
- War, civil unrest, or government action
- Widespread internet or telecommunications outages
- Power failures affecting data centres
- Pandemic or epidemic
- Load shedding (Eskom)

---

## 11. Term, Review & Termination

### 11.1 Term

This SLA is effective from the platform go-live date and runs concurrent with the 12-month subscription contract.

### 11.2 Review

This SLA will be reviewed:
- At each quarterly business review
- Upon subscription tier change
- Upon material changes to the platform infrastructure

### 11.3 Amendments

Amendments to this SLA require written agreement from both parties. ISU Technologies may update service levels with 30 days' written notice, provided that updates do not reduce the commitments below those stated herein.

### 11.4 Termination

- This SLA terminates automatically upon termination of the subscription contract
- In the event of sustained failure to meet the Uptime Guarantee (3 or more consecutive months below 98%), the Client may terminate the subscription contract without penalty, subject to 30 days' written notice

---

## 12. Acceptance

By signing below, both parties acknowledge and agree to the terms of this Service Level Agreement.

**ISU Technologies**

| | |
|---|---|
| Name | Nhlanhla Mnyandu |
| Title | Software Developer |
| Signature | _________________________ |
| Date | _________________________ |

**AE SHEQ (PTY) LTD**

| | |
|---|---|
| Name | Sachache Simon Moletsane |
| Title | Director |
| Signature | _________________________ |
| Date | _________________________ |

---

*This Service Level Agreement forms part of the service contract between ISU Technologies and AE SHEQ (PTY) LTD for the ConformEdge SHEQ & Compliance Platform. Document reference: SLA-AESHEQ-2026-001.*

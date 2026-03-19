# Partner Audit & Compliance Engine

**Module:** Partner Compliance Monitor
**Version:** 1.0
**Date:** 2026-03-19
**Author:** Nhlanhla Mnyandu (ISU Technologies)
**Status:** Implemented

---

## 1. Overview

The Partner Audit & Compliance Engine provides ConformEdge platform owners with real-time visibility into partner behavior, usage patterns, and compliance health. It monitors consulting, white-label, and referral partners to detect anomalies, prevent abuse, and ensure fair platform usage.

### Problem Statement

Partners operate semi-autonomously — they onboard their own clients, manage user seats, and resell the platform. Without visibility into their behavior, the platform is exposed to:

- **Seat stuffing** — cramming multiple client teams into one org to avoid per-client fees
- **Ghost seats** — claiming user allocations that are never used (inflated licensing justification)
- **Revenue leakage** — partners charging their clients significantly more than they pay ConformEdge
- **Compliance drift** — partner clients not actively using compliance modules, creating audit risk
- **Churn risk** — unhappy partner clients who signal via low engagement but are invisible to ConformEdge

### Solution

A multi-dimensional scoring and alerting system that:
1. Computes monthly **Partner Health Scores** across 5 dimensions
2. Generates **Behavioral Alerts** for anomalies
3. Provides an **Admin Dashboard** for at-a-glance partner oversight
4. Maintains a **Compliance Audit Trail** of all partner actions

---

## 2. Architecture

### Database Models

```
PartnerAuditScore
├── partnerId (FK → Partner)
├── periodMonth (YYYY-MM string, e.g. "2026-03")
├── Metrics:
│   ├── totalUsers (total seats across all client orgs)
│   ├── activeUsers (users who logged in within the period)
│   ├── activityScore (0-100, % of seats that are active)
│   ├── totalClientOrgs (active client organizations)
│   ├── avgUsersPerClient (client density metric)
│   ├── clientDensityScore (0-100, penalizes >8 users/client)
│   ├── totalRevenueCents (MRR contributed by this partner)
│   ├── revenueGrowthPercent (MoM revenue change)
│   ├── revenueScore (0-100, based on trend + absolute)
│   ├── featureUtilizationScore (0-100, modules used vs available)
│   └── overallScore (0-100, weighted composite)
├── riskLevel (LOW / MEDIUM / HIGH / CRITICAL)
└── @@unique([partnerId, periodMonth])

PartnerAlert
├── partnerId (FK → Partner)
├── alertType (enum — see Section 4)
├── severity (LOW / MEDIUM / HIGH / CRITICAL)
├── title (human-readable summary)
├── description (detailed context)
├── metadata (JSON — supporting data)
├── status (OPEN / ACKNOWLEDGED / RESOLVED / DISMISSED)
├── resolvedAt / resolvedById
└── @@index([partnerId, status, createdAt])
```

### Scoring Algorithm

The **Overall Health Score** is a weighted composite of 5 dimensions:

| Dimension | Weight | Calculation |
|---|---|---|
| **User Activity** | 30% | `(activeUsers / totalUsers) × 100` — penalizes ghost seats |
| **Client Density** | 20% | Penalizes when `avgUsersPerClient > 8` (potential seat stuffing) |
| **Revenue Health** | 25% | Based on MoM growth trend + absolute contribution |
| **Feature Utilization** | 15% | % of gated features actively used by partner clients |
| **Compliance** | 10% | Based on alert count and resolution speed |

### Risk Level Thresholds

| Score Range | Risk Level | Action |
|---|---|---|
| 80-100 | LOW | Healthy — no action needed |
| 60-79 | MEDIUM | Monitor — review at next billing cycle |
| 40-59 | HIGH | Investigate — direct outreach to partner |
| 0-39 | CRITICAL | Escalate — potential suspension review |

---

## 3. Alert Types

### Behavioral Alerts

| Alert Type | Severity | Trigger Condition |
|---|---|---|
| `LOW_USER_ACTIVITY` | MEDIUM | <40% of allocated seats logged in within 30 days |
| `GHOST_SEATS` | HIGH | <20% of seats active — potential billing waste |
| `USER_SPIKE` | MEDIUM | >3 users added in a single day |
| `CLIENT_DENSITY_HIGH` | HIGH | >8 users per client org average (seat stuffing indicator) |
| `INACTIVE_CLIENT` | MEDIUM | Client org with 0 document uploads in 30 days |
| `REVENUE_DECLINE` | HIGH | MoM revenue dropped >15% |
| `OVERDUE_INVOICE` | CRITICAL | Partner invoice >7 days past due |
| `CLIENT_CHURN` | HIGH | Partner disconnected a client org |
| `TERMS_EXPIRY` | MEDIUM | Partner terms acceptance >12 months old |
| `COMPLIANCE_GAP` | HIGH | Client org has 0 assessments completed in 60 days |

### Administrative Alerts

| Alert Type | Severity | Trigger |
|---|---|---|
| `STATUS_CHANGE` | LOW | Partner status changed (approved, suspended, etc.) |
| `BRANDING_CHANGE` | LOW | White-label partner changed branding |
| `MAX_CLIENTS_REACHED` | MEDIUM | Partner at `maxClientOrgs` limit |

---

## 4. Dashboard — Partner Insights

**Route:** `/partner/insights` (admin-only, accessible from Partner Console sidebar)

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Partner Compliance Monitor                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Partners │ │ Open     │ │ Avg      │ │ Total    │       │
│  │    12    │ │ Alerts   │ │ Score    │ │ Revenue  │       │
│  │  active  │ │   7      │ │  74/100  │ │ R124K    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Open Alerts                                        │    │
│  │  ⚠ HIGH: ABC Consulting — Ghost Seats (18% active)│    │
│  │  ⚠ MED:  XYZ Partners — Inactive client (30d)     │    │
│  │  ⚠ CRIT: DEF Corp — Invoice 15 days overdue       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Partner Health Scores (sortable table)              │    │
│  │  Partner    | Score | Users | Activity | Risk       │    │
│  │  ABC Corp   | 82    | 15/18 | 83%      | LOW       │    │
│  │  XYZ Ltd    | 61    | 4/12  | 33%      | MEDIUM    │    │
│  │  DEF PTY    | 38    | 2/10  | 20%      | CRITICAL  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Per-Partner Drill-Down

Clicking a partner row shows:
- 6-month score trend chart (Recharts)
- Client org breakdown (users, activity, last login per user)
- Alert history with resolution timeline
- Revenue trend (MoM)
- Action buttons: Acknowledge alert, Add note, Suspend partner

---

## 5. Data Flow

### Monthly Score Calculation (Scheduled)

```
1. For each ACTIVE partner:
   a. Count total users across all clientOrgIds
   b. Count users with lastLoginAt within period
   c. Calculate activityScore = (active / total) × 100
   d. Calculate avgUsersPerClient = total / clientOrgCount
   e. Calculate clientDensityScore (penalize >8)
   f. Fetch partner MRR from latest invoice
   g. Compare to previous month for revenueGrowthPercent
   h. Query feature usage across client orgs
   i. Compute weighted overallScore
   j. Determine riskLevel from thresholds
   k. Upsert PartnerAuditScore for current period

2. Generate alerts based on score thresholds:
   - activityScore < 40 → LOW_USER_ACTIVITY
   - activityScore < 20 → GHOST_SEATS
   - avgUsersPerClient > 8 → CLIENT_DENSITY_HIGH
   - revenueGrowthPercent < -15 → REVENUE_DECLINE

3. Check invoice statuses:
   - Any OVERDUE invoice → OVERDUE_INVOICE alert
```

### Real-Time Alerts (Event-Driven)

```
On partner.addUser:
  - If >3 users added today → USER_SPIKE alert

On partner.disconnectClient:
  - → CLIENT_CHURN alert

On partner.statusChange:
  - → STATUS_CHANGE alert
```

---

## 6. Integration Points

| System | Integration |
|---|---|
| **Clerk Webhook** | `user.updated` → updates `lastLoginAt` for activity tracking |
| **Partner Actions** | All CRUD actions trigger audit logging + alert checks |
| **Billing Engine** | Invoice generation feeds revenue metrics into scoring |
| **Audit Trail** | Existing `AuditTrailEvent` used for feature utilization queries |
| **Notification System** | CRITICAL alerts trigger admin email notifications |

---

## 7. Security & Access Control

- **Dashboard access:** Platform OWNER only (checked via `getPartnerContext()` + `isPartnerAdmin()`)
- **Alert resolution:** PARTNER_ADMIN or platform OWNER
- **Score data:** Read-only from dashboard — no manual score override
- **PII protection:** Partner client user details (email, names) visible only to OWNER

---

## 8. Files

| Purpose | Path |
|---|---|
| Prisma models | `prisma/schema.prisma` |
| Scoring engine | `src/lib/billing/partner-compliance.ts` |
| Server actions | `src/app/(app)/(partner)/partner/insights/actions.ts` |
| Dashboard page | `src/app/(app)/(partner)/partner/insights/page.tsx` |
| Alert components | `src/app/(app)/(partner)/partner/insights/alerts-panel.tsx` |
| Score table | `src/app/(app)/(partner)/partner/insights/partner-scores-table.tsx` |
| Help panel | `src/app/(app)/(partner)/partner/insights/insights-help-panel.tsx` |
| Documentation | `DOCS/features/PARTNER-AUDIT-ENGINE.md` |

---

## 9. Future Enhancements

- **Lite Seat tracking** — monitor R149/user field worker seats separately from full seats
- **Partner-facing transparency dashboard** — let partners see their own health score (builds trust)
- **Automated suspension** — auto-suspend partners with CRITICAL risk for >30 days
- **Webhook notifications** — push alerts to partner Slack/Teams channels
- **Revenue attribution** — track which partner actions drive the most client expansion revenue
- **Geolocation tracking** — flag unusual login locations across partner client orgs

---

*ConformEdge Partner Audit & Compliance Engine v1.0 — ISU Technologies*

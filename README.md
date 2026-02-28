<p align="center">
  <img src="public/logo.svg" alt="ConformEdge" width="64" height="64" />
</p>

<h1 align="center">ConformEdge</h1>

<p align="center">
  <strong>AI-Powered ISO Compliance Management for Construction &amp; Infrastructure</strong>
</p>

<p align="center">
  <a href="#features">Features</a> &middot;
  <a href="#tech-stack">Tech Stack</a> &middot;
  <a href="#getting-started">Getting Started</a> &middot;
  <a href="#architecture">Architecture</a>
</p>

---

## Overview

ConformEdge is a multi-tenant SaaS platform that helps South African construction, engineering, and infrastructure companies manage ISO compliance. It combines AI-powered document classification with structured compliance workflows — from gap assessments and corrective actions to one-click audit pack generation.

Built by [ISU Technologies](https://isutech.co.za).

## Features

### Document Management
- Upload and organise compliance documents (PDF, Word, Excel, images)
- **AI-powered classification** — automatically maps documents to ISO clauses with accuracy ratings
- Document versioning with full history and audit trail
- Secure cloud storage via Cloudflare R2 with presigned download URLs
- Bulk upload with auto-classification

### ISO Standards
- 7 ISO standards supported: **9001**, **14001**, **45001**, **22301**, **27001**, **37001**, **39001**
- 49 top-level clauses + 187 sub-clauses with detailed descriptions
- Cross-reference browser showing how standards overlap
- Enable/disable standards per organisation

### Gap Analysis & Assessments
- Structured gap assessments mapped to standard clauses
- AI-driven gap detection from document analysis
- Visual gap analysis dashboard with coverage insights

### Corrective & Preventive Actions (CAPAs)
- Full lifecycle tracking: Open → In Progress → Resolved → Closed
- Root cause analysis with 5-Whys methodology
- Action items with assignees and due dates
- Automatic escalation of overdue items (LOW → MEDIUM → HIGH → CRITICAL)
- Link CAPAs to non-compliant checklist findings

### Compliance Checklists
- Auto-generated from ISO standard clauses
- Evidence attachment per checklist item
- Assign items to team members
- Save and reuse custom templates
- Completion percentage tracking

### Subcontractor Management
- Certification tracking with expiry alerts (30-day advance warning)
- BEE level and safety rating monitoring
- Compliance scoring (certifications 40% + safety 35% + BEE 25%)
- Tier system (Platinum → Bronze)

### Audit Packs
- One-click PDF generation with cover page, table of contents, executive summary, and sign-off section
- Email delivery of audit packs to stakeholders

### Reports & Analytics
- Dashboard with 6 summary cards, 3 highlights, and 7+ interactive charts
- Date range filtering (7 days, 30 days, 90 days, YTD, custom)
- Compliance trend analysis across 12 months
- CSV and PDF export

### Notifications
- In-app notification centre with bell icon
- Email notifications via Resend
- Per-user notification preferences
- Triggers: document expiry, CAPA due dates, certificate expiry, assessment schedules

### Security & Access Control
- Multi-tenant with Clerk organisations
- 5 RBAC roles: Owner, Admin, Manager, Auditor, Viewer
- Role-based UI filtering and server-side enforcement
- Immutable audit trail for all actions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) + TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Auth | [Clerk](https://clerk.com) (multi-tenant organisations + RBAC) |
| Database | PostgreSQL + [Prisma ORM](https://prisma.io) |
| AI | [Anthropic Claude API](https://anthropic.com) |
| OCR | Google Cloud Vision |
| File Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible) |
| PDF | [@react-pdf/renderer](https://react-pdf.org) |
| Charts | [Recharts](https://recharts.org) |
| Email | [Resend](https://resend.com) |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- [Clerk](https://clerk.com) account
- [Anthropic API key](https://console.anthropic.com)

### 1. Clone and install

```bash
git clone https://github.com/gedeza/conformedge.git
cd conformedge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your API keys — see `.env.example` for all required variables.

### 3. Start the database

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Run migrations and seed data

```bash
npx prisma migrate dev
npx prisma db seed
```

This seeds 7 ISO standards with 236 clauses and sub-clauses.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Sign-in / sign-up pages
│   ├── (dashboard)/       # All protected feature pages
│   └── api/               # API routes (upload, download, classify, etc.)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── dashboard/         # Dashboard-specific components
│   ├── landing/           # Landing page sections
│   └── shared/            # Reusable components (PageHeader, DataTable, etc.)
├── lib/                   # Utilities, auth, permissions, AI, R2
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # 20 database models
├── seed.ts                # Seed script
└── seed-data/             # ISO standards data files
```

### Key patterns
- **Server Components by default** — `"use client"` only when needed
- **Server Actions** for all data mutations
- **Auth context** via `getAuthContext()` with React `cache()` deduplication
- **Audit trail** via fire-and-forget `logAuditEvent()`
- **AI classification** via Claude Haiku with OCR fallback for scanned documents

## Useful Commands

```bash
npm run dev                # Start dev server (port 3000)
npm run build              # Production build
npm run lint               # ESLint
npx tsc --noEmit           # Type check
npx prisma studio          # Database GUI
npx prisma migrate dev     # Run pending migrations
npx prisma db seed         # Seed ISO standards data
```

## Deployment

Production runs on Hetzner VPS with PM2, auto-deployed via GitHub Actions on push to `main`.

## License

Proprietary — ISU Technologies (Pty) Ltd

# ConformEdge — Development Instructions

## Project Overview
AI-powered ISO Compliance Management SaaS platform by ISU Technologies.
Multi-tenant platform serving SA construction/infrastructure companies.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (new-york style)
- **Auth:** Clerk (multi-tenant organizations + RBAC)
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Anthropic Claude API
- **OCR:** AWS Textract
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts
- **Email:** Resend

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── dashboard/         # Dashboard-specific components
│   ├── landing/           # Landing page components
│   └── shared/            # Reusable components
├── lib/                   # Utilities (db.ts, utils.ts, constants.ts)
├── types/                 # TypeScript type definitions
└── generated/prisma/      # Prisma generated client
prisma/
├── schema.prisma          # Database schema (20 models)
└── seed.ts                # ISO standards seed data
docker/
├── docker-compose.yml     # PostgreSQL + PgAdmin
└── Dockerfile             # Production build
```

## Key Commands
```bash
# Development
npm run dev                        # Start dev server (port 3000)
npm run build                      # Production build
npm run lint                       # ESLint

# Database
docker compose -f docker/docker-compose.yml up -d  # Start PostgreSQL
npx prisma migrate dev             # Run migrations
npx prisma db seed                 # Seed ISO standards
npx prisma studio                  # Database GUI
npx prisma generate                # Regenerate client after schema changes

# Type checking
npx tsc --noEmit                   # Check for type errors
```

## Conventions
- **Imports:** Use `@/` path alias (maps to `src/`)
- **Components:** Server Components by default; add `"use client"` only when needed
- **Database:** Use `db` from `@/lib/db` (Prisma singleton)
- **Styling:** Use `cn()` from `@/lib/utils` for conditional classes
- **Forms:** react-hook-form + zod for validation
- **Icons:** lucide-react

## Auth (Clerk)
- Protected routes: `/dashboard(.*)` and all feature routes
- Middleware: `src/middleware.ts`
- Webhook: `/api/webhooks/clerk` syncs users/orgs to database
- Use `auth()` from `@clerk/nextjs/server` in Server Components
- Use `useUser()`, `useOrganization()` in Client Components

## Database
- 20 models defined in `prisma/schema.prisma`
- All models use UUID primary keys
- Snake_case table/column names via `@map`/`@@map`
- Multi-tenant: most entities belong to an Organization

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
- `CLERK_WEBHOOK_SECRET` — For user/org sync
- `ANTHROPIC_API_KEY` — Claude AI
- `RESEND_API_KEY` — Email notifications

# ConformEdge

AI-powered ISO Compliance Management SaaS platform by ISU Technologies.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Clerk account (for authentication)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Clerk keys and other API keys
```

### 3. Start PostgreSQL
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 4. Run database migrations & seed
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk (multi-tenant organizations) |
| Database | PostgreSQL + Prisma ORM |
| AI | Anthropic Claude API |
| OCR | AWS Textract |
| PDF | @react-pdf/renderer |
| Charts | Recharts |
| Email | Resend |

## Features (Planned)

- Smart document classification (AI-powered)
- Gap assessments mapped to ISO clauses
- CAPA tracking and management
- Compliance checklists with evidence
- Subcontractor certification monitoring
- One-click audit pack generation
- Multi-standard support (ISO 9001, 14001, 45001, 22301, 27001, 37001, 39001)

## Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npx prisma studio        # Database GUI (port 5555)
npx prisma migrate dev   # Run pending migrations
npx tsc --noEmit         # Type check
```

## License

Proprietary - ISU Technologies (Pty) Ltd

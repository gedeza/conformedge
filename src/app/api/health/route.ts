import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CRON_SECRET",
]

export async function GET() {
  const checks: Record<string, string> = {}

  // DB connectivity
  try {
    await db.$queryRaw`SELECT 1`
    checks.database = "ok"
  } catch {
    checks.database = "error"
  }

  // Required env vars
  const missingEnv = REQUIRED_ENV_VARS.filter((v) => !process.env[v])
  checks.env = missingEnv.length === 0 ? "ok" : `missing_count: ${missingEnv.length}`

  const healthy = checks.database === "ok" && checks.env === "ok"

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  )
}

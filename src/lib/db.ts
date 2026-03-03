import { Pool } from "pg"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,                // stay within shared VPS PostgreSQL budget
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 10_000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Cache globally in ALL environments to prevent multiple pools
// (standard pattern skips production, but adapter-pg pool leaks are costly)
globalForPrisma.prisma = db

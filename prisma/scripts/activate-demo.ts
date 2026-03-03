/**
 * Activate demo account — upgrades a specific org to BUSINESS/ACTIVE.
 *
 * Usage:
 *   npx tsx prisma/scripts/activate-demo.ts
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const TARGET_ORG_NAME = "iSu Technologies"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const org = await prisma.organization.findFirst({
    where: { name: TARGET_ORG_NAME },
    select: { id: true, name: true },
  })

  if (!org) {
    console.error(`Organization "${TARGET_ORG_NAME}" not found.`)
    process.exit(1)
  }

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setFullYear(periodEnd.getFullYear() + 1) // 1 year period

  await prisma.subscription.update({
    where: { organizationId: org.id },
    data: {
      plan: "BUSINESS",
      status: "ACTIVE",
      billingCycle: "ANNUAL",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
    },
  })

  // Top up AI credits for demo
  await prisma.creditBalance.upsert({
    where: { organizationId: org.id },
    update: { balance: 500 },
    create: { organizationId: org.id, balance: 500 },
  })

  console.log(`✅ ${org.name} upgraded to BUSINESS/ACTIVE`)
  console.log(`   Plan: BUSINESS (Annual)`)
  console.log(`   Status: ACTIVE`)
  console.log(`   Period: ${now.toLocaleDateString("en-ZA")} → ${periodEnd.toLocaleDateString("en-ZA")}`)
  console.log(`   AI Credits: 500`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

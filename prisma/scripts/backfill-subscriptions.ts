/**
 * Backfill script: Create Subscription + CreditBalance + UsageRecord for all existing orgs.
 * Run once: npx tsx prisma/scripts/backfill-subscriptions.ts
 *
 * Safe to re-run — uses upserts so it won't duplicate records.
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const TRIAL_DURATION_DAYS = 14
const ONBOARDING_CREDITS = 100

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting billing backfill...")

  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, createdAt: true },
  })

  console.log(`Found ${orgs.length} organization(s) to process.`)

  let created = 0
  let skipped = 0

  for (const org of orgs) {
    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: { organizationId: org.id },
    })

    if (existing) {
      console.log(`  [SKIP] ${org.name} — already has subscription (${existing.status})`)
      skipped++
      continue
    }

    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)

    const periodStart = now
    const periodEnd = trialEnd

    // Count current resources for the usage snapshot
    const [documentsCount, usersCount, standardsCount] = await Promise.all([
      prisma.document.count({ where: { organizationId: org.id } }),
      prisma.organizationUser.count({ where: { organizationId: org.id, isActive: true } }),
      prisma.standard.count({ where: { isActive: true } }),
    ])

    await prisma.$transaction(async (tx) => {
      // 1. Create subscription
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          plan: "STARTER",
          status: "TRIALING",
          billingCycle: "MONTHLY",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialEndsAt: trialEnd,
        },
      })

      // 2. Create credit balance with onboarding bonus
      const creditBalance = await tx.creditBalance.upsert({
        where: { organizationId: org.id },
        update: {},
        create: {
          organizationId: org.id,
          balance: ONBOARDING_CREDITS,
          lifetimeEarned: ONBOARDING_CREDITS,
        },
      })

      // 3. Log onboarding credit grant
      await tx.creditTransaction.create({
        data: {
          type: "ADJUSTMENT",
          amount: ONBOARDING_CREDITS,
          balanceAfter: creditBalance.balance,
          description: "Onboarding bonus — expires with trial",
          organizationId: org.id,
        },
      })

      // 4. Create usage record with current resource snapshot
      await tx.usageRecord.upsert({
        where: {
          organizationId_periodStart: {
            organizationId: org.id,
            periodStart,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          periodStart,
          periodEnd,
          aiClassificationsUsed: 0,
          documentsCount,
          usersCount,
          standardsCount,
        },
      })
    })

    console.log(`  [OK] ${org.name} — subscription created (TRIALING, ${TRIAL_DURATION_DAYS}d trial, ${ONBOARDING_CREDITS} credits, ${documentsCount} docs, ${usersCount} users, ${standardsCount} standards)`)
    created++
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total: ${orgs.length}`)
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

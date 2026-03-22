/**
 * Clean up stale test/demo records from production database.
 *
 * Removes orphaned users and organizations created during development/testing.
 *
 * Usage:
 *   npx tsx prisma/scripts/cleanup-stale-records.ts
 *
 * DRY RUN by default — pass --execute to actually delete.
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const EXECUTE = process.argv.includes("--execute")

// ── Records to clean up ─────────────────────────────────────────────

const STALE_USER_EMAILS = [
  "nnyandu@gmail.com",
  "sibz335@gmail.com",
]

const STALE_ORG_NAMES = [
  "My Organization",
  "----",
]

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🧹 Production DB Cleanup ${EXECUTE ? "(EXECUTING)" : "(DRY RUN — pass --execute to delete)"}\n`)

  // 1. Find stale users
  const staleUsers = await prisma.user.findMany({
    where: { email: { in: STALE_USER_EMAILS } },
    select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
  })

  console.log(`📋 Stale users found: ${staleUsers.length}`)
  for (const u of staleUsers) {
    console.log(`   - ${u.email} (${u.firstName} ${u.lastName}, created ${u.createdAt.toISOString().split("T")[0]})`)
  }

  // 2. Find stale orgs
  const staleOrgs = await prisma.organization.findMany({
    where: { name: { in: STALE_ORG_NAMES } },
    select: { id: true, name: true, slug: true, createdAt: true, _count: { select: { members: true } } },
  })

  console.log(`\n📋 Stale organizations found: ${staleOrgs.length}`)
  for (const o of staleOrgs) {
    console.log(`   - "${o.name}" (slug: ${o.slug}, ${o._count.members} members, created ${o.createdAt.toISOString().split("T")[0]})`)
  }

  // 3. Find orphaned org memberships (users in stale orgs)
  const orphanedMemberships = await prisma.organizationUser.findMany({
    where: {
      OR: [
        { userId: { in: staleUsers.map((u) => u.id) } },
        { organizationId: { in: staleOrgs.map((o) => o.id) } },
      ],
    },
    select: { id: true, userId: true, organizationId: true },
  })

  console.log(`\n📋 Orphaned memberships: ${orphanedMemberships.length}`)

  if (!EXECUTE) {
    console.log("\n⚠️  DRY RUN — no changes made. Run with --execute to delete these records.\n")
    return
  }

  // 4. Execute deletions (order matters for FK constraints)
  console.log("\n🗑️  Executing deletions...")

  // Delete memberships first
  if (orphanedMemberships.length > 0) {
    const result = await prisma.organizationUser.deleteMany({
      where: { id: { in: orphanedMemberships.map((m) => m.id) } },
    })
    console.log(`   ✅ Deleted ${result.count} orphaned memberships`)
  }

  // Delete stale orgs (cascade will clean up related records)
  for (const org of staleOrgs) {
    await prisma.organization.delete({ where: { id: org.id } })
    console.log(`   ✅ Deleted org "${org.name}" (${org.id})`)
  }

  // Delete stale users
  for (const user of staleUsers) {
    try {
      await prisma.user.delete({ where: { id: user.id } })
      console.log(`   ✅ Deleted user ${user.email} (${user.id})`)
    } catch (e) {
      console.log(`   ⚠️  Could not delete user ${user.email} — may have remaining references`)
    }
  }

  console.log("\n✅ Cleanup complete.\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

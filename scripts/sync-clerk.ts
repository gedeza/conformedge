/**
 * Sync Clerk users, organizations, and memberships to the local database.
 * Run with: npx tsx scripts/sync-clerk.ts
 */
import "dotenv/config"
import { createClerkClient } from "@clerk/backend"
import { PrismaClient } from "../src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("Syncing Clerk data to local database...\n")

  // 1. Sync users
  const usersResponse = await clerk.users.getUserList({ limit: 100 })
  const users = usersResponse.data
  console.log(`Found ${users.length} users in Clerk`)

  for (const user of users) {
    const email = user.emailAddresses[0]?.emailAddress
    if (!email) continue

    await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {
        email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl,
        lastLoginAt: new Date(),
      },
      create: {
        clerkUserId: user.id,
        email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl,
      },
    })
    console.log(`  User: ${email}`)
  }

  // 2. Sync organizations
  const orgsResponse = await clerk.organizations.getOrganizationList({ limit: 100 })
  const orgs = orgsResponse.data
  console.log(`\nFound ${orgs.length} organizations in Clerk`)

  for (const org of orgs) {
    await db.organization.upsert({
      where: { clerkOrgId: org.id },
      update: { name: org.name, slug: org.slug },
      create: {
        clerkOrgId: org.id,
        name: org.name,
        slug: org.slug,
      },
    })
    console.log(`  Org: ${org.name} (${org.slug})`)

    // 3. Sync memberships for this org
    const membersResponse = await clerk.organizations.getOrganizationMembershipList({
      organizationId: org.id,
      limit: 100,
    })
    const members = membersResponse.data

    for (const member of members) {
      const clerkUserId = member.publicUserData?.userId
      if (!clerkUserId) continue

      const dbUser = await db.user.findUnique({
        where: { clerkUserId },
      })
      const dbOrg = await db.organization.findUnique({
        where: { clerkOrgId: org.id },
      })

      if (!dbUser || !dbOrg) continue

      const roleMap: Record<string, string> = {
        "org:admin": "OWNER",
        "org:member": "VIEWER",
      }
      const role = (roleMap[member.role] || "VIEWER") as "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER"

      await db.organizationUser.upsert({
        where: {
          userId_organizationId: {
            userId: dbUser.id,
            organizationId: dbOrg.id,
          },
        },
        update: { role },
        create: {
          userId: dbUser.id,
          organizationId: dbOrg.id,
          role,
        },
      })
      console.log(`    Member: ${dbUser.email} → ${role}`)
    }
  }

  console.log("\nSync complete!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())

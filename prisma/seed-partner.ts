import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  // Find the first user (you)
  const user = await db.user.findFirst()
  if (!user) {
    console.error("No user found in database")
    return
  }
  console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`)

  // Find all orgs
  const orgs = await db.organization.findMany({ select: { id: true, name: true } })
  console.log(`Found ${orgs.length} organization(s):`)
  orgs.forEach((o) => console.log(`  - ${o.name} (${o.id})`))

  // Check if partner already exists
  const existing = await db.partner.findFirst({ where: { slug: "isu-tech-consulting" } })
  if (existing) {
    console.log(`\nPartner already exists: ${existing.name} (${existing.id})`)
    console.log("Skipping creation.")
    return
  }

  // Create a test partner
  const partner = await db.partner.create({
    data: {
      name: "ISU Tech Consulting",
      slug: "isu-tech-consulting",
      tier: "CONSULTING",
      status: "ACTIVE",
      contactEmail: user.email,
      contactPhone: "+27 31 000 0000",
      website: "https://isutech.co.za",
      registrationNumber: "2020/123456/07",
      description: "ISO compliance consulting for SA construction and infrastructure companies",
      basePlatformFeeCents: 899900, // R8,999
      defaultSmallFeeCents: 129900,
      defaultMediumFeeCents: 189900,
      defaultLargeFeeCents: 249900,
      commissionPercent: 15,
      approvedAt: new Date(),
    },
  })
  console.log(`\nCreated partner: ${partner.name} (${partner.id})`)

  // Link user as PARTNER_ADMIN
  await db.partnerUser.create({
    data: {
      partnerId: partner.id,
      userId: user.id,
      role: "PARTNER_ADMIN",
    },
  })
  console.log(`Linked ${user.email} as PARTNER_ADMIN`)

  // Link existing orgs as client organizations
  for (const org of orgs) {
    await db.partnerOrganization.create({
      data: {
        partnerId: partner.id,
        organizationId: org.id,
        clientSize: "MEDIUM",
      },
    })
    console.log(`Added client org: ${org.name}`)
  }

  console.log("\nDone! Visit http://localhost:3000/partner to test the Partner Console.")
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e)
    db.$disconnect()
    process.exit(1)
  })

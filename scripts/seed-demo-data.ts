import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  // ── Find the org ──
  const orgs = await db.organization.findMany({
    select: { id: true, name: true, slug: true },
  })
  console.log("Organizations found:", orgs.map((o) => `${o.name} (${o.id})`))

  if (orgs.length === 0) {
    console.log("No organizations found. Please create one first via the app.")
    return
  }

  const org = orgs[0]
  console.log(`\nUsing org: ${org.name} (${org.id})`)

  // ── 1. Upgrade to Enterprise ──
  const sub = await db.subscription.findUnique({ where: { organizationId: org.id } })
  if (sub) {
    await db.subscription.update({
      where: { id: sub.id },
      data: { plan: "ENTERPRISE", status: "ACTIVE" },
    })
    console.log("✅ Subscription upgraded to ENTERPRISE (ACTIVE)")
  } else {
    console.log("⚠️  No subscription found — skipping upgrade")
  }

  // ── 2. Create Sites ──
  const existingSites = await db.site.count({ where: { organizationId: org.id } })
  if (existingSites > 0) {
    console.log(`⏭️  ${existingSites} sites already exist — skipping site creation`)
  } else {
    const hq = await db.site.create({
      data: {
        name: "Johannesburg HQ",
        code: "JHB-HQ",
        siteType: "HEADQUARTERS",
        address: "123 Main Road, Sandton, Johannesburg",
        organizationId: org.id,
      },
    })

    const durban = await db.site.create({
      data: {
        name: "Durban Hub",
        code: "DBN-HUB",
        siteType: "DIVISION",
        address: "45 Point Road, Durban",
        organizationId: org.id,
        parentSiteId: hq.id,
      },
    })

    const capeTown = await db.site.create({
      data: {
        name: "Cape Town Depot",
        code: "CPT-DEP",
        siteType: "DEPOT",
        address: "10 Harbour Road, Cape Town",
        organizationId: org.id,
        parentSiteId: hq.id,
      },
    })

    const richardsBay = await db.site.create({
      data: {
        name: "Richards Bay Terminal",
        code: "RBY-TRM",
        siteType: "SITE",
        address: "Port of Richards Bay, KZN",
        organizationId: org.id,
        parentSiteId: durban.id,
      },
    })

    console.log(`✅ Created 4 sites: ${hq.code}, ${durban.code}, ${capeTown.code}, ${richardsBay.code}`)
  }

  // Get sites for linking
  const sites = await db.site.findMany({
    where: { organizationId: org.id },
    select: { id: true, code: true },
  })

  // Get first user for assignments
  const firstMember = await db.organizationUser.findFirst({
    where: { organizationId: org.id, isActive: true },
    select: { userId: true },
  })

  if (!firstMember) {
    console.log("⚠️  No org members found — skipping user-linked data")
    await db.$disconnect()
    return
  }

  const userId = firstMember.userId

  // ── 3. Create Obligations ──
  const existingObligations = await db.complianceObligation.count({ where: { organizationId: org.id } })
  if (existingObligations > 0) {
    console.log(`⏭️  ${existingObligations} obligations already exist — skipping`)
  } else {
    const now = new Date()
    const futureDate = (months: number) => new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000)
    const pastDate = (months: number) => new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000)

    await db.complianceObligation.createMany({
      data: [
        {
          title: "COIDA Letter of Good Standing — Annual",
          obligationType: "COIDA_LOG",
          status: "ACTIVE",
          effectiveDate: pastDate(6),
          expiryDate: futureDate(6),
          renewalLeadDays: 30,
          organizationId: org.id,
          siteId: sites[0]?.id ?? null,
          responsibleUserId: userId,
        },
        {
          title: "Tax Clearance Certificate",
          obligationType: "TAX_CLEARANCE",
          status: "ACTIVE",
          effectiveDate: pastDate(3),
          expiryDate: futureDate(9),
          renewalLeadDays: 60,
          organizationId: org.id,
          responsibleUserId: userId,
        },
        {
          title: "CIDB Grading Certificate — Grade 7 CE",
          obligationType: "CIDB_GRADING",
          status: "ACTIVE",
          effectiveDate: pastDate(2),
          expiryDate: futureDate(10),
          renewalLeadDays: 90,
          organizationId: org.id,
          responsibleUserId: userId,
        },
        {
          title: "Section 37(2) Agreement — Main Contractor",
          obligationType: "SECTION_37_2",
          status: "ACTIVE",
          effectiveDate: pastDate(12),
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "DBN-HUB")?.id ?? sites[0]?.id ?? null,
          responsibleUserId: userId,
          notes: "Agreement with Zutari Engineering for Durban waterfront project",
        },
        {
          title: "Water Use Licence — Durban Operations",
          obligationType: "WATER_USE_LICENCE",
          status: "ACTIVE",
          effectiveDate: pastDate(6),
          expiryDate: futureDate(2),
          renewalLeadDays: 60,
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "DBN-HUB")?.id ?? null,
          responsibleUserId: userId,
          notes: "NWA Section 21(a) water abstraction from uMngeni River",
        },
        {
          title: "Atmospheric Emission Licence — Richards Bay",
          obligationType: "AEL",
          status: "ACTIVE",
          effectiveDate: pastDate(10),
          expiryDate: futureDate(14),
          renewalLeadDays: 90,
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "RBY-TRM")?.id ?? null,
          responsibleUserId: userId,
        },
        {
          title: "B-BBEE Certificate — Level 2",
          obligationType: "BBBEE_CERTIFICATE",
          status: "ACTIVE",
          effectiveDate: pastDate(4),
          expiryDate: futureDate(8),
          renewalLeadDays: 60,
          organizationId: org.id,
          responsibleUserId: userId,
        },
        {
          title: "Safety Officer Appointment — JHB",
          obligationType: "COMPETENT_PERSON",
          status: "ACTIVE",
          effectiveDate: pastDate(12),
          organizationId: org.id,
          siteId: sites[0]?.id ?? null,
          responsibleUserId: userId,
          notes: "OHS Act Section 16(2) appointment",
        },
      ],
    })
    console.log("✅ Created 8 compliance obligations")
  }

  // ── 4. Create Training Records ──
  const existingTraining = await db.trainingRecord.count({ where: { organizationId: org.id } })
  if (existingTraining > 0) {
    console.log(`⏭️  ${existingTraining} training records already exist — skipping`)
  } else {
    const now = new Date()
    const futureDate = (months: number) => new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000)
    const pastDate = (months: number) => new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000)

    await db.trainingRecord.createMany({
      data: [
        {
          title: "Site Induction — JHB HQ",
          category: "INDUCTION",
          status: "COMPLETED",
          trainingDate: pastDate(6),
          duration: "4 hours",
          location: "Johannesburg HQ",
          trainerName: "Sipho Ndlovu",
          trainingProvider: "In-House",
          assessmentResult: "Competent",
          traineeId: userId,
          organizationId: org.id,
          siteId: sites[0]?.id ?? null,
          recordedById: userId,
        },
        {
          title: "First Aid Level 1",
          category: "FIRST_AID",
          status: "COMPLETED",
          trainingDate: pastDate(12),
          duration: "2 days",
          trainerName: "Dr. N. Govender",
          trainingProvider: "SafeTraining SA",
          providerAccreditationNo: "HWSETA-2023-4521",
          certificateNumber: "FA-2025-08821",
          issuedDate: pastDate(12),
          expiryDate: futureDate(24),
          assessmentResult: "Competent",
          saqaUnitStandard: "US 119567",
          nqfLevel: 3,
          traineeId: userId,
          organizationId: org.id,
          recordedById: userId,
        },
        {
          title: "Working at Heights",
          category: "WORKING_AT_HEIGHTS",
          status: "COMPLETED",
          trainingDate: pastDate(8),
          duration: "1 day",
          trainerName: "J. van der Merwe",
          trainingProvider: "Heights Safety Institute",
          providerAccreditationNo: "CETA-HSI-0091",
          certificateNumber: "WAH-2025-33102",
          issuedDate: pastDate(8),
          expiryDate: futureDate(16),
          assessmentResult: "Competent",
          saqaUnitStandard: "US 229998",
          nqfLevel: 2,
          traineeId: userId,
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "DBN-HUB")?.id ?? null,
          recordedById: userId,
        },
        {
          title: "Fire Fighting — Basic",
          category: "FIRE_FIGHTING",
          status: "COMPLETED",
          trainingDate: pastDate(18),
          duration: "1 day",
          trainerName: "T. Mokoena",
          trainingProvider: "Fire & Rescue Training",
          certificateNumber: "FF-2024-5501",
          issuedDate: pastDate(18),
          expiryDate: futureDate(6),
          assessmentResult: "Competent",
          traineeId: userId,
          organizationId: org.id,
          recordedById: userId,
        },
        {
          title: "Confined Space Entry",
          category: "CONFINED_SPACE",
          status: "EXPIRED",
          trainingDate: pastDate(30),
          duration: "2 days",
          trainerName: "K. Naidoo",
          trainingProvider: "Industrial Safety Solutions",
          certificateNumber: "CSE-2023-7890",
          issuedDate: pastDate(30),
          expiryDate: pastDate(6),
          assessmentResult: "Competent",
          traineeId: userId,
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "RBY-TRM")?.id ?? null,
          recordedById: userId,
        },
        {
          title: "Toolbox Talk — Excavation Safety",
          category: "TOOLBOX_TALK",
          status: "COMPLETED",
          trainingDate: pastDate(1),
          duration: "30 minutes",
          location: "Durban Hub — Site Office",
          trainerName: "M. Dlamini",
          trainingProvider: "In-House",
          traineeId: userId,
          organizationId: org.id,
          siteId: sites.find((s) => s.code === "DBN-HUB")?.id ?? null,
          recordedById: userId,
        },
      ],
    })
    console.log("✅ Created 6 training records (including 1 expired)")
  }

  console.log("\n🎉 Demo data seeding complete!")
  console.log("\nYou can now test:")
  console.log("  /she-files        — SHE file generation per project")
  console.log("  /obligations      — Compliance obligations (Enterprise)")
  console.log("  /training         — Training records + competency matrix")
  console.log("  /training/matrix  — Employee competency grid")
  console.log("  /corporate        — Cross-site corporate dashboard")
  console.log("  /settings         — Site management (Multi-Site Hierarchy)")
  console.log("  /vendors/[id]     — B-BBEE tab on vendor detail")

  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})

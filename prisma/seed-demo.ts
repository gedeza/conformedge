import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🔍 Finding active organization and owner...")

  const orgUser = await prisma.organizationUser.findFirst({
    where: { role: "OWNER", isActive: true },
    include: {
      organization: true,
      user: true,
    },
    orderBy: { createdAt: "asc" },
  })
  if (!orgUser) throw new Error("No active organization with an OWNER found")

  const org = orgUser.organization
  const owner = orgUser.user

  console.log(`  Org: ${org.name} (${org.id})`)
  console.log(`  Owner: ${owner.firstName} ${owner.lastName} (${owner.id})`)

  // Find ISO 45001 and ISO 9001 standards
  const iso45001 = await prisma.standard.findFirst({ where: { code: "ISO45001" } })
  if (!iso45001) throw new Error("ISO 45001 standard not found — run main seed first")

  const iso9001 = await prisma.standard.findFirst({ where: { code: "ISO9001" } })
  if (!iso9001) throw new Error("ISO 9001 standard not found — run main seed first")

  console.log(`  ISO 45001: ${iso45001.id}`)
  console.log(`  ISO 9001: ${iso9001.id}`)

  const now = new Date()

  // ─────────────────────────────────────────────
  // Incidents
  // ─────────────────────────────────────────────
  console.log("\n📋 Seeding incidents...")

  // Incident 1: Scaffolding collapse
  const incident1Title = "Scaffolding collapse on Site B"
  const existingIncident1 = await prisma.incident.findFirst({
    where: { title: incident1Title, organizationId: org.id },
  })
  if (!existingIncident1) {
    await prisma.incident.create({
      data: {
        title: incident1Title,
        incidentType: "PROPERTY_DAMAGE",
        severity: "HIGH",
        status: "INVESTIGATING",
        incidentDate: now,
        location: "North face, Building B - Level 3",
        description:
          "A section of scaffolding on the north face of Building B collapsed during high winds. Two workers were in the area but evacuated safely.",
        immediateAction:
          "Area cordoned off, all workers evacuated, site manager notified",
        reportedById: owner.id,
        organizationId: org.id,
      },
    })
    console.log("  ✅ Created: " + incident1Title)
  } else {
    console.log("  ⏭️  Already exists: " + incident1Title)
  }

  // Incident 2: Near-miss unsecured load
  const incident2Title = "Near-miss: unsecured load on crane"
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const existingIncident2 = await prisma.incident.findFirst({
    where: { title: incident2Title, organizationId: org.id },
  })
  if (!existingIncident2) {
    await prisma.incident.create({
      data: {
        title: incident2Title,
        incidentType: "NEAR_MISS",
        severity: "MEDIUM",
        status: "CORRECTIVE_ACTION",
        incidentDate: fiveDaysAgo,
        location: "Main site - Loading bay",
        description:
          "An unsecured load shifted during crane operation. No injuries, but the load came within 2 metres of a worker below.",
        immediateAction:
          "Crane operations suspended pending inspection. All rigging equipment checked.",
        rootCause:
          "Rigging procedure not followed. Operator bypassed pre-lift checklist.",
        reportedById: owner.id,
        organizationId: org.id,
      },
    })
    console.log("  ✅ Created: " + incident2Title)
  } else {
    console.log("  ⏭️  Already exists: " + incident2Title)
  }

  // ─────────────────────────────────────────────
  // Objectives
  // ─────────────────────────────────────────────
  console.log("\n🎯 Seeding objectives...")

  const sixMonthsFromNow = new Date(now)
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

  const fourMonthsFromNow = new Date(now)
  fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4)

  const twoMonthsAgo = new Date(now)
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const oneMonthAgo = new Date(now)
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  // Objective 1: Reduce incident rate
  const obj1Title = "Reduce site incident rate by 30%"
  const existingObj1 = await prisma.objective.findFirst({
    where: { title: obj1Title, organizationId: org.id },
  })
  if (!existingObj1) {
    const obj1 = await prisma.objective.create({
      data: {
        title: obj1Title,
        description:
          "Target a 30% reduction in reportable incidents across all construction sites by end of Q4 2026.",
        targetValue: 30,
        currentValue: 8,
        unit: "%",
        measurementFrequency: "MONTHLY",
        status: "ACTIVE",
        standardId: iso45001.id,
        ownerId: owner.id,
        organizationId: org.id,
        dueDate: sixMonthsFromNow,
      },
    })
    console.log("  ✅ Created: " + obj1Title)

    // Measurements for Objective 1
    await prisma.objectiveMeasurement.createMany({
      data: [
        {
          value: 3,
          notes: "January baseline measurement",
          objectiveId: obj1.id,
          recordedById: owner.id,
          measuredAt: twoMonthsAgo,
        },
        {
          value: 5,
          notes: "February - safety training rollout started",
          objectiveId: obj1.id,
          recordedById: owner.id,
          measuredAt: oneMonthAgo,
        },
        {
          value: 8,
          notes: "March - 8% reduction achieved from safety training",
          objectiveId: obj1.id,
          recordedById: owner.id,
          measuredAt: now,
        },
      ],
    })
    console.log("    ✅ Created 3 measurements for " + obj1Title)
  } else {
    console.log("  ⏭️  Already exists: " + obj1Title)
  }

  // Objective 2: Checklist completion rate
  const obj2Title = "Achieve 95% checklist completion rate"
  const existingObj2 = await prisma.objective.findFirst({
    where: { title: obj2Title, organizationId: org.id },
  })
  if (!existingObj2) {
    const obj2 = await prisma.objective.create({
      data: {
        title: obj2Title,
        description:
          "Ensure all scheduled compliance checklists are completed on time with a target of 95% completion.",
        targetValue: 95,
        currentValue: 72,
        unit: "%",
        measurementFrequency: "MONTHLY",
        status: "ACTIVE",
        standardId: iso9001.id,
        ownerId: owner.id,
        organizationId: org.id,
        dueDate: fourMonthsFromNow,
      },
    })
    console.log("  ✅ Created: " + obj2Title)

    // Measurements for Objective 2
    await prisma.objectiveMeasurement.createMany({
      data: [
        {
          value: 60,
          notes: "February - initial tracking",
          objectiveId: obj2.id,
          recordedById: owner.id,
          measuredAt: oneMonthAgo,
        },
        {
          value: 72,
          notes: "March - improved with recurring checklists feature",
          objectiveId: obj2.id,
          recordedById: owner.id,
          measuredAt: now,
        },
      ],
    })
    console.log("    ✅ Created 2 measurements for " + obj2Title)
  } else {
    console.log("  ⏭️  Already exists: " + obj2Title)
  }

  // ─────────────────────────────────────────────
  // Management Reviews
  // ─────────────────────────────────────────────
  console.log("\n📋 Seeding management reviews...")

  const reviewTitle = "Q1 2026 Management Review"
  const existingReview = await prisma.managementReview.findFirst({
    where: { title: reviewTitle, organizationId: org.id },
  })
  if (!existingReview) {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const threeMonthsFromNow = new Date(now)
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

    const review = await prisma.managementReview.create({
      data: {
        title: reviewTitle,
        reviewDate: threeDaysAgo,
        location: "Boardroom A, Head Office",
        status: "IN_PROGRESS",
        meetingMinutes:
          "Meeting opened at 09:00. Reviewed Q4 2025 audit findings and current CAPA status. " +
          "Discussed incident trends and safety training effectiveness. " +
          "Action items assigned for safety induction update and PPE procurement review.",
        nextReviewDate: threeMonthsFromNow,
        facilitatorId: owner.id,
        createdById: owner.id,
        organizationId: org.id,
      },
    })
    console.log("  ✅ Created: " + reviewTitle)

    // Link standards (ISO 9001 + ISO 45001)
    await prisma.managementReviewStandard.createMany({
      data: [
        { reviewId: review.id, standardId: iso9001.id },
        { reviewId: review.id, standardId: iso45001.id },
      ],
    })
    console.log("    ✅ Linked standards: ISO 9001, ISO 45001")

    // Add owner as attendee
    await prisma.managementReviewAttendee.create({
      data: { reviewId: review.id, userId: owner.id },
    })
    console.log("    ✅ Added attendee: " + owner.firstName + " " + owner.lastName)

    // Agenda items
    await prisma.managementReviewAgendaItem.createMany({
      data: [
        {
          reviewId: review.id,
          type: "AUDIT_RESULTS",
          title: "Q4 2025 Internal Audit Findings",
          notes: "3 minor non-conformities identified. 2 closed, 1 pending corrective action on document control.",
          sortOrder: 1,
        },
        {
          reviewId: review.id,
          type: "CAPA_STATUS",
          title: "Open CAPA Review",
          notes: "5 open CAPAs. 2 overdue — escalation plan discussed.",
          sortOrder: 2,
        },
        {
          reviewId: review.id,
          type: "PROCESS_PERFORMANCE",
          title: "Safety KPI Dashboard Review",
          notes: "Incident rate down 8% since safety training rollout. Target is 30% reduction by Q4.",
          sortOrder: 3,
        },
        {
          reviewId: review.id,
          type: "IMPROVEMENT_OPPORTUNITIES",
          title: "Digital Checklist Adoption",
          notes: "72% completion rate on recurring checklists. Recommend mandatory mobile app usage on-site.",
          sortOrder: 4,
        },
      ],
    })
    console.log("    ✅ Created 4 agenda items")

    // Action items
    await prisma.managementReviewAction.createMany({
      data: [
        {
          reviewId: review.id,
          description: "Update safety induction training to include scaffolding collapse lessons learned",
          status: "OPEN",
          assigneeId: owner.id,
          dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        },
        {
          reviewId: review.id,
          description: "Review and approve updated PPE procurement policy",
          status: "IN_PROGRESS",
          assigneeId: owner.id,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        },
        {
          reviewId: review.id,
          description: "Schedule external audit preparation meeting",
          status: "COMPLETED",
          assigneeId: owner.id,
          dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
          completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    })
    console.log("    ✅ Created 3 action items (1 open, 1 in progress, 1 completed)")
  } else {
    console.log("  ⏭️  Already exists: " + reviewTitle)
  }

  console.log("\n✅ Demo seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

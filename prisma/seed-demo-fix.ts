import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const orgId = "24d6d06d-e62f-419d-a3e5-22faa7a8fb62" // ConformEdge Systems
  const userId = "dc3372a9-bed8-43cb-a1a2-8f0608783fcb" // Nhlanhla Mnyandu
  const iso45001Id = "e02fa108-6842-4cfe-a9d3-0a82d5670d72"
  const iso9001Id = "377b399a-bbca-4354-9656-4fbee0ee37fd"
  const now = new Date()

  console.log("Targeting org: ConformEdge Systems")
  console.log("User: Nhlanhla Mnyandu\n")

  // ─── Fix Incidents ───
  console.log("📋 Fixing incidents...")

  const inc1 = await prisma.incident.findFirst({
    where: { title: "Scaffolding collapse on Site B", organizationId: orgId },
  })
  if (inc1) {
    await prisma.incident.update({
      where: { id: inc1.id },
      data: {
        status: "INVESTIGATING",
        description: "A section of scaffolding on the north face of Building B collapsed during high winds. Two workers were in the area but evacuated safely.",
        immediateAction: "Area cordoned off, all workers evacuated, site manager notified",
        location: "North face, Building B - Level 3",
      },
    })
    console.log("  ✅ Fixed: Scaffolding collapse → INVESTIGATING")
  }

  const inc2 = await prisma.incident.findFirst({
    where: { title: "Near-miss: unsecured load on crane", organizationId: orgId },
  })
  if (inc2) {
    await prisma.incident.update({
      where: { id: inc2.id },
      data: {
        status: "CORRECTIVE_ACTION",
        description: "An unsecured load shifted during crane operation. No injuries, but the load came within 2 metres of a worker below.",
        immediateAction: "Crane operations suspended pending inspection. All rigging equipment checked.",
        rootCause: "Rigging procedure not followed. Operator bypassed pre-lift checklist.",
        location: "Main site - Loading bay",
      },
    })
    console.log("  ✅ Fixed: Near-miss crane → CORRECTIVE_ACTION")
  }

  // ─── Fix Objectives ───
  console.log("\n🎯 Fixing objectives...")

  const twoMonthsAgo = new Date(now)
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  const oneMonthAgo = new Date(now)
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const sixMonthsFromNow = new Date(now)
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
  const fourMonthsFromNow = new Date(now)
  fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4)

  // Objective 1: Fix title, standard, target, current + add measurements
  const obj1 = await prisma.objective.findFirst({
    where: { title: "Reduce site incidents by 45%", organizationId: orgId },
  })
  if (obj1) {
    await prisma.objective.update({
      where: { id: obj1.id },
      data: {
        title: "Reduce site incident rate by 30%",
        description: "Target a 30% reduction in reportable incidents across all construction sites by end of Q4 2026.",
        targetValue: 30,
        currentValue: 8,
        unit: "%",
        measurementFrequency: "MONTHLY",
        status: "ACTIVE",
        standardId: iso45001Id,
        dueDate: sixMonthsFromNow,
      },
    })
    console.log("  ✅ Fixed: Objective 1 title/standard/target/current")

    // Check existing measurements and ensure we have 3
    const existingMeasurements = await prisma.objectiveMeasurement.count({ where: { objectiveId: obj1.id } })
    if (existingMeasurements < 3) {
      // Delete existing and recreate all 3
      await prisma.objectiveMeasurement.deleteMany({ where: { objectiveId: obj1.id } })
      await prisma.objectiveMeasurement.createMany({
        data: [
          { value: 3, notes: "January baseline measurement", objectiveId: obj1.id, recordedById: userId, measuredAt: twoMonthsAgo },
          { value: 5, notes: "February - safety training rollout started", objectiveId: obj1.id, recordedById: userId, measuredAt: oneMonthAgo },
          { value: 8, notes: "March - 8% reduction achieved from safety training", objectiveId: obj1.id, recordedById: userId, measuredAt: now },
        ],
      })
      console.log("    ✅ Created 3 measurements")
    }
  }

  // Objective 2: Fix current + add measurements
  const obj2 = await prisma.objective.findFirst({
    where: { title: "Achieve 95% checklist completion rate", organizationId: orgId },
  })
  if (obj2) {
    await prisma.objective.update({
      where: { id: obj2.id },
      data: {
        description: "Ensure all scheduled compliance checklists are completed on time with a target of 95% completion.",
        targetValue: 95,
        currentValue: 72,
        unit: "%",
        measurementFrequency: "MONTHLY",
        status: "ACTIVE",
        standardId: iso9001Id,
        dueDate: fourMonthsFromNow,
      },
    })
    console.log("  ✅ Fixed: Objective 2 current/target")

    const existingMeasurements = await prisma.objectiveMeasurement.count({ where: { objectiveId: obj2.id } })
    if (existingMeasurements < 2) {
      await prisma.objectiveMeasurement.deleteMany({ where: { objectiveId: obj2.id } })
      await prisma.objectiveMeasurement.createMany({
        data: [
          { value: 60, notes: "February - initial tracking", objectiveId: obj2.id, recordedById: userId, measuredAt: oneMonthAgo },
          { value: 72, notes: "March - improved with recurring checklists feature", objectiveId: obj2.id, recordedById: userId, measuredAt: now },
        ],
      })
      console.log("    ✅ Created 2 measurements")
    }
  }

  // ─── Seed Management Review ───
  console.log("\n📋 Seeding management review...")

  const reviewTitle = "Q1 2026 Management Review"
  const existingReview = await prisma.managementReview.findFirst({
    where: { title: reviewTitle, organizationId: orgId },
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
        facilitatorId: userId,
        createdById: userId,
        organizationId: orgId,
      },
    })
    console.log("  ✅ Created: " + reviewTitle)

    await prisma.managementReviewStandard.createMany({
      data: [
        { reviewId: review.id, standardId: iso9001Id },
        { reviewId: review.id, standardId: iso45001Id },
      ],
    })
    console.log("    ✅ Linked: ISO 9001, ISO 45001")

    await prisma.managementReviewAttendee.create({
      data: { reviewId: review.id, userId },
    })
    console.log("    ✅ Added attendee: Nhlanhla Mnyandu")

    await prisma.managementReviewAgendaItem.createMany({
      data: [
        { reviewId: review.id, type: "AUDIT_RESULTS", title: "Q4 2025 Internal Audit Findings", notes: "3 minor non-conformities identified. 2 closed, 1 pending corrective action on document control.", sortOrder: 1 },
        { reviewId: review.id, type: "CAPA_STATUS", title: "Open CAPA Review", notes: "5 open CAPAs. 2 overdue — escalation plan discussed.", sortOrder: 2 },
        { reviewId: review.id, type: "PROCESS_PERFORMANCE", title: "Safety KPI Dashboard Review", notes: "Incident rate down 8% since safety training rollout. Target is 30% reduction by Q4.", sortOrder: 3 },
        { reviewId: review.id, type: "IMPROVEMENT_OPPORTUNITIES", title: "Digital Checklist Adoption", notes: "72% completion rate on recurring checklists. Recommend mandatory mobile app usage on-site.", sortOrder: 4 },
      ],
    })
    console.log("    ✅ Created 4 agenda items")

    await prisma.managementReviewAction.createMany({
      data: [
        { reviewId: review.id, description: "Update safety induction training to include scaffolding collapse lessons learned", status: "OPEN", assigneeId: userId, dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) },
        { reviewId: review.id, description: "Review and approve updated PPE procurement policy", status: "IN_PROGRESS", assigneeId: userId, dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        { reviewId: review.id, description: "Schedule external audit preparation meeting", status: "COMPLETED", assigneeId: userId, dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
      ],
    })
    console.log("    ✅ Created 3 action items")
  } else {
    console.log("  ⏭️  Already exists: " + reviewTitle)
  }

  // ─── Seed Work Permits ───
  console.log("\n🛡️ Seeding work permits...")

  const permit1Title = "Hot Work - Welding on Steel Frame Level 4"
  if (!(await prisma.workPermit.findFirst({ where: { title: permit1Title, organizationId: orgId } }))) {
    const permit = await prisma.workPermit.create({
      data: {
        title: permit1Title,
        permitNumber: "PTW-2026-001",
        permitType: "HOT_WORK",
        status: "ACTIVE",
        riskLevel: "HIGH",
        location: "Building A - Level 4, Steel Structure",
        description: "MIG welding operations on the main steel frame connections at Level 4. Work involves joining primary beams to column brackets per structural drawing SD-104.",
        hazardsIdentified: "Fire risk from sparks and molten metal\nBurns from hot surfaces\nFume inhalation\nFalling objects from height\nElectric shock from welding equipment",
        precautions: "Fire blankets deployed below work area\nFire extinguisher within 5m\nSpotter assigned for duration\nAll combustibles removed from 10m radius",
        ppeRequirements: "Welding helmet with auto-darkening lens\nFlame-resistant coveralls\nWelding gloves\nSafety boots with metatarsal guards\nFall arrest harness (working at height)",
        emergencyProcedures: "In case of fire: Activate nearest fire alarm, use extinguisher if safe. Evacuate via stairwell B.\nIn case of injury: Call site first aider (ext 555), do not move injured person.\nAssembly point: Car park A.",
        validFrom: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        activatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        requestedById: userId,
        issuedById: userId,
        organizationId: orgId,
      },
    })
    await prisma.workPermitChecklist.createMany({
      data: [
        { permitId: permit.id, description: "Area cleared of combustible materials", isChecked: true, sortOrder: 0, checkedById: userId, checkedAt: now },
        { permitId: permit.id, description: "Fire extinguisher positioned within 5m", isChecked: true, sortOrder: 1, checkedById: userId, checkedAt: now },
        { permitId: permit.id, description: "Fire watch spotter assigned", isChecked: true, sortOrder: 2, checkedById: userId, checkedAt: now },
        { permitId: permit.id, description: "Welding equipment inspected and earthed", isChecked: false, sortOrder: 3 },
        { permitId: permit.id, description: "Gas cylinders secured upright", isChecked: false, sortOrder: 4 },
      ],
    })
    console.log("  ✅ Created: Hot Work (ACTIVE) + 5 checklist items")
  } else {
    console.log("  ⏭️  Already exists: " + permit1Title)
  }

  const permit2Title = "Confined Space Entry - Storm Water Culvert Inspection"
  if (!(await prisma.workPermit.findFirst({ where: { title: permit2Title, organizationId: orgId } }))) {
    await prisma.workPermit.create({
      data: {
        title: permit2Title,
        permitNumber: "PTW-2026-002",
        permitType: "CONFINED_SPACE",
        status: "PENDING_APPROVAL",
        riskLevel: "CRITICAL",
        location: "Site C - Underground culvert network",
        description: "Entry into storm water culvert for structural integrity inspection. Two-person team with standby rescue. Atmospheric monitoring required throughout.",
        hazardsIdentified: "Oxygen deficiency\nToxic gas accumulation (H2S, CO)\nFlash flooding\nStructural collapse\nLimited egress",
        precautions: "Continuous atmospheric monitoring (4-gas detector)\nStandby rescue team at entry point\nCommunication check every 15 minutes\nWeather forecast confirmed - no rain expected",
        ppeRequirements: "Self-contained breathing apparatus (SCBA)\nFull body harness with retrieval line\nHard hat with headlamp\nRubber boots\nGas detector (personal)",
        emergencyProcedures: "DO NOT enter to rescue without SCBA.\nActivate rescue winch at entry point.\nCall emergency services: 10111\nSite emergency number: ext 999",
        validFrom: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        requestedById: userId,
        organizationId: orgId,
      },
    })
    console.log("  ✅ Created: Confined Space (PENDING_APPROVAL)")
  } else {
    console.log("  ⏭️  Already exists: " + permit2Title)
  }

  const permit3Title = "Working at Heights - Roof Waterproofing"
  if (!(await prisma.workPermit.findFirst({ where: { title: permit3Title, organizationId: orgId } }))) {
    await prisma.workPermit.create({
      data: {
        title: permit3Title,
        permitNumber: "PTW-2026-003",
        permitType: "WORKING_AT_HEIGHTS",
        status: "CLOSED",
        riskLevel: "HIGH",
        location: "Building B - Rooftop",
        description: "Application of torch-on waterproofing membrane to Building B flat roof. Work completed over 3 days.",
        hazardsIdentified: "Fall from height (12m)\nBurns from gas torch\nSlip hazard on membrane surface",
        precautions: "Edge protection barriers installed on all sides\nSafety nets below work area\nNon-slip footwear required\nWork suspended if wind > 40 km/h",
        ppeRequirements: "Full body harness\nHard hat\nSafety boots\nHeat-resistant gloves",
        emergencyProcedures: "In case of fall: Do not move victim, call emergency services immediately.\nAssembly point: Car park B.",
        validFrom: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        validTo: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        activatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        closedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        closureNotes: "All waterproofing work completed successfully. Area cleaned and barriers removed. No incidents reported.",
        requestedById: userId,
        issuedById: userId,
        organizationId: orgId,
      },
    })
    console.log("  ✅ Created: Working at Heights (CLOSED)")
  } else {
    console.log("  ⏭️  Already exists: " + permit3Title)
  }

  console.log("\n✅ Demo seed fix complete!")
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Seed 13 Work Record Card (WRC) checklist templates for equipment inspection.
 *
 * Creates ConformEdge-branded inspection templates for lifting equipment,
 * based on industry-standard WRC patterns (ISO 9001 Clause 7.1.5).
 *
 * Usage:
 *   npx tsx prisma/scripts/seed-wrc-templates.ts
 *
 * Idempotent — skips templates that already exist (matched by name + org).
 */

import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ISO9001_CODE = "ISO9001"

// ── Field helpers ───────────────────────────────────────────────────

/** SELECT field with Satisfactory/Replace options — the core WRC check */
function inspectionItem(description: string) {
  return {
    description,
    fieldType: "SELECT",
    fieldConfig: { options: ["Satisfactory", "Replace", "N/A"] },
  }
}

/** TEXT field for free-form entry */
function textItem(description: string) {
  return { description, fieldType: "BOOLEAN" }
}

/** Section header (compliance-style, acts as a visual separator) */
function sectionHeader(description: string) {
  return { description, fieldType: "COMPLIANCE" }
}

// ── WRC Template Definitions ────────────────────────────────────────

interface WrcTemplate {
  name: string
  description: string
  category: string
  items: Array<{ description: string; fieldType?: string; fieldConfig?: Record<string, unknown> }>
}

const WRC_TEMPLATES: WrcTemplate[] = [
  {
    name: "WRC — General Lifting Machine",
    description: "Work Record Card for general lifting machines (cranes, hoists, overhead equipment). Covers dismantle, examination, test, and final inspection steps per LOLER regulations.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Pre-Inspection Checks"),
      inspectionItem("Machine identification plate legible"),
      inspectionItem("Serial number matches documentation"),
      inspectionItem("SWL marking clearly visible"),
      inspectionItem("CE marking present (where applicable)"),
      sectionHeader("2. Structural Examination"),
      inspectionItem("Main frame / chassis — no cracks or deformation"),
      inspectionItem("Welds — no visible defects"),
      inspectionItem("Mounting bolts — secure and undamaged"),
      inspectionItem("Safety guards — in place and serviceable"),
      sectionHeader("3. Mechanical Components"),
      inspectionItem("Gears and gearbox"),
      inspectionItem("Bearings"),
      inspectionItem("Braking system"),
      inspectionItem("Clutch mechanism"),
      inspectionItem("Drive shaft / motor coupling"),
      sectionHeader("4. Wire Rope / Chain"),
      inspectionItem("Wire rope / chain — no excessive wear"),
      inspectionItem("Wire rope / chain — no kinks or distortion"),
      inspectionItem("Terminations / end fittings"),
      inspectionItem("Drum and fleet angle"),
      sectionHeader("5. Hook Assembly"),
      inspectionItem("Hook — no cracks, wear, or opening"),
      inspectionItem("Hook safety latch — functional"),
      inspectionItem("Hook nut and split pin"),
      inspectionItem("Hook block / swivel"),
      sectionHeader("6. Controls & Electrical"),
      inspectionItem("Controls — function correctly"),
      inspectionItem("Emergency stop — operational"),
      inspectionItem("Limit switches — functional"),
      inspectionItem("Electrical cables and connections"),
      sectionHeader("7. Load Test"),
      textItem("Proof load test completed at required percentage"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — General Lifting Accessories",
    description: "Work Record Card for general lifting accessories (slings, shackles, eyebolts, etc.). Covers visual examination, dimensional checks, and proof load testing.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking legible"),
      inspectionItem("SWL marking present"),
      inspectionItem("Traceability to certificate"),
      sectionHeader("2. Visual Examination"),
      inspectionItem("General condition — no corrosion"),
      inspectionItem("No distortion or bending"),
      inspectionItem("No cracks or fractures"),
      inspectionItem("No excessive wear"),
      inspectionItem("No heat damage or discolouration"),
      sectionHeader("3. Dimensional Checks"),
      inspectionItem("Dimensions within tolerance"),
      inspectionItem("Thread condition (where applicable)"),
      inspectionItem("Pin / bolt retention"),
      sectionHeader("4. Functional Check"),
      inspectionItem("Moving parts operate freely"),
      inspectionItem("Locking mechanism functional"),
      inspectionItem("Safety catch / latch operational"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Chain Block",
    description: "Work Record Card for hand-operated chain blocks. 26-point component inspection covering load sheave, friction discs, ratchet gear, hand wheel, load chain, and hook assemblies.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification & Markings"),
      inspectionItem("Identification plate / SWL marking"),
      inspectionItem("Serial number legible"),
      sectionHeader("2. Casing & Frame"),
      inspectionItem("Side plates — no cracks or distortion"),
      inspectionItem("Tie rods / bolts — secure"),
      inspectionItem("Suspension hook fitting"),
      sectionHeader("3. Internal Components"),
      inspectionItem("Load sheave — no wear or damage"),
      inspectionItem("Load sheave bearing"),
      inspectionItem("Friction discs — adequate friction surface"),
      inspectionItem("Ratchet gear — teeth condition"),
      inspectionItem("Pawl and pawl spring"),
      inspectionItem("Hand wheel / hand chain wheel"),
      inspectionItem("Pinion gear"),
      inspectionItem("Gear train — mesh and condition"),
      inspectionItem("Brake mechanism — holding capacity"),
      sectionHeader("4. Chain"),
      inspectionItem("Load chain — wear, stretch, corrosion"),
      inspectionItem("Load chain — link dimensions within tolerance"),
      inspectionItem("Hand chain — condition"),
      inspectionItem("Chain guide / stripper"),
      inspectionItem("Chain container / bag"),
      sectionHeader("5. Hook Assemblies"),
      inspectionItem("Top hook — no cracks or opening"),
      inspectionItem("Top hook safety latch"),
      inspectionItem("Top hook nut and split pin"),
      inspectionItem("Bottom hook — no cracks or opening"),
      inspectionItem("Bottom hook safety latch"),
      inspectionItem("Bottom hook nut and split pin"),
      inspectionItem("Hook block swivel"),
      sectionHeader("6. Load Test"),
      textItem("Proof load test at SWL + 100%"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Lever Hoist",
    description: "Work Record Card for lever hoists (ratchet lever hoists). Covers lever mechanism, pawl, ratchet, chain, and hook assemblies.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification plate / SWL"),
      inspectionItem("Serial number legible"),
      sectionHeader("2. Casing & Lever"),
      inspectionItem("Side plates — condition"),
      inspectionItem("Lever handle — no bending or damage"),
      inspectionItem("Lever pivot pin"),
      inspectionItem("Direction selector — functions correctly"),
      sectionHeader("3. Internal Components"),
      inspectionItem("Ratchet wheel — teeth condition"),
      inspectionItem("Pawl and pawl spring"),
      inspectionItem("Load sheave"),
      inspectionItem("Friction discs"),
      inspectionItem("Gear train"),
      inspectionItem("Brake mechanism"),
      sectionHeader("4. Chain"),
      inspectionItem("Load chain — wear and stretch"),
      inspectionItem("Chain guide / stripper"),
      inspectionItem("Free chain operation in both directions"),
      sectionHeader("5. Hook Assemblies"),
      inspectionItem("Top hook and safety latch"),
      inspectionItem("Bottom hook and safety latch"),
      inspectionItem("Hook nuts and split pins"),
      sectionHeader("6. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Tirfor Machine",
    description: "Work Record Card for Tirfor wire rope pulling machines. Covers jaw mechanism, anchor, wire rope, and control lever inspection.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification plate / SWL"),
      sectionHeader("2. Body & Frame"),
      inspectionItem("Casing — no cracks or damage"),
      inspectionItem("Anchor point / base plate"),
      inspectionItem("Mounting bracket"),
      sectionHeader("3. Mechanism"),
      inspectionItem("Forward jaw assembly"),
      inspectionItem("Rear jaw assembly"),
      inspectionItem("Jaw springs"),
      inspectionItem("Release lever / shear pin"),
      inspectionItem("Control lever — forward/neutral/reverse"),
      inspectionItem("Overload release mechanism"),
      sectionHeader("4. Wire Rope"),
      inspectionItem("Wire rope — no broken wires"),
      inspectionItem("Wire rope — no kinks or bird-caging"),
      inspectionItem("Wire rope end fitting"),
      inspectionItem("Wire rope diameter within tolerance"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Beam Clamp",
    description: "Work Record Card for beam clamps. Covers jaw condition, adjusting screw, suspension point, and load test.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking / SWL"),
      inspectionItem("Beam flange range marking"),
      sectionHeader("2. Body"),
      inspectionItem("Clamp body — no cracks or distortion"),
      inspectionItem("Jaw faces — condition and grip"),
      inspectionItem("Jaw opening mechanism"),
      sectionHeader("3. Adjusting Mechanism"),
      inspectionItem("Adjusting screw / T-bolt"),
      inspectionItem("Screw thread condition"),
      inspectionItem("Locking nut"),
      inspectionItem("Swivel pad (where fitted)"),
      sectionHeader("4. Suspension Point"),
      inspectionItem("Suspension eye / shackle point"),
      inspectionItem("Pin and retention"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Beam Trolley",
    description: "Work Record Card for beam trolleys (push/geared travel). Covers wheel assemblies, axles, side plates, and bumper stops.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification plate / SWL"),
      inspectionItem("Beam flange range"),
      sectionHeader("2. Frame"),
      inspectionItem("Side plates — no distortion"),
      inspectionItem("Connecting bolts"),
      inspectionItem("Bumper stops / end stops"),
      sectionHeader("3. Wheel Assemblies"),
      inspectionItem("Wheels — wear and tread condition"),
      inspectionItem("Wheel bearings"),
      inspectionItem("Axle pins"),
      inspectionItem("Wheel guards"),
      inspectionItem("Flange width adjustment"),
      sectionHeader("4. Geared Travel (if applicable)"),
      inspectionItem("Drive gear and pinion"),
      inspectionItem("Hand chain wheel"),
      inspectionItem("Hand chain"),
      sectionHeader("5. Suspension Point"),
      inspectionItem("Load suspension point"),
      inspectionItem("Shackle / connecting pin"),
      sectionHeader("6. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Sheave Block",
    description: "Work Record Card for sheave blocks (single and multi-sheave). Covers sheave condition, bearings, side plates, and becket.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking / SWL"),
      sectionHeader("2. Side Plates & Frame"),
      inspectionItem("Side plates — no cracks or bending"),
      inspectionItem("Connecting bolts / tie rods"),
      inspectionItem("Becket / dead end attachment"),
      sectionHeader("3. Sheave(s)"),
      inspectionItem("Sheave groove — wear and profile"),
      inspectionItem("Sheave diameter within tolerance"),
      inspectionItem("Sheave bearings"),
      inspectionItem("Sheave pin"),
      inspectionItem("Sheave guard / rope guide"),
      sectionHeader("4. Hook / Suspension"),
      inspectionItem("Hook — condition and safety latch"),
      inspectionItem("Hook nut and split pin"),
      inspectionItem("Swivel (if fitted)"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Pneumatic Chain Hoist",
    description: "Work Record Card for pneumatic (air-powered) chain hoists. Covers air motor, vane assembly, gearbox, chain, and hook components.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification plate / SWL"),
      inspectionItem("Air supply requirements marked"),
      sectionHeader("2. Air Motor"),
      inspectionItem("Motor housing — condition"),
      inspectionItem("Vane assembly — wear"),
      inspectionItem("Cylinder / rotor"),
      inspectionItem("Air inlet filter"),
      inspectionItem("Exhaust / silencer"),
      sectionHeader("3. Gearbox"),
      inspectionItem("Gearbox housing"),
      inspectionItem("Gear train — mesh and condition"),
      inspectionItem("Brake mechanism"),
      inspectionItem("Clutch (if fitted)"),
      sectionHeader("4. Controls"),
      inspectionItem("Pendant control — function"),
      inspectionItem("Air hose and connections"),
      inspectionItem("Emergency stop"),
      inspectionItem("Limit switches (if fitted)"),
      sectionHeader("5. Chain & Hooks"),
      inspectionItem("Load chain — wear and stretch"),
      inspectionItem("Chain guide"),
      inspectionItem("Top hook and safety latch"),
      inspectionItem("Bottom hook and safety latch"),
      sectionHeader("6. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Hydraulic Jack & Ram",
    description: "Work Record Card for hydraulic jacks and rams. Covers cylinder, piston, seals, pump mechanism, and pressure relief.",
    category: "Lifting Machines",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification plate / SWL"),
      inspectionItem("Stroke length marked"),
      sectionHeader("2. Cylinder & Piston"),
      inspectionItem("Cylinder body — no dents or corrosion"),
      inspectionItem("Piston rod — no scoring or pitting"),
      inspectionItem("Piston seals — no leakage"),
      inspectionItem("Saddle / cap — condition"),
      sectionHeader("3. Pump & Hydraulics"),
      inspectionItem("Pump handle / lever"),
      inspectionItem("Pump mechanism — smooth operation"),
      inspectionItem("Hydraulic fluid — level and condition"),
      inspectionItem("Release valve — controlled lowering"),
      inspectionItem("Pressure relief valve — functional"),
      inspectionItem("Hose and connections (if remote)"),
      sectionHeader("4. Base & Stability"),
      inspectionItem("Base plate — flat and stable"),
      inspectionItem("Wheels / castors (if fitted)"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test at SWL + 50%"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Horizontal Plate Clamp",
    description: "Work Record Card for horizontal plate clamps. Covers jaw faces, cam mechanism, spring, and locking device.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking / SWL"),
      inspectionItem("Plate thickness range marked"),
      sectionHeader("2. Body & Jaws"),
      inspectionItem("Clamp body — no distortion"),
      inspectionItem("Fixed jaw face — grip and condition"),
      inspectionItem("Moving jaw face — grip and condition"),
      inspectionItem("Jaw teeth / knurling — not worn smooth"),
      sectionHeader("3. Cam Mechanism"),
      inspectionItem("Cam — wear and profile"),
      inspectionItem("Cam pivot pin"),
      inspectionItem("Spring — tension and condition"),
      inspectionItem("Locking device / safety catch"),
      sectionHeader("4. Suspension"),
      inspectionItem("Shackle / suspension eye"),
      inspectionItem("Pin and retention"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Vertical Plate Clamp",
    description: "Work Record Card for vertical plate clamps. Covers jaw faces, cam mechanism, locking device, and load test at specified angles.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking / SWL"),
      inspectionItem("Plate thickness range marked"),
      sectionHeader("2. Body & Jaws"),
      inspectionItem("Clamp body — no distortion"),
      inspectionItem("Fixed jaw face — grip and hardness"),
      inspectionItem("Moving jaw face — grip and hardness"),
      inspectionItem("Jaw opening spring"),
      sectionHeader("3. Cam Mechanism"),
      inspectionItem("Cam — wear and profile"),
      inspectionItem("Cam pivot pin"),
      inspectionItem("Self-locking action verified"),
      inspectionItem("Locking device / safety trigger"),
      inspectionItem("Test lock at 0° (vertical hang)"),
      sectionHeader("4. Suspension"),
      inspectionItem("Shackle / suspension eye"),
      inspectionItem("Pin and retention"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed"),
      textItem("Post-test examination satisfactory"),
    ],
  },
  {
    name: "WRC — Angle Clamp",
    description: "Work Record Card for angle clamps (multi-position plate clamps). Covers jaw mechanism, rotation lock, angular capacity, and load test.",
    category: "Lifting Accessories",
    items: [
      sectionHeader("1. Identification"),
      inspectionItem("Identification marking / SWL"),
      inspectionItem("Angular capacity marked"),
      inspectionItem("Plate thickness range marked"),
      sectionHeader("2. Body & Jaws"),
      inspectionItem("Clamp body — no distortion"),
      inspectionItem("Fixed jaw face — grip and condition"),
      inspectionItem("Moving jaw face — grip and condition"),
      inspectionItem("Jaw teeth / knurling"),
      sectionHeader("3. Mechanism"),
      inspectionItem("Cam — wear and profile"),
      inspectionItem("Cam pivot pin"),
      inspectionItem("Spring — tension and condition"),
      inspectionItem("Rotation lock mechanism"),
      inspectionItem("Angular position detents"),
      inspectionItem("Safety latch / trigger"),
      sectionHeader("4. Suspension"),
      inspectionItem("Shackle / suspension eye"),
      inspectionItem("Swivel (if fitted)"),
      inspectionItem("Pin and retention"),
      sectionHeader("5. Load Test"),
      textItem("Proof load test completed at rated angles"),
      textItem("Post-test examination satisfactory"),
    ],
  },
]

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("🔧 Seeding WRC checklist templates...\n")

  // Find ISO 9001 standard
  const iso9001 = await prisma.standard.findFirst({ where: { code: ISO9001_CODE } })
  if (!iso9001) {
    console.error("❌ ISO 9001 standard not found. Run prisma db seed first.")
    process.exit(1)
  }

  // Get all organizations
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true },
  })

  if (orgs.length === 0) {
    console.error("❌ No organizations found.")
    process.exit(1)
  }

  // Get a system user for each org (first OWNER or ADMIN)
  let totalCreated = 0
  let totalSkipped = 0

  for (const org of orgs) {
    const orgUser = await prisma.organizationUser.findFirst({
      where: { organizationId: org.id, isActive: true, role: { in: ["OWNER", "ADMIN"] } },
      select: { userId: true },
      orderBy: { createdAt: "asc" },
    })

    if (!orgUser) {
      console.log(`  ⚠ ${org.name}: no OWNER/ADMIN user — skipping`)
      continue
    }

    console.log(`  📦 ${org.name}:`)

    for (const template of WRC_TEMPLATES) {
      // Check if template already exists
      const existing = await prisma.checklistTemplate.findFirst({
        where: { organizationId: org.id, name: template.name },
      })

      if (existing) {
        totalSkipped++
        continue
      }

      await prisma.checklistTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          standardId: iso9001.id,
          items: template.items,
          organizationId: org.id,
          createdById: orgUser.userId,
        },
      })
      totalCreated++
      console.log(`     ✅ ${template.name} (${template.items.length} items)`)
    }
  }

  console.log(`\n✅ Done! Created ${totalCreated} templates, skipped ${totalSkipped} existing.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

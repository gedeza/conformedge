import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const COMMON_CLAUSE_TITLES: Record<string, string> = {
  "4": "Context of the Organization",
  "5": "Leadership",
  "6": "Planning",
  "7": "Support",
  "8": "Operation",
  "9": "Performance Evaluation",
  "10": "Improvement",
}

interface StandardSeed {
  code: string
  name: string
  description: string
  version: string
}

const STANDARDS: StandardSeed[] = [
  {
    code: "ISO9001",
    name: "ISO 9001:2015",
    description: "Quality Management Systems - Requirements",
    version: "2015",
  },
  {
    code: "ISO14001",
    name: "ISO 14001:2015",
    description: "Environmental Management Systems - Requirements with guidance for use",
    version: "2015",
  },
  {
    code: "ISO45001",
    name: "ISO 45001:2018",
    description: "Occupational Health and Safety Management Systems - Requirements with guidance for use",
    version: "2018",
  },
  {
    code: "ISO22301",
    name: "ISO 22301:2019",
    description: "Business Continuity Management Systems - Requirements",
    version: "2019",
  },
  {
    code: "ISO27001",
    name: "ISO 27001:2022",
    description: "Information Security Management Systems - Requirements",
    version: "2022",
  },
  {
    code: "ISO37001",
    name: "ISO 37001:2016",
    description: "Anti-bribery Management Systems - Requirements with guidance for use",
    version: "2016",
  },
  {
    code: "ISO39001",
    name: "ISO 39001:2012",
    description: "Road Traffic Safety Management Systems - Requirements with guidance for use",
    version: "2012",
  },
]

async function main() {
  console.log("Seeding ISO standards and clauses...\n")

  let standardCount = 0

  for (const std of STANDARDS) {
    const standard = await prisma.standard.upsert({
      where: { code: std.code },
      update: {
        name: std.name,
        description: std.description,
        version: std.version,
      },
      create: {
        code: std.code,
        name: std.name,
        description: std.description,
        version: std.version,
      },
    })

    // Seed top-level clauses 4-10
    for (const [clauseNumber, title] of Object.entries(COMMON_CLAUSE_TITLES)) {
      // Check if clause already exists
      const existing = await prisma.standardClause.findFirst({
        where: {
          standardId: standard.id,
          clauseNumber: clauseNumber,
          parentId: null,
        },
      })

      if (!existing) {
        await prisma.standardClause.create({
          data: {
            clauseNumber,
            title,
            standardId: standard.id,
          },
        })
      }
    }

    standardCount++
    console.log(`  Seeded: ${std.name} (${std.code}) with ${Object.keys(COMMON_CLAUSE_TITLES).length} clauses`)
  }

  console.log(`\nSeeding complete. ${standardCount} standards seeded.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })

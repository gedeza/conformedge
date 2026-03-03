import { db } from "@/lib/db"

/**
 * Record an AI classification usage — fire-and-forget.
 * Increments the monthly counter and optionally deducts a purchased credit.
 */
export async function recordAiClassificationUsage(
  dbOrgId: string,
  periodStart: Date,
  periodEnd: Date,
  options: { useCredit: boolean; documentId?: string; performedById?: string }
): Promise<void> {
  try {
    await db.$transaction(async (tx) => {
      // Upsert the usage record for this period
      await tx.usageRecord.upsert({
        where: {
          organizationId_periodStart: {
            organizationId: dbOrgId,
            periodStart,
          },
        },
        create: {
          organizationId: dbOrgId,
          periodStart,
          periodEnd,
          aiClassificationsUsed: 1,
        },
        update: {
          aiClassificationsUsed: { increment: 1 },
        },
      })

      // If using a purchased credit, deduct from balance and log transaction
      if (options.useCredit) {
        const balance = await tx.creditBalance.update({
          where: { organizationId: dbOrgId },
          data: {
            balance: { decrement: 1 },
            lifetimeUsed: { increment: 1 },
          },
        })

        await tx.creditTransaction.create({
          data: {
            type: "USAGE",
            amount: -1,
            balanceAfter: balance.balance,
            description: "AI classification (purchased credit)",
            documentId: options.documentId,
            performedById: options.performedById,
            organizationId: dbOrgId,
          },
        })
      }
    })
  } catch {
    // Fire-and-forget — log but don't block the classification
    console.error("[billing] Failed to record AI classification usage")
  }
}

/**
 * Increment the document count in the current usage record.
 * Called when a document is created.
 */
export async function recordDocumentCreated(
  dbOrgId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  try {
    await db.usageRecord.upsert({
      where: {
        organizationId_periodStart: {
          organizationId: dbOrgId,
          periodStart,
        },
      },
      create: {
        organizationId: dbOrgId,
        periodStart,
        periodEnd,
        documentsCount: 1,
      },
      update: {
        documentsCount: { increment: 1 },
      },
    })
  } catch {
    console.error("[billing] Failed to record document creation")
  }
}

/**
 * Decrement the document count in the current usage record.
 * Called when a document is deleted.
 */
export async function recordDocumentDeleted(
  dbOrgId: string,
  periodStart: Date
): Promise<void> {
  try {
    await db.usageRecord.updateMany({
      where: {
        organizationId: dbOrgId,
        periodStart,
        documentsCount: { gt: 0 },
      },
      data: {
        documentsCount: { decrement: 1 },
      },
    })
  } catch {
    console.error("[billing] Failed to record document deletion")
  }
}

/**
 * Grant credits to an org (purchase or onboarding bonus).
 */
export async function grantCredits(
  dbOrgId: string,
  amount: number,
  description: string,
  options?: { invoiceId?: string; performedById?: string; type?: "PURCHASE" | "ADJUSTMENT" | "REFUND" }
): Promise<void> {
  await db.$transaction(async (tx) => {
    const balance = await tx.creditBalance.upsert({
      where: { organizationId: dbOrgId },
      create: {
        organizationId: dbOrgId,
        balance: amount,
        lifetimeEarned: amount,
      },
      update: {
        balance: { increment: amount },
        lifetimeEarned: { increment: amount },
      },
    })

    await tx.creditTransaction.create({
      data: {
        type: options?.type ?? "PURCHASE",
        amount,
        balanceAfter: balance.balance,
        description,
        invoiceId: options?.invoiceId,
        performedById: options?.performedById,
        organizationId: dbOrgId,
      },
    })
  })
}

/**
 * Snapshot current resource counts into the usage record.
 * Called at period start or when billing context is first created.
 */
export async function snapshotResourceCounts(
  dbOrgId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const [documentsCount, usersCount, standardsCount] = await Promise.all([
    db.document.count({ where: { organizationId: dbOrgId } }),
    db.organizationUser.count({ where: { organizationId: dbOrgId, isActive: true } }),
    db.standard.count({ where: { isActive: true } }),
  ])

  await db.usageRecord.upsert({
    where: {
      organizationId_periodStart: {
        organizationId: dbOrgId,
        periodStart,
      },
    },
    create: {
      organizationId: dbOrgId,
      periodStart,
      periodEnd,
      documentsCount,
      usersCount,
      standardsCount,
      aiClassificationsUsed: 0,
    },
    update: {
      documentsCount,
      usersCount,
      standardsCount,
    },
  })
}

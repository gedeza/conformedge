"use server"

import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext } from "@/lib/billing"
import type { BillingContext } from "@/types"

export async function getBillingPageData(): Promise<{
  billing: BillingContext
  orgName: string
  creditTransactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: Date
  }>
  invoices: Array<{
    id: string
    totalCents: number
    status: string
    periodStart: Date
    periodEnd: Date
    paidAt: Date | null
    createdAt: Date
  }>
}> {
  const { dbOrgId } = await getAuthContext()

  const [billing, org, creditTransactions, invoices] = await Promise.all([
    getBillingContext(dbOrgId),
    db.organization.findUnique({
      where: { id: dbOrgId },
      select: { name: true },
    }),
    db.creditTransaction.findMany({
      where: { organizationId: dbOrgId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceAfter: true,
        description: true,
        createdAt: true,
      },
    }),
    db.invoice.findMany({
      where: { organizationId: dbOrgId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        totalCents: true,
        status: true,
        periodStart: true,
        periodEnd: true,
        paidAt: true,
        createdAt: true,
      },
    }),
  ])

  return {
    billing,
    orgName: org?.name ?? "Organization",
    creditTransactions,
    invoices,
  }
}

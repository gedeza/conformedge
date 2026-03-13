"use client"

import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { INVOICE_STATUSES } from "@/lib/constants"
import { formatZar } from "@/lib/billing/plans"

interface InvoiceHistoryCardProps {
  invoices: Array<{
    id: string
    totalCents: number
    status: string
    periodStart: Date
    periodEnd: Date
    paidAt: Date | null
    dueAt?: Date
    createdAt: Date
  }>
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function InvoiceHistoryCard({ invoices }: InvoiceHistoryCardProps) {
  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Invoice History</CardTitle>
        <CardDescription>Your billing history and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No invoices yet. Invoices will appear here after your first payment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Period</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Due</th>
                  <th className="pb-2 font-medium">Paid</th>
                  <th className="pb-2 font-medium">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv) => {
                  const statusInfo =
                    INVOICE_STATUSES[inv.status as keyof typeof INVOICE_STATUSES]

                  const isOverdue = inv.status === "OPEN" && inv.dueAt && new Date(inv.dueAt) < new Date()

                  return (
                    <tr key={inv.id} className={isOverdue ? "bg-red-50 dark:bg-red-950/20" : ""}>
                      <td className="py-2.5">
                        {formatDate(inv.periodStart)} — {formatDate(inv.periodEnd)}
                      </td>
                      <td className="py-2.5 font-medium">{formatZar(inv.totalCents)}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={isOverdue ? "bg-red-100 text-red-800" : statusInfo?.color ?? ""}>
                          {isOverdue ? "Overdue" : statusInfo?.label ?? inv.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {inv.dueAt ? formatDate(inv.dueAt) : "—"}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {inv.paidAt ? formatDate(inv.paidAt) : "—"}
                      </td>
                      <td className="py-2.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          asChild
                        >
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            download
                            title="Download invoice PDF"
                          >
                            <Download className="size-3.5" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

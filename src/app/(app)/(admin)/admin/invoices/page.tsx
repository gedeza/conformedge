import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Receipt } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { INVOICE_STATUSES, PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { getAdminInvoices } from "./actions"
import { InvoiceActions } from "./invoice-actions"
import { InvoicesHelpPanel } from "./invoices-help-panel"
import Link from "next/link"

export default async function AdminInvoicesPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const invoices = await getAdminInvoices()

  const openCount = invoices.filter((i) => i.status === "OPEN").length
  const overdueCount = invoices.filter(
    (i) => i.status === "OPEN" && new Date(i.dueAt) < new Date()
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Invoices"
        description={`${invoices.length} invoices — ${openCount} open${overdueCount > 0 ? `, ${overdueCount} overdue` : ""}`}
      >
        <InvoicesHelpPanel />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            All Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Organization</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Payment Method</th>
                    <th className="pb-2 font-medium">Due Date</th>
                    <th className="pb-2 font-medium">Period</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => {
                    const statusInfo =
                      INVOICE_STATUSES[inv.status as keyof typeof INVOICE_STATUSES]
                    const isOverdue = inv.status === "OPEN" && new Date(inv.dueAt) < new Date()
                    const pm = inv.organization.subscription?.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS | undefined
                    const pmInfo = pm ? PAYMENT_METHOD_LABELS[pm] : null

                    return (
                      <tr key={inv.id} className={isOverdue ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <td className="py-2.5">
                          <Link
                            href={`/admin/organizations/${inv.organization.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {inv.organization.name}
                          </Link>
                        </td>
                        <td className="py-2.5 font-medium">{formatZar(inv.totalCents)}</td>
                        <td className="py-2.5">
                          <Badge variant="outline" className={statusInfo?.color ?? ""}>
                            {isOverdue ? "Overdue" : statusInfo?.label ?? inv.status}
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          {pmInfo && (
                            <Badge variant="outline" className={pmInfo.color}>
                              {pmInfo.label}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {format(new Date(inv.dueAt), "dd MMM yyyy")}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {format(new Date(inv.periodStart), "dd MMM")} —{" "}
                          {format(new Date(inv.periodEnd), "dd MMM yyyy")}
                        </td>
                        <td className="py-2.5">
                          {inv.status === "OPEN" && (
                            <InvoiceActions invoiceId={inv.id} />
                          )}
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
    </div>
  )
}

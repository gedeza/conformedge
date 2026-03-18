import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { ClipboardList, Plus } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { QUOTATION_STATUSES } from "@/lib/constants"
import { getAdminQuotations } from "./actions"
import Link from "next/link"

export default async function AdminQuotationsPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const quotations = await getAdminQuotations()

  const draftCount = quotations.filter((q) => q.status === "DRAFT").length
  const sentCount = quotations.filter((q) => q.status === "SENT").length

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Quotations"
        description={`${quotations.length} quotations — ${draftCount} drafts, ${sentCount} pending`}
      >
        <Button asChild>
          <Link href="/admin/quotations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            All Quotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No quotations yet. Create your first quotation.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Valid Until</th>
                    <th className="pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotations.map((q) => {
                    const statusInfo =
                      QUOTATION_STATUSES[q.status as keyof typeof QUOTATION_STATUSES]
                    const isExpired =
                      q.status === "SENT" && new Date(q.validUntil) < new Date()

                    return (
                      <tr
                        key={q.id}
                        className={isExpired ? "bg-orange-50 dark:bg-orange-950/20" : ""}
                      >
                        <td className="py-2.5">
                          <Link
                            href={`/admin/quotations/${q.id}`}
                            className="font-mono text-xs font-medium text-primary hover:underline"
                          >
                            {q.quotationNumber}
                          </Link>
                          {q.invoiceNumber && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              → {q.invoiceNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/admin/quotations/${q.id}`}
                            className="font-medium hover:underline"
                          >
                            {q.clientName}
                          </Link>
                          {q.clientCompany && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({q.clientCompany})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 font-medium">
                          {formatZar(q.totalCents)}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant="outline"
                            className={
                              isExpired
                                ? "bg-orange-100 text-orange-800"
                                : statusInfo?.color ?? ""
                            }
                          >
                            {isExpired ? "Expired" : statusInfo?.label ?? q.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {format(new Date(q.validUntil), "dd MMM yyyy")}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {format(new Date(q.createdAt), "dd MMM yyyy")}
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

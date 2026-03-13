import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import {
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Download,
  ArrowLeft,
  Banknote,
} from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { INVOICE_STATUSES, PAYMENT_METHOD_LABELS, ACCOUNT_TRANSACTION_TYPES } from "@/lib/constants"
import { getAdminInvoiceDetail } from "../actions"
import { InvoiceActions } from "../invoice-actions"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminInvoiceDetailPage({ params }: Props) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { id } = await params
  const invoice = await getAdminInvoiceDetail(id)
  if (!invoice) redirect("/admin/invoices")

  const statusInfo = INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES]
  const isOverdue = invoice.status === "OPEN" && new Date(invoice.dueAt) < new Date()
  const pm = invoice.organization.subscription?.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS | undefined
  const pmInfo = pm ? PAYMENT_METHOD_LABELS[pm] : null

  const lineItems = invoice.lineItems as Array<{
    description: string
    unitPriceCents: number
    totalCents: number
    quantity?: number
  }> | null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          heading={`Invoice — ${invoice.organization.name}`}
          description={`${format(new Date(invoice.periodStart), "dd MMM yyyy")} — ${format(new Date(invoice.periodEnd), "dd MMM yyyy")}`}
        />
      </div>

      {/* Status Banner */}
      {isOverdue && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200">
          This invoice is overdue. Due date was {format(new Date(invoice.dueAt), "dd MMM yyyy")}.
        </div>
      )}

      {/* Key Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Total Amount
            </div>
            <p className="mt-1 text-2xl font-bold">{formatZar(invoice.totalCents)}</p>
            <p className="text-xs text-muted-foreground">
              {formatZar(invoice.amountCents)} + {formatZar(invoice.vatCents)} VAT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Status
            </div>
            <div className="mt-2">
              <Badge
                variant="outline"
                className={isOverdue ? "bg-red-100 text-red-800" : statusInfo?.color ?? ""}
              >
                {isOverdue ? "Overdue" : statusInfo?.label ?? invoice.status}
              </Badge>
            </div>
            {invoice.paidAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Paid {format(new Date(invoice.paidAt), "dd MMM yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due Date
            </div>
            <p className="mt-1 text-lg font-bold">
              {format(new Date(invoice.dueAt), "dd MMM yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoice.billingCycle} billing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </div>
            <div className="mt-2">
              {pmInfo ? (
                <Badge variant="outline" className={pmInfo.color}>
                  {pmInfo.label}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Not set</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization + Actions Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label="Name" value={invoice.organization.name} />
            <Row label="Slug" value={invoice.organization.slug} />
            {invoice.organization.subscription && (
              <>
                <Row label="Plan" value={invoice.organization.subscription.plan} />
                <Row label="Billing Cycle" value={invoice.organization.subscription.billingCycle} />
                {invoice.organization.subscription.paymentTermsDays && (
                  <Row label="Payment Terms" value={`Net ${invoice.organization.subscription.paymentTermsDays} days`} />
                )}
              </>
            )}
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/organizations/${invoice.organization.id}`}>
                  View Organization
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`/api/invoices/${invoice.id}/pdf`} download title="Download invoice PDF">
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </Button>
              {invoice.status === "OPEN" && (
                <InvoiceActions invoiceId={invoice.id} />
              )}
            </div>

            {invoice.bankReference && (
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Bank Reference:</span>
                  <span className="font-mono">{invoice.bankReference}</span>
                </div>
              </div>
            )}

            {invoice.externalPaymentId && (
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Payment ID:</span>
                  <span className="font-mono text-xs">{invoice.externalPaymentId}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {lineItems && lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right text-muted-foreground">{item.quantity ?? 1}</td>
                    <td className="py-2 text-right font-medium">{formatZar(item.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <td colSpan={2} className="py-2 text-right text-muted-foreground">Subtotal</td>
                  <td className="py-2 text-right font-medium">{formatZar(invoice.amountCents)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-1 text-right text-muted-foreground">VAT (15%)</td>
                  <td className="py-1 text-right">{formatZar(invoice.vatCents)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={2} className="py-2 text-right">Total</td>
                  <td className="py-2 text-right">{formatZar(invoice.totalCents)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Related Transactions */}
      {invoice.accountTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoice.accountTransactions.map((tx) => {
                const txInfo = ACCOUNT_TRANSACTION_TYPES[tx.type as keyof typeof ACCOUNT_TRANSACTION_TYPES]
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded border p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={txInfo?.color ?? ""}>
                        {txInfo?.label ?? tx.type}
                      </Badge>
                      <span className="text-muted-foreground">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatZar(Math.abs(tx.amountCents))}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "dd MMM yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="Invoice ID" value={invoice.id} />
          <Row label="Created" value={format(new Date(invoice.createdAt), "dd MMM yyyy HH:mm")} />
          <Row label="Updated" value={format(new Date(invoice.updatedAt), "dd MMM yyyy HH:mm")} />
          <Row label="Period" value={`${format(new Date(invoice.periodStart), "dd MMM yyyy")} — ${format(new Date(invoice.periodEnd), "dd MMM yyyy")}`} />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

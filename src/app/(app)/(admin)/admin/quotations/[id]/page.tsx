import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import {
  ClipboardList,
  Calendar,
  Download,
  ArrowLeft,
  Banknote,
  User2,
  Building2,
  Pencil,
} from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { formatZar } from "@/lib/billing/plans"
import { QUOTATION_STATUSES } from "@/lib/constants"
import { getAdminQuotationDetail } from "../actions"
import { QuotationActions } from "../quotation-actions"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuotationDetailPage({ params }: Props) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { id } = await params
  const quotation = await getAdminQuotationDetail(id)
  if (!quotation) redirect("/admin/quotations")

  const statusInfo = QUOTATION_STATUSES[quotation.status as keyof typeof QUOTATION_STATUSES]
  const isExpired = quotation.status === "SENT" && new Date(quotation.validUntil) < new Date()

  const lineItems = quotation.lineItems as Array<{
    description: string
    quantity: number
    unitPriceCents: number
    totalCents: number
  }>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quotations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          heading={`${quotation.quotationNumber}`}
          description={`${quotation.clientName}${quotation.clientCompany ? ` — ${quotation.clientCompany}` : ""}`}
        />
      </div>

      {/* Expired banner */}
      {isExpired && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950/20 dark:text-orange-200">
          This quotation has expired. Valid until was {format(new Date(quotation.validUntil), "dd MMM yyyy")}.
        </div>
      )}

      {/* Key Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardList className="h-4 w-4" />
              Total Amount
            </div>
            <p className="mt-1 text-2xl font-bold">{formatZar(quotation.totalCents)}</p>
            <p className="text-xs text-muted-foreground">
              {formatZar(quotation.subtotalCents)}
              {quotation.discountCents ? ` - ${formatZar(quotation.discountCents)} discount` : ""}
              {" "}+ {formatZar(quotation.vatCents)} VAT
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
                className={isExpired ? "bg-orange-100 text-orange-800" : statusInfo?.color ?? ""}
              >
                {isExpired ? "Expired" : statusInfo?.label ?? quotation.status}
              </Badge>
            </div>
            {quotation.paidAt && (
              <p className="mt-1 text-xs text-green-600">
                Paid {format(new Date(quotation.paidAt), "dd MMM yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Valid Until
            </div>
            <p className="mt-1 text-lg font-bold">
              {format(new Date(quotation.validUntil), "dd MMM yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              Issued {format(new Date(quotation.issuedAt), "dd MMM yyyy")}
            </p>
          </CardContent>
        </Card>

        {quotation.depositPercent && quotation.depositCents ? (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                Deposit ({quotation.depositPercent}%)
              </div>
              <p className="mt-1 text-lg font-bold text-amber-700">
                {formatZar(quotation.depositCents)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User2 className="h-4 w-4" />
                Created By
              </div>
              <p className="mt-1 text-sm font-medium">
                {quotation.createdBy.firstName} {quotation.createdBy.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(quotation.createdAt), "dd MMM yyyy")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Client + Actions row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label="Name" value={quotation.clientName} />
            {quotation.clientCompany && <Row label="Company" value={quotation.clientCompany} />}
            {quotation.clientEmail && <Row label="Email" value={quotation.clientEmail} />}
            {quotation.clientPhone && <Row label="Phone" value={quotation.clientPhone} />}
            {quotation.clientAddress && <Row label="Address" value={quotation.clientAddress} />}
            {quotation.clientVatNumber && <Row label="VAT Number" value={quotation.clientVatNumber} />}
            {quotation.clientRegNumber && <Row label="Reg. Number" value={quotation.clientRegNumber} />}
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
                <a
                  href={`/api/quotations/${quotation.id}/pdf`}
                  download
                  title={quotation.status === "INVOICED" ? "Download Proforma Invoice PDF" : "Download Quotation PDF"}
                >
                  <Download className="h-3.5 w-3.5" />
                  {quotation.status === "INVOICED" ? "Download Invoice PDF" : "Download Quotation PDF"}
                </a>
              </Button>
              {quotation.status === "DRAFT" && (
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href={`/admin/quotations/${quotation.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
            <QuotationActions quotationId={quotation.id} status={quotation.status} />

            {quotation.invoiceNumber && (
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Invoice Number:</span>
                  <span className="font-mono">{quotation.invoiceNumber}</span>
                </div>
              </div>
            )}

            {quotation.bankReference && (
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Bank Reference:</span>
                  <span className="font-mono">{quotation.bankReference}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
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
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right text-muted-foreground">{item.quantity}</td>
                  <td className="py-2 text-right text-muted-foreground">{formatZar(item.unitPriceCents)}</td>
                  <td className="py-2 text-right font-medium">{formatZar(item.totalCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t">
              <tr>
                <td colSpan={3} className="py-2 text-right text-muted-foreground">Subtotal</td>
                <td className="py-2 text-right font-medium">{formatZar(quotation.subtotalCents)}</td>
              </tr>
              {quotation.discountCents ? (
                <tr>
                  <td colSpan={3} className="py-1 text-right text-green-700">
                    {quotation.discountLabel || "Discount"}
                  </td>
                  <td className="py-1 text-right text-green-700">-{formatZar(quotation.discountCents)}</td>
                </tr>
              ) : null}
              <tr>
                <td colSpan={3} className="py-1 text-right text-muted-foreground">VAT (15%)</td>
                <td className="py-1 text-right">{formatZar(quotation.vatCents)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan={3} className="py-2 text-right">Total (incl. VAT)</td>
                <td className="py-2 text-right">{formatZar(quotation.totalCents)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Notes */}
      {quotation.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="ID" value={quotation.id} />
          <Row label="Created" value={format(new Date(quotation.createdAt), "dd MMM yyyy HH:mm")} />
          <Row label="Updated" value={format(new Date(quotation.updatedAt), "dd MMM yyyy HH:mm")} />
          {quotation.sentAt && <Row label="Sent" value={format(new Date(quotation.sentAt), "dd MMM yyyy HH:mm")} />}
          {quotation.acceptedAt && <Row label="Accepted" value={format(new Date(quotation.acceptedAt), "dd MMM yyyy HH:mm")} />}
          {quotation.invoicedAt && <Row label="Invoiced" value={format(new Date(quotation.invoicedAt), "dd MMM yyyy HH:mm")} />}
          {quotation.paidAt && <Row label="Paid" value={format(new Date(quotation.paidAt), "dd MMM yyyy HH:mm")} />}
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

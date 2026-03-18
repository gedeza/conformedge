import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getAdminQuotationDetail } from "../../actions"
import { QuotationForm } from "../../quotation-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditQuotationPage({ params }: Props) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { id } = await params
  const quotation = await getAdminQuotationDetail(id)
  if (!quotation) redirect("/admin/quotations")
  if (quotation.status !== "DRAFT") redirect(`/admin/quotations/${id}`)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/quotations/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          heading={`Edit ${quotation.quotationNumber}`}
          description={`${quotation.clientName}${quotation.clientCompany ? ` — ${quotation.clientCompany}` : ""}`}
        />
      </div>
      <QuotationForm quotation={quotation} />
    </div>
  )
}

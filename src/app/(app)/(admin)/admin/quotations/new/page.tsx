import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { QuotationForm } from "../quotation-form"

export default async function NewQuotationPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quotations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          heading="New Quotation"
          description="Create a quotation for an external client"
        />
      </div>
      <QuotationForm />
    </div>
  )
}

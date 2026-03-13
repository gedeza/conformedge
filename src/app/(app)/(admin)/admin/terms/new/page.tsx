import { getSuperAdminContext } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { TermsForm } from "../terms-form"

export default async function NewTermsVersionPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  return (
    <div className="space-y-6">
      <PageHeader
        heading="New Terms Version"
        description="Create a new draft terms version"
      />
      <TermsForm />
    </div>
  )
}

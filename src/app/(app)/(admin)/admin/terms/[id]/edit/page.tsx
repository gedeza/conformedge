import { notFound, redirect } from "next/navigation"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { PageHeader } from "@/components/shared/page-header"
import { getTermsVersion } from "../../actions"
import { TermsForm } from "../../terms-form"

export default async function EditTermsVersionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { id } = await params
  const version = await getTermsVersion(id)
  if (!version) notFound()
  if (version.status !== "DRAFT") redirect(`/admin/terms/${id}`)

  return (
    <div className="space-y-6">
      <PageHeader
        heading={`Edit v${version.version}`}
        description={version.title}
      />
      <TermsForm
        initialData={{
          id: version.id,
          version: version.version,
          title: version.title,
          content: version.content,
          summary: version.summary,
          effectiveAt: version.effectiveAt,
        }}
      />
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { HardHat } from "lucide-react"
import { getSubcontractors } from "./actions"
import { SubcontractorTable } from "./subcontractor-table"
import { SubcontractorFormTrigger } from "./subcontractor-form-trigger"
import { getAuthContext } from "@/lib/auth"

export default async function SubcontractorsPage() {
  let subcontractors: Awaited<ReturnType<typeof getSubcontractors>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    subcontractors = await getSubcontractors()
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Subcontractors" description="Monitor subcontractor compliance and certifications" />
        <EmptyState
          icon={HardHat}
          title="Organization required"
          description="Please select or create an organization to manage subcontractors."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Subcontractors" description="Monitor subcontractor compliance and certifications">
        <SubcontractorFormTrigger role={role} />
      </PageHeader>
      {subcontractors.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No subcontractors yet"
          description="Add subcontractors to track their certifications and compliance status."
        >
          <SubcontractorFormTrigger role={role} />
        </EmptyState>
      ) : (
        <SubcontractorTable data={subcontractors} role={role} />
      )}
    </div>
  )
}

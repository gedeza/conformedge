import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { AlertTriangle } from "lucide-react"
import { getCapas, getProjectOptions, getMembers } from "./actions"
import { CapaTable } from "./capa-table"
import { CapaFormTrigger } from "./capa-form-trigger"
import { getAuthContext } from "@/lib/auth"

export default async function CAPAsPage() {
  let capas: Awaited<ReturnType<typeof getCapas>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[capas, projects, members] = await Promise.all([getCapas(), getProjectOptions(), getMembers()])
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="CAPAs" description="Track corrective and preventive actions" />
        <EmptyState icon={AlertTriangle} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="CAPAs" description="Track corrective and preventive actions">
        <CapaFormTrigger projects={projects} members={members} role={role} />
      </PageHeader>
      {capas.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No CAPAs yet" description="Create corrective or preventive actions to address compliance gaps.">
          <CapaFormTrigger projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <CapaTable data={capas} projects={projects} members={members} role={role} />
      )}
    </div>
  )
}

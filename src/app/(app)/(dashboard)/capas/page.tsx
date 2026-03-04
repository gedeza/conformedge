import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { AlertTriangle } from "lucide-react"
import { getCapas, getProjectOptions, getMembers } from "./actions"
import { CapaTable } from "./capa-table"
import { CapaFormTrigger } from "./capa-form-trigger"
import { CapasHelpPanel } from "./capas-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CAPAsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let capas: Awaited<ReturnType<typeof getCapas>>["capas"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, projList, memberList] = await Promise.all([
      getCapas(page), getProjectOptions(), getMembers(),
    ])
    capas = result.capas
    pagination = result.pagination
    projects = projList
    members = memberList
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
        <CapasHelpPanel />
        <CapaFormTrigger projects={projects} members={members} role={role} />
      </PageHeader>
      {capas.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={AlertTriangle} title="No CAPAs yet" description="Create corrective or preventive actions to address compliance gaps.">
          <CapaFormTrigger projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <>
          <CapaTable data={capas} projects={projects} members={members} role={role} />
          <Pagination {...pagination} basePath="/capas" />
        </>
      )}
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { Siren } from "lucide-react"
import { getIncidents, getProjectOptions, getMembers } from "./actions"
import { IncidentTable } from "./incident-table"
import { IncidentFormTrigger } from "./incident-form-trigger"
import { IncidentsHelpPanel } from "./incidents-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IncidentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const statusFilter = typeof params.status === "string" ? params.status : undefined
  const typeFilter = typeof params.type === "string" ? params.type : undefined
  const severityFilter = typeof params.severity === "string" ? params.severity : undefined
  const projectFilter = typeof params.projectId === "string" ? params.projectId : undefined

  let incidents: Awaited<ReturnType<typeof getIncidents>>["incidents"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, projList, memberList] = await Promise.all([
      getIncidents(page, { status: statusFilter, type: typeFilter, severity: severityFilter, projectId: projectFilter }),
      getProjectOptions(), getMembers(),
    ])
    incidents = result.incidents
    pagination = result.pagination
    projects = projList
    members = memberList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Incidents" description="Report and track workplace incidents and near-misses" />
        <EmptyState icon={Siren} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Incidents" description="Report and track workplace incidents and near-misses">
        <IncidentsHelpPanel />
        <IncidentFormTrigger projects={projects} members={members} role={role} />
      </PageHeader>
      {incidents.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={Siren} title="No incidents reported" description="Report workplace incidents and near-misses to track safety performance.">
          <IncidentFormTrigger projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <>
          <IncidentTable data={incidents} projects={projects} members={members} role={role} />
          <Pagination {...pagination} basePath="/incidents" />
        </>
      )}
    </div>
  )
}

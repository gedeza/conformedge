import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { ShieldCheck } from "lucide-react"
import { getPermits, getProjectOptions, getMembers } from "./actions"
import { PermitTable } from "./permit-table"
import { PermitFormTrigger } from "./permit-form-trigger"
import { PermitsHelpPanel } from "./permits-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PermitsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let permits: Awaited<ReturnType<typeof getPermits>>["permits"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, projList, memberList] = await Promise.all([
      getPermits(page), getProjectOptions(), getMembers(),
    ])
    permits = result.permits
    pagination = result.pagination
    projects = projList
    members = memberList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Work Permits" description="Permit to Work (PTW) management for high-risk activities" />
        <EmptyState icon={ShieldCheck} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Work Permits" description="Permit to Work (PTW) management for high-risk activities">
        <PermitsHelpPanel />
        <PermitFormTrigger projects={projects} members={members} role={role} />
      </PageHeader>
      {permits.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={ShieldCheck} title="No work permits" description="Create work permits to control and authorize high-risk activities on site.">
          <PermitFormTrigger projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <>
          <PermitTable data={permits} projects={projects} members={members} role={role} />
          <Pagination {...pagination} basePath="/permits" />
        </>
      )}
    </div>
  )
}

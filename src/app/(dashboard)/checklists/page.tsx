import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { CheckSquare } from "lucide-react"
import { getChecklists, getStandards, getProjectOptions, getMembers, getTemplates } from "./actions"
import { ChecklistTable } from "./checklist-table"
import { ChecklistFormTrigger } from "./checklist-form-trigger"
import { TemplatePicker } from "./template-picker"
import { RecurringSchedulesCard } from "./recurring-schedules-card"
import { ChecklistsHelpPanel } from "./checklists-help-panel"
import { getAuthContext } from "@/lib/auth"
import { canCreate } from "@/lib/permissions"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ChecklistsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let checklists: Awaited<ReturnType<typeof getChecklists>>["checklists"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let standards: Awaited<ReturnType<typeof getStandards>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let templates: Awaited<ReturnType<typeof getTemplates>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, stdList, projList, memberList, templateList] = await Promise.all([
      getChecklists(page), getStandards(), getProjectOptions(), getMembers(), getTemplates(),
    ])
    checklists = result.checklists
    pagination = result.pagination
    standards = stdList
    projects = projList
    members = memberList
    templates = templateList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Checklists" description="Manage compliance checklists per standard" />
        <EmptyState icon={CheckSquare} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Checklists" description="Manage compliance checklists per standard">
        <div className="flex items-center gap-2">
          <ChecklistsHelpPanel />
          {canCreate(role) && <TemplatePicker templates={templates} projects={projects} members={members} role={role} />}
          <ChecklistFormTrigger standards={standards} projects={projects} members={members} role={role} />
        </div>
      </PageHeader>
      <RecurringSchedulesCard />

      {checklists.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists yet" description="Create standard-specific checklists to track compliance items.">
          <ChecklistFormTrigger standards={standards} projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <>
          <ChecklistTable data={checklists} standards={standards} projects={projects} members={members} role={role} />
          <Pagination {...pagination} basePath="/checklists" />
        </>
      )}
    </div>
  )
}

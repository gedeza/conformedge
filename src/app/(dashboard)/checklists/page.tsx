import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CheckSquare } from "lucide-react"
import { getChecklists, getStandards, getProjectOptions, getMembers, getTemplates } from "./actions"
import { ChecklistTable } from "./checklist-table"
import { ChecklistFormTrigger } from "./checklist-form-trigger"
import { TemplatePicker } from "./template-picker"
import { getAuthContext } from "@/lib/auth"
import { canCreate } from "@/lib/permissions"

export default async function ChecklistsPage() {
  let checklists: Awaited<ReturnType<typeof getChecklists>> = []
  let standards: Awaited<ReturnType<typeof getStandards>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let templates: Awaited<ReturnType<typeof getTemplates>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[checklists, standards, projects, members, templates] = await Promise.all([
      getChecklists(), getStandards(), getProjectOptions(), getMembers(), getTemplates(),
    ])
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
          {canCreate(role) && <TemplatePicker templates={templates} projects={projects} members={members} role={role} />}
          <ChecklistFormTrigger standards={standards} projects={projects} members={members} role={role} />
        </div>
      </PageHeader>
      {checklists.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists yet" description="Create standard-specific checklists to track compliance items.">
          <ChecklistFormTrigger standards={standards} projects={projects} members={members} role={role} />
        </EmptyState>
      ) : (
        <ChecklistTable data={checklists} standards={standards} projects={projects} members={members} role={role} />
      )}
    </div>
  )
}

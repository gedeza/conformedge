import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CheckSquare } from "lucide-react"
import { getChecklists, getStandards, getProjectOptions, getMembers } from "./actions"
import { ChecklistTable } from "./checklist-table"
import { ChecklistFormTrigger } from "./checklist-form-trigger"

export default async function ChecklistsPage() {
  let checklists: Awaited<ReturnType<typeof getChecklists>> = []
  let standards: Awaited<ReturnType<typeof getStandards>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let authError = false

  try {
    ;[checklists, standards, projects, members] = await Promise.all([
      getChecklists(), getStandards(), getProjectOptions(), getMembers(),
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
        <ChecklistFormTrigger standards={standards} projects={projects} members={members} />
      </PageHeader>
      {checklists.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists yet" description="Create standard-specific checklists to track compliance items.">
          <ChecklistFormTrigger standards={standards} projects={projects} members={members} />
        </EmptyState>
      ) : (
        <ChecklistTable data={checklists} standards={standards} projects={projects} members={members} />
      )}
    </div>
  )
}

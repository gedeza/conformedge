import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { FolderKanban } from "lucide-react"
import { getProjects } from "./actions"
import { ProjectTable } from "./project-table"
import { ProjectFormTrigger } from "./project-form-trigger"
import { getAuthContext } from "@/lib/auth"

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    projects = await getProjects()
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Projects" description="Manage your compliance projects" />
        <EmptyState
          icon={FolderKanban}
          title="Organization required"
          description="Please select or create an organization to manage projects."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Projects" description="Manage your compliance projects">
        <ProjectFormTrigger role={role} />
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking compliance."
        >
          <ProjectFormTrigger role={role} />
        </EmptyState>
      ) : (
        <ProjectTable data={projects} role={role} />
      )}
    </div>
  )
}

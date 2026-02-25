import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"
import { getProjects } from "./actions"
import { ProjectTable } from "./project-table"
import { ProjectFormTrigger } from "./project-form-trigger"

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  let authError = false

  try {
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
        <ProjectFormTrigger />
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking compliance."
        >
          <ProjectFormTrigger />
        </EmptyState>
      ) : (
        <ProjectTable data={projects} />
      )}
    </div>
  )
}

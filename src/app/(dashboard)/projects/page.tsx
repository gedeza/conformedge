import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Projects" description="Manage your compliance projects">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to start tracking compliance."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </EmptyState>
    </div>
  )
}

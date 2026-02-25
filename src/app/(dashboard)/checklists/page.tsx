import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { CheckSquare, Plus } from "lucide-react"

export default function ChecklistsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Checklists" description="Manage compliance checklists per standard">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Checklist
        </Button>
      </PageHeader>
      <EmptyState
        icon={CheckSquare}
        title="No checklists yet"
        description="Create standard-specific checklists to track compliance items and evidence."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Checklist
        </Button>
      </EmptyState>
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { HardHat, Plus } from "lucide-react"

export default function SubcontractorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Subcontractors" description="Monitor subcontractor compliance and certifications">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subcontractor
        </Button>
      </PageHeader>
      <EmptyState
        icon={HardHat}
        title="No subcontractors yet"
        description="Add subcontractors to track their certifications, safety ratings, and compliance status."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subcontractor
        </Button>
      </EmptyState>
    </div>
  )
}

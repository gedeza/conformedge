import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus } from "lucide-react"

export default function CAPAsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="CAPAs" description="Track corrective and preventive actions">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New CAPA
        </Button>
      </PageHeader>
      <EmptyState
        icon={AlertTriangle}
        title="No CAPAs yet"
        description="Create corrective or preventive actions to address compliance gaps."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create CAPA
        </Button>
      </EmptyState>
    </div>
  )
}

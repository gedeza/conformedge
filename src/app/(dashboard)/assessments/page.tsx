import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Plus } from "lucide-react"

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Assessments" description="Conduct gap assessments against ISO standards">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </PageHeader>
      <EmptyState
        icon={ClipboardCheck}
        title="No assessments yet"
        description="Create an assessment to identify compliance gaps against ISO standard clauses."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Start Assessment
        </Button>
      </EmptyState>
    </div>
  )
}

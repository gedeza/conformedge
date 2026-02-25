import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Reports" description="View compliance analytics and reports" />
      <EmptyState
        icon={BarChart3}
        title="No reports available"
        description="Reports will be generated as you add projects, documents, and assessments."
      />
    </div>
  )
}

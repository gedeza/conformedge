import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"

export default function AuditPacksPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Audit Packs" description="Generate and manage audit evidence packs">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Audit Pack
        </Button>
      </PageHeader>
      <EmptyState
        icon={Package}
        title="No audit packs yet"
        description="Generate audit packs that compile all required evidence and documentation."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Audit Pack
        </Button>
      </EmptyState>
    </div>
  )
}

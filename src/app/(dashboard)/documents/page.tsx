import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { FileText, Upload } from "lucide-react"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Documents" description="Upload and classify compliance documents">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </PageHeader>
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Upload documents for AI-powered classification against ISO standards."
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </EmptyState>
    </div>
  )
}

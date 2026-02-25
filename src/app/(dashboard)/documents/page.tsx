import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { FileText } from "lucide-react"
import { getDocuments, getProjectOptions } from "./actions"
import { DocumentTable } from "./document-table"
import { DocumentFormTrigger } from "./document-form-trigger"

export default async function DocumentsPage() {
  let documents: Awaited<ReturnType<typeof getDocuments>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let authError = false

  try {
    ;[documents, projects] = await Promise.all([getDocuments(), getProjectOptions()])
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Documents" description="Upload and classify compliance documents" />
        <EmptyState
          icon={FileText}
          title="Organization required"
          description="Please select or create an organization to manage documents."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Documents" description="Upload and classify compliance documents">
        <DocumentFormTrigger projects={projects} />
      </PageHeader>
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload documents for AI-powered classification against ISO standards."
        >
          <DocumentFormTrigger projects={projects} />
        </EmptyState>
      ) : (
        <DocumentTable data={documents} projects={projects} />
      )}
    </div>
  )
}

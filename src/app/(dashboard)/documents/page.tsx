import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { FileText } from "lucide-react"
import { getDocuments, getProjectOptions } from "./actions"
import { DocumentTable } from "./document-table"
import { DocumentFormTrigger } from "./document-form-trigger"
import { BulkUploadButton } from "./bulk-upload-button"
import { DocumentsHelpPanel } from "./documents-help-panel"
import { getAuthContext } from "@/lib/auth"
import { canCreate } from "@/lib/permissions"
import { getOrgAutoClassify } from "@/lib/ai/auto-classify"
import { db } from "@/lib/db"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let documents: Awaited<ReturnType<typeof getDocuments>>["documents"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let role = "VIEWER"
  let autoClassify = false
  let hasWorkflowTemplates = false
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, projectList, autoClassifySetting, templateCount] = await Promise.all([
      getDocuments(page),
      getProjectOptions(),
      getOrgAutoClassify(ctx.dbOrgId),
      db.approvalWorkflowTemplate.count({ where: { organizationId: ctx.dbOrgId } }),
    ])
    documents = result.documents
    pagination = result.pagination
    projects = projectList
    autoClassify = autoClassifySetting
    hasWorkflowTemplates = templateCount > 0
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
        <div className="flex items-center gap-2">
          <DocumentsHelpPanel />
          {canCreate(role) && <BulkUploadButton projects={projects} autoClassify={autoClassify} />}
          <DocumentFormTrigger projects={projects} role={role} autoClassify={autoClassify} hasWorkflowTemplates={hasWorkflowTemplates} />
        </div>
      </PageHeader>
      {documents.length === 0 && pagination.total === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload documents for AI-powered classification against ISO standards."
        >
          <DocumentFormTrigger projects={projects} role={role} autoClassify={autoClassify} hasWorkflowTemplates={hasWorkflowTemplates} />
        </EmptyState>
      ) : (
        <>
          <DocumentTable data={documents} projects={projects} role={role} />
          <Pagination {...pagination} basePath="/documents" />
        </>
      )}
    </div>
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"
import { getAuditPacks, getProjectOptions } from "./actions"
import { AuditPackTable } from "./audit-pack-table"
import { AuditPackFormTrigger } from "./audit-pack-form-trigger"

export default async function AuditPacksPage() {
  let packs: Awaited<ReturnType<typeof getAuditPacks>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let authError = false

  try {
    ;[packs, projects] = await Promise.all([getAuditPacks(), getProjectOptions()])
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Audit Packs" description="Generate and manage audit evidence packs" />
        <EmptyState icon={Package} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Audit Packs" description="Generate and manage audit evidence packs">
        <AuditPackFormTrigger projects={projects} />
      </PageHeader>
      {packs.length === 0 ? (
        <EmptyState icon={Package} title="No audit packs yet" description="Create audit packs to compile evidence for compliance audits.">
          <AuditPackFormTrigger projects={projects} />
        </EmptyState>
      ) : (
        <AuditPackTable data={packs} />
      )}
    </div>
  )
}

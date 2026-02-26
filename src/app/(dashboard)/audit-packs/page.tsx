import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"
import { getAuditPacks, getProjectOptions } from "./actions"
import { AuditPackTable } from "./audit-pack-table"
import { AuditPackFormTrigger } from "./audit-pack-form-trigger"
import { getAuthContext } from "@/lib/auth"

export default async function AuditPacksPage() {
  let packs: Awaited<ReturnType<typeof getAuditPacks>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
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
        <AuditPackFormTrigger projects={projects} role={role} />
      </PageHeader>
      {packs.length === 0 ? (
        <EmptyState icon={Package} title="No audit packs yet" description="Create audit packs to compile evidence for compliance audits.">
          <AuditPackFormTrigger projects={projects} role={role} />
        </EmptyState>
      ) : (
        <AuditPackTable data={packs} role={role} />
      )}
    </div>
  )
}

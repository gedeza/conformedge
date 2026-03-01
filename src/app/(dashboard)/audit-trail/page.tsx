import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ScrollText } from "lucide-react"
import { getAuditEvents, getAuditFilterOptions } from "./actions"
import { AuditTrailTable } from "./audit-trail-table"
import { AuditTrailHelpPanel } from "./audit-trail-help-panel"
import type { AuditEventRow } from "./columns"

export default async function AuditTrailPage() {
  let events: AuditEventRow[] = []
  let pagination = { page: 1, pageSize: 25, total: 0, totalPages: 0 }
  let filterOptions = { actions: [] as string[], entityTypes: [] as string[], users: [] as { id: string; name: string }[] }
  let authError = false

  try {
    const [eventsResult, options] = await Promise.all([
      getAuditEvents(),
      getAuditFilterOptions(),
    ])
    events = eventsResult.events as unknown as AuditEventRow[]
    pagination = eventsResult.pagination
    filterOptions = options
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Audit Trail" description="Immutable log of all system actions" />
        <EmptyState icon={ScrollText} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Audit Trail" description="Immutable log of all system actions">
        <AuditTrailHelpPanel />
      </PageHeader>
      {events.length === 0 && pagination.total === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit events yet"
          description="Actions performed in the system will appear here automatically."
        />
      ) : (
        <AuditTrailTable
          initialEvents={events}
          initialPagination={pagination}
          filterOptions={filterOptions}
        />
      )}
    </div>
  )
}

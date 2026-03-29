import { ScrollText } from "lucide-react"
import { getAuthContext } from "@/lib/auth"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { getObligations, getObligationOptions, getObligationStats } from "./actions"
import { ObligationTable } from "./obligation-table"
import { ObligationFormTrigger } from "./obligation-form-trigger"
import { ObligationsHelpPanel } from "./obligations-help-panel"
import type { UserRole } from "@/types"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ObligationsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const statusFilter = typeof params.status === "string" ? params.status : undefined
  const typeFilter = typeof params.type === "string" ? params.type : undefined

  let obligations: Awaited<ReturnType<typeof getObligations>>["obligations"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let role: UserRole = "VIEWER"
  let options: Awaited<ReturnType<typeof getObligationOptions>> = { vendors: [], projects: [], members: [], clauses: [] }
  let stats = { total: 0, active: 0, expiringSoon: 0, expired: 0 }
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role as UserRole

    const [result, opts, st] = await Promise.all([
      getObligations(page, { status: statusFilter, obligationType: typeFilter }),
      getObligationOptions(),
      getObligationStats(),
    ])

    obligations = result.obligations
    pagination = result.pagination
    options = opts
    stats = st
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Compliance Obligations" description="Track regulatory obligations, agreements, licences, and permits." />
        <EmptyState
          icon={ScrollText}
          title="Authentication required"
          description="Please sign in and select an organisation to manage compliance obligations."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Compliance Obligations" description="Track regulatory obligations, agreements, licences, and permits.">
        <div className="flex items-center gap-2">
        <ObligationsHelpPanel />
        <ObligationFormTrigger
          vendors={options.vendors}
          projects={options.projects}
          members={options.members}
          clauses={options.clauses}
        />
        </div>
      </PageHeader>

      {/* Stats cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">Expiring (30d)</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {obligations.length === 0 && pagination.total === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No compliance obligations yet"
          description="Create your first obligation to start tracking Section 37(2) agreements, licences, permits, and certificates."
        >
          <ObligationFormTrigger
            vendors={options.vendors}
            projects={options.projects}
            members={options.members}
            clauses={options.clauses}
          />
        </EmptyState>
      ) : (
        <>
          <ObligationTable
            data={obligations as any}
            role={role}
            vendors={options.vendors}
            projects={options.projects}
            members={options.members}
            clauses={options.clauses}
          />
          <Pagination {...pagination} basePath="/obligations" />
        </>
      )}
    </div>
  )
}

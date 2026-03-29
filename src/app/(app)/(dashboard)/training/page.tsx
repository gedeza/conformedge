import Link from "next/link"
import { GraduationCap, Users, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { getAuthContext } from "@/lib/auth"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/shared/pagination"
import { getTrainingRecords, getTrainingStats, getTrainingOptions } from "./actions"
import { TrainingTable } from "./training-table"
import { TrainingFormTrigger } from "./training-form-trigger"
import { TrainingHelpPanel } from "./training-help-panel"
import type { UserRole } from "@/types"
import { canCreate } from "@/lib/permissions"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TrainingPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const categoryFilter = typeof params.category === "string" ? params.category : undefined
  const statusFilter = typeof params.status === "string" ? params.status : undefined

  let records: Awaited<ReturnType<typeof getTrainingRecords>>["records"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let stats = { total: 0, completed: 0, expired: 0, expiring: 0, byCategory: [] as any[] }
  let options = { members: [] as any[], sites: [] as any[] }
  let role: UserRole = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, statsResult, optionsResult] = await Promise.all([
      getTrainingRecords(page, { category: categoryFilter, status: statusFilter }),
      getTrainingStats(),
      getTrainingOptions(),
    ])
    records = result.records
    pagination = result.pagination
    stats = statsResult
    options = optionsResult
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Training Records" description="Employee training history and competency tracking" />
        <EmptyState icon={GraduationCap} title="Authentication required" description="Please sign in and select an organisation." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Training Records" description="Per OHS Act s8(2)(e) — employee training history, certificates, and competency tracking">
        <div className="flex items-center gap-2">
          <TrainingHelpPanel />
          <Button variant="outline" size="sm" asChild>
            <Link href="/training/matrix">
              <Users className="mr-2 h-4 w-4" />
              Competency Matrix
            </Link>
          </Button>
          {canCreate(role) && <TrainingFormTrigger members={options.members} sites={options.sites} />}
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {records.length === 0 && pagination.total === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No training records"
          description="Add your first training record to start tracking employee competency and certificate expiry."
        />
      ) : (
        <>
          <TrainingTable data={records} />
          {pagination.totalPages > 1 && (
            <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} pageSize={pagination.pageSize} basePath="/training" />
          )}
        </>
      )}
    </div>
  )
}

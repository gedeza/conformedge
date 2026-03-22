import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { Wrench } from "lucide-react"
import { getEquipment, getProjectOptions } from "./actions"
import { EquipmentTable } from "./equipment-table"
import { EquipmentFormTrigger } from "./equipment-form-trigger"
import { EquipmentHelpPanel } from "./equipment-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EquipmentPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const statusFilter = typeof params.status === "string" ? params.status : undefined
  const categoryFilter = typeof params.category === "string" ? params.category : undefined

  let equipment: Awaited<ReturnType<typeof getEquipment>>["equipment"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, projList] = await Promise.all([
      getEquipment(page, { status: statusFilter, category: categoryFilter }),
      getProjectOptions(),
    ])
    equipment = result.equipment
    pagination = result.pagination
    projects = projList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Equipment" description="Manage equipment, calibration, and maintenance records" />
        <EmptyState icon={Wrench} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Equipment" description="Manage equipment, calibration, and maintenance records">
        <EquipmentHelpPanel />
        <EquipmentFormTrigger projects={projects} role={role} />
      </PageHeader>
      {equipment.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={Wrench} title="No equipment registered" description="Register your equipment to track calibration, maintenance, and repair history.">
          <EquipmentFormTrigger projects={projects} role={role} />
        </EmptyState>
      ) : (
        <>
          <EquipmentTable data={equipment} projects={projects} role={role} />
          <Pagination {...pagination} basePath="/equipment" />
        </>
      )}
    </div>
  )
}

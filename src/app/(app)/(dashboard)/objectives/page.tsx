import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { Target } from "lucide-react"
import { getObjectives, getStandardsForObjectives, getMembers } from "./actions"
import { ObjectiveTable } from "./objective-table"
import { ObjectiveFormTrigger } from "./objective-form-trigger"
import { ObjectivesHelpPanel } from "./objectives-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ObjectivesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let objectives: Awaited<ReturnType<typeof getObjectives>>["objectives"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let standards: Awaited<ReturnType<typeof getStandardsForObjectives>> = []
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, stdList, memberList] = await Promise.all([
      getObjectives(page), getStandardsForObjectives(), getMembers(),
    ])
    objectives = result.objectives
    pagination = result.pagination
    standards = stdList
    members = memberList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Objectives" description="Track quality and safety objectives with measurable KPIs" />
        <EmptyState icon={Target} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Objectives" description="Track quality and safety objectives with measurable KPIs">
        <ObjectivesHelpPanel />
        <ObjectiveFormTrigger standards={standards} members={members} role={role} />
      </PageHeader>
      {objectives.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={Target} title="No objectives yet" description="Create quality or safety objectives to track measurable targets aligned to ISO standards.">
          <ObjectiveFormTrigger standards={standards} members={members} role={role} />
        </EmptyState>
      ) : (
        <>
          <ObjectiveTable data={objectives} standards={standards} members={members} role={role} />
          <Pagination {...pagination} basePath="/objectives" />
        </>
      )}
    </div>
  )
}

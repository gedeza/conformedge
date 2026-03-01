import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { ClipboardCheck } from "lucide-react"
import { getAssessments, getStandards, getProjectOptions } from "./actions"
import { AssessmentTable } from "./assessment-table"
import { AssessmentFormTrigger } from "./assessment-form-trigger"
import { AssessmentsHelpPanel } from "./assessments-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AssessmentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let assessments: Awaited<ReturnType<typeof getAssessments>>["assessments"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let standards: Awaited<ReturnType<typeof getStandards>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, stdList, projList] = await Promise.all([
      getAssessments(page), getStandards(), getProjectOptions(),
    ])
    assessments = result.assessments
    pagination = result.pagination
    standards = stdList
    projects = projList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Assessments" description="Conduct gap assessments against ISO standards" />
        <EmptyState icon={ClipboardCheck} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Assessments" description="Conduct gap assessments against ISO standards">
        <AssessmentsHelpPanel />
        <AssessmentFormTrigger standards={standards} projects={projects} role={role} />
      </PageHeader>
      {assessments.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No assessments yet" description="Create an assessment to identify compliance gaps.">
          <AssessmentFormTrigger standards={standards} projects={projects} role={role} />
        </EmptyState>
      ) : (
        <>
          <AssessmentTable data={assessments} standards={standards} projects={projects} role={role} />
          <Pagination {...pagination} basePath="/assessments" />
        </>
      )}
    </div>
  )
}

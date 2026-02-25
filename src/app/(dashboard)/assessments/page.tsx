import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ClipboardCheck } from "lucide-react"
import { getAssessments, getStandards, getProjectOptions } from "./actions"
import { AssessmentTable } from "./assessment-table"
import { AssessmentFormTrigger } from "./assessment-form-trigger"

export default async function AssessmentsPage() {
  let assessments: Awaited<ReturnType<typeof getAssessments>> = []
  let standards: Awaited<ReturnType<typeof getStandards>> = []
  let projects: Awaited<ReturnType<typeof getProjectOptions>> = []
  let authError = false

  try {
    ;[assessments, standards, projects] = await Promise.all([
      getAssessments(), getStandards(), getProjectOptions(),
    ])
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
        <AssessmentFormTrigger standards={standards} projects={projects} />
      </PageHeader>
      {assessments.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No assessments yet" description="Create an assessment to identify compliance gaps.">
          <AssessmentFormTrigger standards={standards} projects={projects} />
        </EmptyState>
      ) : (
        <AssessmentTable data={assessments} standards={standards} projects={projects} />
      )}
    </div>
  )
}

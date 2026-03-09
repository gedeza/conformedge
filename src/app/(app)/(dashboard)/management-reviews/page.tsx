import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { ClipboardList } from "lucide-react"
import { getReviews, getMembers, getStandardOptions } from "./actions"
import { ReviewTable } from "./review-table"
import { ReviewFormTrigger } from "./review-form-trigger"
import { ManagementReviewsHelpPanel } from "./management-reviews-help-panel"
import { getAuthContext } from "@/lib/auth"

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ManagementReviewsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  let reviews: Awaited<ReturnType<typeof getReviews>>["reviews"] = []
  let pagination = { page: 1, pageSize: 50, total: 0, totalPages: 0 }
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let standards: Awaited<ReturnType<typeof getStandardOptions>> = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const [result, memberList, stdList] = await Promise.all([
      getReviews(page), getMembers(), getStandardOptions(),
    ])
    reviews = result.reviews
    pagination = result.pagination
    members = memberList
    standards = stdList
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Management Reviews" description="ISO 9.3 — Top management review meetings" />
        <EmptyState icon={ClipboardList} title="Organization required" description="Please select or create an organization." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Management Reviews" description="ISO 9.3 — Top management review meetings">
        <ManagementReviewsHelpPanel />
        <ReviewFormTrigger members={members} standards={standards} role={role} />
      </PageHeader>
      {reviews.length === 0 && pagination.total === 0 ? (
        <EmptyState icon={ClipboardList} title="No reviews scheduled" description="Schedule management reviews to meet ISO Clause 9.3 requirements.">
          <ReviewFormTrigger members={members} standards={standards} role={role} />
        </EmptyState>
      ) : (
        <>
          <ReviewTable data={reviews} members={members} standards={standards} role={role} />
          <Pagination {...pagination} basePath="/management-reviews" />
        </>
      )}
    </div>
  )
}

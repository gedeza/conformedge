import Link from "next/link"
import { format } from "date-fns"
import { ClipboardPen, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMyPendingReviews } from "@/app/(dashboard)/documents/approval-actions"

export async function PendingReviewsWidget() {
  let reviews: Awaited<ReturnType<typeof getMyPendingReviews>> = []

  try {
    reviews = await getMyPendingReviews()
  } catch {
    return null
  }

  if (reviews.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
        <ClipboardPen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{reviews.length}</div>
        <div className="space-y-2">
          {reviews.slice(0, 5).map((step) => (
            <div key={step.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/documents/${step.approvalRequest.document.id}?tab=approvals`}
                  className="font-medium hover:underline truncate block"
                >
                  {step.approvalRequest.document.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {step.approvalRequest.submittedBy.firstName} {step.approvalRequest.submittedBy.lastName}
                  {" — "}{format(new Date(step.createdAt), "MMM d")}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0 ml-2">
                <Link href={`/documents/${step.approvalRequest.document.id}?tab=approvals`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
          {reviews.length > 5 && (
            <p className="text-xs text-muted-foreground">
              +{reviews.length - 5} more
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

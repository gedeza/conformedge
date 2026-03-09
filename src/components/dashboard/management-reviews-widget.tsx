import Link from "next/link"
import { format } from "date-fns"
import { ClipboardList, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { getUpcomingReviewsSummary } from "@/app/(app)/(dashboard)/management-reviews/actions"

export async function ManagementReviewsWidget() {
  let data: Awaited<ReturnType<typeof getUpcomingReviewsSummary>> | null = null
  try {
    data = await getUpcomingReviewsSummary()
  } catch {
    return null
  }
  if (!data) return null

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Management Reviews
          </CardTitle>
          <Link href="/management-reviews" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {data.openActions > 0 && (
          <div className="mb-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {data.openActions} open action item{data.openActions !== 1 ? "s" : ""} from reviews
            </p>
          </div>
        )}
        {data.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming reviews.</p>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map((review) => (
              <Link
                key={review.id}
                href={`/management-reviews/${review.id}`}
                className="block rounded-md border p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{review.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(review.reviewDate, "MMM d, yyyy")}
                      </span>
                      {review.standards.map((s) => (
                        <Badge key={s.standard.code} variant="outline" className="text-[10px] px-1.5 py-0">
                          {s.standard.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <StatusBadge type="managementReview" value={review.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

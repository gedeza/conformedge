import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, MapPin, CalendarDays, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getAuthContext } from "@/lib/auth"
import { getReview, getMembers } from "../actions"
import { ReviewActionsPanel } from "./review-actions-panel"
import { AgendaItemsCard } from "./agenda-items-card"
import { ActionsTrackerCard } from "./actions-tracker-card"

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let review: Awaited<ReturnType<typeof getReview>>
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    ;[review, members] = await Promise.all([getReview(id), getMembers()])
    if (!review) notFound()
  } catch {
    notFound()
  }

  if (!review) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/management-reviews"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
      </div>

      <PageHeader heading={review.title} description="Management Review">
        <div className="flex items-center gap-2">
          <StatusBadge type="managementReview" value={review.status} />
          {review.standards.map((s) => (
            <Badge key={s.standard.id} variant="outline">{s.standard.code}</Badge>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader><CardTitle>Review Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Review Date</span>
                    <p className="font-medium">{format(review.reviewDate, "PPP")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Next Review</span>
                    <p className="font-medium">
                      {review.nextReviewDate ? format(review.nextReviewDate, "PPP") : "Not scheduled"}
                    </p>
                  </div>
                </div>
                {review.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Location</span>
                      <p className="font-medium">{review.location}</p>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Facilitator</span>
                  <p className="font-medium">
                    {review.facilitator.firstName} {review.facilitator.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created By</span>
                  <p className="font-medium">
                    {review.createdBy.firstName} {review.createdBy.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">{format(review.createdAt, "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          {review.attendees.length > 0 && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees ({review.attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {review.attendees.map((a) => (
                    <Badge key={a.user.id} variant="secondary">
                      {a.user.firstName} {a.user.lastName}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda Items */}
          <AgendaItemsCard
            reviewId={review.id}
            items={review.agendaItems}
            role={role}
          />

          {/* Action Items */}
          <ActionsTrackerCard
            reviewId={review.id}
            actions={review.actions}
            members={members}
            role={role}
          />

          {/* Meeting Minutes */}
          {review.meetingMinutes && (
            <Card className="border-border/50 transition-all hover:shadow-md">
              <CardHeader><CardTitle>Meeting Minutes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{review.meetingMinutes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — workflow actions */}
        <div>
          <ReviewActionsPanel
            reviewId={review.id}
            currentStatus={review.status}
            role={role}
          />
        </div>
      </div>
    </div>
  )
}

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminAuditTrail } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { AdminSearch } from "@/components/admin/admin-search"

export default async function AdminAuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { q, page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 50
  const offset = (currentPage - 1) * limit

  const { events, total } = await getAdminAuditTrail({ q, limit, offset })
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Audit Trail"
        description={`${total} events across all organizations`}
      />

      <Suspense fallback={null}>
        <AdminSearch placeholder="Search events, users, actions..." />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {event.action}
                    </Badge>
                    <span className="text-muted-foreground">
                      {event.entityType}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {event.user?.firstName} {event.user?.lastName}
                    </span>
                    <span>·</span>
                    <span>{event.organization?.name ?? "System"}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(event.createdAt, "dd MMM yyyy HH:mm")}
                </span>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No audit events found.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <a
                    href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage - 1) }).toString()}`}
                    className="underline"
                  >
                    Previous
                  </a>
                )}
                {currentPage < totalPages && (
                  <a
                    href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage + 1) }).toString()}`}
                    className="underline"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

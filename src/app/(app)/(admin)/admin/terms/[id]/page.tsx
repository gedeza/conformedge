import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { ArrowLeft, Pencil, Users, Calendar, Clock } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getTermsVersion, getTermsAcceptanceStats } from "../actions"
import { PublishButton } from "../publish-button"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUPERSEDED: "bg-gray-100 text-gray-600",
}

export default async function TermsVersionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const { id } = await params
  const version = await getTermsVersion(id)
  if (!version) notFound()

  const stats = await getTermsAcceptanceStats(id)
  const isDraft = version.status === "DRAFT"
  const acceptancePercent = stats && stats.totalUsers > 0
    ? Math.round((stats.acceptedCount / stats.totalUsers) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/terms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            heading={version.title}
            description={`Version ${version.version}`}
          />
        </div>
        <Badge className={STATUS_COLORS[version.status] ?? ""}>{version.status}</Badge>
        {isDraft && (
          <>
            <Button variant="outline" asChild>
              <Link href={`/admin/terms/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <PublishButton versionId={id} versionLabel={version.version} />
          </>
        )}
      </div>

      {/* Meta info */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Effective
            </div>
            <p className="mt-1 font-medium">{format(version.effectiveAt, "dd MMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Published
            </div>
            <p className="mt-1 font-medium">
              {version.publishedAt ? format(version.publishedAt, "dd MMM yyyy HH:mm") : "Not yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Accepted
            </div>
            <p className="mt-1 font-medium">
              {stats ? `${stats.acceptedCount} / ${stats.totalUsers}` : "—"} ({acceptancePercent}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Created</div>
            <p className="mt-1 font-medium">{format(version.createdAt, "dd MMM yyyy")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Change summary */}
      {version.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{version.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Content preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{version.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Recent acceptances */}
      {stats && stats.recentAcceptances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Acceptances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentAcceptances.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>
                    {a.user.firstName} {a.user.lastName}
                    <span className="ml-2 text-muted-foreground">{a.user.email}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {format(a.acceptedAt, "dd MMM yyyy HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

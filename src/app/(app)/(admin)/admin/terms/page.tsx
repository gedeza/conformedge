import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { Plus, FileText, Users } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getTermsVersions } from "./actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUPERSEDED: "bg-gray-100 text-gray-600",
}

export default async function AdminTermsPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const versions = await getTermsVersions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          heading="Terms Management"
          description={`${versions.length} terms version${versions.length !== 1 ? "s" : ""}`}
        />
        <Button asChild>
          <Link href="/admin/terms/new">
            <Plus className="mr-2 h-4 w-4" />
            New Version
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {versions.map((v) => (
              <Link
                key={v.id}
                href={`/admin/terms/${v.id}`}
                className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{v.title}</span>
                      <Badge variant="outline">v{v.version}</Badge>
                      <Badge className={STATUS_COLORS[v.status] ?? ""}>{v.status}</Badge>
                    </div>
                    {v.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{v.summary}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {v._count.acceptances} accepted
                    </div>
                    <p>Effective {format(v.effectiveAt, "dd MMM yyyy")}</p>
                    {v.publishedAt && <p>Published {format(v.publishedAt, "dd MMM yyyy")}</p>}
                  </div>
                </div>
              </Link>
            ))}

            {versions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No terms versions yet. Create your first version to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

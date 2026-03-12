import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Building2, Users, FileText, AlertTriangle, Handshake } from "lucide-react"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminOrganizations } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"

const PLAN_COLORS: Record<string, string> = {
  STARTER: "bg-gray-100 text-gray-800",
  PROFESSIONAL: "bg-blue-100 text-blue-800",
  BUSINESS: "bg-purple-100 text-purple-800",
  ENTERPRISE: "bg-amber-100 text-amber-800",
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  TRIALING: "bg-blue-100 text-blue-800",
  PAST_DUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  PAUSED: "bg-amber-100 text-amber-800",
}

export default async function AdminOrganizationsPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const orgs = await getAdminOrganizations()

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Organizations"
        description={`${orgs.length} organizations on the platform`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orgs.map((org) => {
              const partner = org.partnerOrganizations[0]?.partner
              return (
                <Link
                  key={org.id}
                  href={`/admin/organizations/${org.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{org.name}</span>
                      {org.subscription && (
                        <>
                          <Badge className={PLAN_COLORS[org.subscription.plan] ?? ""}>
                            {org.subscription.plan}
                          </Badge>
                          <Badge className={STATUS_COLORS[org.subscription.status] ?? ""}>
                            {org.subscription.status}
                          </Badge>
                        </>
                      )}
                      {!org.subscription && (
                        <Badge className="bg-gray-100 text-gray-500">No subscription</Badge>
                      )}
                      {partner && (
                        <Badge variant="outline" className="gap-1">
                          <Handshake className="h-3 w-3" />
                          {partner.name}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      {org.industry && <span>{org.industry}</span>}
                      <span>Created {format(org.createdAt, "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {org._count.members}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {org._count.documents}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {org._count.capas}
                    </span>
                  </div>
                </Link>
              )
            })}

            {orgs.length === 0 && (
              <p className="text-sm text-muted-foreground">No organizations yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

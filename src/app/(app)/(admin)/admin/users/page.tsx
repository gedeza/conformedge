import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminUsers } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { SuperAdminToggle } from "./super-admin-toggle"

export default async function AdminUsersPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const users = await getAdminUsers()

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Users"
        description={`${users.length} users on the platform`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    {user.isSuperAdmin && (
                      <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
                    )}
                    {user.partnerUsers.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Partner: {user.partnerUsers[0].partner.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.memberships.map((m, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {m.organization.name} ({m.role})
                      </Badge>
                    ))}
                    {user.memberships.length === 0 && (
                      <span className="text-xs text-muted-foreground">No org memberships</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Joined {format(user.createdAt, "dd MMM yyyy")}</p>
                    {user.lastLoginAt && (
                      <p>Last login {format(user.lastLoginAt, "dd MMM yyyy")}</p>
                    )}
                  </div>
                  <SuperAdminToggle
                    userId={user.id}
                    currentUserId={ctx.dbUserId}
                    isSuperAdmin={user.isSuperAdmin}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

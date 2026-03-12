import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getPartnerUsers } from "../actions"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { PARTNER_ROLES } from "@/lib/constants"
import { PartnerUserActions } from "./partner-user-actions"

export default async function PartnerTeamPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const users = await getPartnerUsers()
  if (!users) redirect("/dashboard")

  const activeUsers = users.filter((u) => u.isActive)
  const inactiveUsers = users.filter((u) => !u.isActive)

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Partner Team"
        description={`${activeUsers.length} active team member${activeUsers.length !== 1 ? "s" : ""}`}
      />

      <div className="space-y-3">
        {activeUsers.map((pu) => {
          const roleConfig = PARTNER_ROLES[pu.role as keyof typeof PARTNER_ROLES]
          return (
            <Card key={pu.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {pu.user.imageUrl && <AvatarImage src={pu.user.imageUrl} />}
                      <AvatarFallback>
                        {pu.user.firstName[0]}{pu.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {pu.user.firstName} {pu.user.lastName}
                        {pu.userId === ctx.dbUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{pu.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant="outline">{roleConfig?.label ?? pu.role}</Badge>
                      {pu.user.lastLoginAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last login: {format(pu.user.lastLoginAt, "dd MMM yyyy")}
                        </p>
                      )}
                    </div>
                    {ctx.partnerRole === "PARTNER_ADMIN" && pu.userId !== ctx.dbUserId && (
                      <PartnerUserActions
                        userId={pu.userId}
                        currentRole={pu.role}
                        userName={`${pu.user.firstName} ${pu.user.lastName}`}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {activeUsers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p className="font-medium">No team members</p>
            </CardContent>
          </Card>
        )}
      </div>

      {inactiveUsers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Inactive Members ({inactiveUsers.length})
          </h3>
          <div className="space-y-2">
            {inactiveUsers.map((pu) => (
              <Card key={pu.id} className="opacity-60">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {pu.user.firstName[0]}{pu.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{pu.user.firstName} {pu.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{pu.user.email}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">Inactive</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

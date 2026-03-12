import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getSuperAdminContext } from "@/lib/admin-auth"
import { getAdminSubscriptions } from "../actions"
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

export default async function AdminSubscriptionsPage() {
  const ctx = await getSuperAdminContext()
  if (!ctx) redirect("/dashboard")

  const subscriptions = await getAdminSubscriptions()

  const active = subscriptions.filter((s) => s.status === "ACTIVE").length
  const trialing = subscriptions.filter((s) => s.status === "TRIALING").length
  const pastDue = subscriptions.filter((s) => s.status === "PAST_DUE").length

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Subscriptions"
        description={`${subscriptions.length} total — ${active} active, ${trialing} trialing${pastDue > 0 ? `, ${pastDue} past due` : ""}`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subscriptions.map((sub) => {
              const isTrialExpiring =
                sub.status === "TRIALING" &&
                sub.trialEndsAt &&
                new Date(sub.trialEndsAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

              return (
                <Link
                  key={sub.id}
                  href={`/admin/organizations/${sub.organization.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <span className="font-medium">{sub.organization.name}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={PLAN_COLORS[sub.plan] ?? ""}>{sub.plan}</Badge>
                      <Badge className={STATUS_COLORS[sub.status] ?? ""}>{sub.status}</Badge>
                      {isTrialExpiring && (
                        <Badge className="bg-red-100 text-red-800">Trial expiring soon</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{sub.billingCycle}</p>
                    <p>
                      {format(sub.currentPeriodStart, "dd MMM")} — {format(sub.currentPeriodEnd, "dd MMM yyyy")}
                    </p>
                    {sub.trialEndsAt && (
                      <p>Trial ends {format(sub.trialEndsAt, "dd MMM yyyy")}</p>
                    )}
                  </div>
                </Link>
              )
            })}

            {subscriptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

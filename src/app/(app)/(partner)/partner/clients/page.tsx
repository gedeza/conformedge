import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { Building2 } from "lucide-react"
import { getPartnerContext } from "@/lib/partner-auth"
import { getClientOrgsSummary } from "../actions"
import { redirect } from "next/navigation"
import { PARTNER_CLIENT_SIZES } from "@/lib/constants"
import Link from "next/link"
import { format } from "date-fns"
import { AddClientOrgDialog } from "./add-client-org-dialog"

export default async function ClientOrgsPage() {
  const ctx = await getPartnerContext()
  if (!ctx) redirect("/dashboard")

  const data = await getClientOrgsSummary()
  if (!data) redirect("/dashboard")

  const { clientOrgs } = data

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Client Organizations"
        description={`${clientOrgs.length} organization${clientOrgs.length !== 1 ? "s" : ""} managed by your partner`}
      >
        {ctx.partnerRole === "PARTNER_ADMIN" && <AddClientOrgDialog />}
      </PageHeader>

      <div className="space-y-3">
        {clientOrgs.map((co) => {
          const org = co.organization
          const sizeConfig = PARTNER_CLIENT_SIZES[co.clientSize as keyof typeof PARTNER_CLIENT_SIZES]
          const feeCents = co.customFeeCents ?? sizeConfig?.defaultFeeCents ?? 0
          const feeDisplay = `R${(feeCents / 100).toLocaleString("en-ZA")}/mo`

          return (
            <Link key={co.id} href={`/partner/clients/${org.id}`}>
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.industry ?? "No industry"} &middot; Added {format(co.onboardedAt, "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{sizeConfig?.label ?? co.clientSize}</Badge>
                      <Badge variant="secondary">{org._count.members} users</Badge>
                      <Badge variant="secondary">{org._count.documents} docs</Badge>
                      <Badge variant="secondary">{org._count.capas} CAPAs</Badge>
                      {co.customFeeCents && (
                        <Badge className="bg-emerald-100 text-emerald-800">{feeDisplay} (custom)</Badge>
                      )}
                      {!co.customFeeCents && (
                        <Badge className="bg-gray-100 text-gray-600">{feeDisplay}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {clientOrgs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Building2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p className="mb-1 font-medium">No client organizations yet</p>
              <p className="text-sm">Add your first client organization to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

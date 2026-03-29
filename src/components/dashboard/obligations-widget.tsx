import { FileCheck2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { getBillingContext, checkFeatureAccess } from "@/lib/billing"

export async function ObligationsWidget() {
  try {
    const { dbOrgId } = await getAuthContext()

    // Only show for Enterprise
    const billing = await getBillingContext(dbOrgId)
    const access = checkFeatureAccess(billing, "complianceObligations")
    if (!access.allowed) return null

    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const [active, expired, expiring] = await Promise.all([
      db.complianceObligation.count({ where: { organizationId: dbOrgId, status: "ACTIVE" } }),
      db.complianceObligation.count({ where: { organizationId: dbOrgId, status: "EXPIRED" } }),
      db.complianceObligation.count({
        where: { organizationId: dbOrgId, status: "ACTIVE", expiryDate: { gte: now, lte: thirtyDays } },
      }),
    ])

    const total = active + expired
    if (total === 0) return null

    return (
      <Card className="border-border/50 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Obligations</CardTitle>
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-lg font-bold text-green-600">{active}</span>
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">{expiring}</span>
              </div>
              <p className="text-xs text-muted-foreground">Expiring</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-lg font-bold text-red-600">{expired}</span>
              </div>
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
          </div>
          <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
            <Link href="/obligations">View all obligations</Link>
          </Button>
        </CardContent>
      </Card>
    )
  } catch {
    return null
  }
}

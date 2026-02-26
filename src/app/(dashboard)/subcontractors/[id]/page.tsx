import { notFound } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ArrowLeft, Plus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getSubcontractor } from "../actions"
import { calculateComplianceScore } from "../compliance-score"
import { CertificationActions } from "./certification-actions"
import { ComplianceScoreCard } from "./compliance-score-card"

function getExpiryBadge(expiresAt: Date | null) {
  if (!expiresAt) return <Badge variant="outline">No expiry</Badge>

  const now = new Date()
  const days = differenceInDays(new Date(expiresAt), now)

  if (days < 0) return <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>
  if (days <= 30) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Expiring in {days}d</Badge>
  return <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
}

export default async function SubcontractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let sub: Awaited<ReturnType<typeof getSubcontractor>>

  try {
    sub = await getSubcontractor(id)
  } catch {
    notFound()
  }

  if (!sub) notFound()

  const complianceScore = calculateComplianceScore(sub)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/subcontractors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={sub.name} description={sub.registrationNumber ?? undefined}>
        <StatusBadge type="subcontractor" value={sub.tier} />
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">Certifications ({sub.certifications.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ComplianceScoreCard subcontractorId={sub.id} initialScore={complianceScore} />
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tier</span>
                  <div className="mt-1"><StatusBadge type="subcontractor" value={sub.tier} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Registration Number</span>
                  <p className="mt-1 font-medium">{sub.registrationNumber ?? "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">BEE Level</span>
                  <p className="mt-1 font-medium">{sub.beeLevel ? `Level ${sub.beeLevel}` : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Safety Rating</span>
                  <p className="mt-1 font-medium">{sub.safetyRating !== null ? `${sub.safetyRating}%` : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Added</span>
                  <p className="mt-1 font-medium">{format(sub.createdAt, "PPP")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Certifications</span>
                  <p className="mt-1 font-medium">{sub.certifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certifications</CardTitle>
              <CertificationActions subcontractorId={sub.id} />
            </CardHeader>
            <CardContent>
              {sub.certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certifications added yet.</p>
              ) : (
                <div className="space-y-3">
                  {sub.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between rounded-md border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cert.name}</span>
                          {getExpiryBadge(cert.expiresAt)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuedBy && `Issued by ${cert.issuedBy}`}
                          {cert.issuedDate && ` on ${format(cert.issuedDate, "PPP")}`}
                          {cert.expiresAt && ` — Expires ${format(cert.expiresAt, "PPP")}`}
                        </p>
                      </div>
                      <CertificationActions
                        subcontractorId={sub.id}
                        certification={cert}
                        mode="edit"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Audit trail coming from the audit log.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

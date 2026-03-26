import { notFound } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ArrowLeft, Shield, FileDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getSubcontractor } from "../actions"
import { calculateComplianceScore, type VendorScoringWeights } from "../compliance-score"
import { CertificationActions } from "./certification-actions"
import { CertReviewActions } from "./cert-review-actions"
import { ComplianceScoreCard } from "./compliance-score-card"
import { InviteToPortalButton } from "./invite-to-portal-button"
import { isR2Key } from "@/lib/r2-utils"
import { getAuthContext } from "@/lib/auth"
import { canManageOrg } from "@/lib/permissions"
import { db } from "@/lib/db"

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

  let isAdmin = false
  let customWeights: Partial<VendorScoringWeights> | undefined
  try {
    const ctx = await getAuthContext()
    isAdmin = canManageOrg(ctx.role)
    const org = await db.organization.findUnique({
      where: { id: ctx.dbOrgId },
      select: { settings: true },
    })
    const settings = (org?.settings as Record<string, unknown>) ?? {}
    customWeights = settings.vendorScoringWeights as Partial<VendorScoringWeights> | undefined
  } catch {}

  const complianceScore = calculateComplianceScore(sub, customWeights)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/subcontractors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={sub.name} description={sub.registrationNumber ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="subcontractor" value={sub.tier} />
          {isAdmin && <InviteToPortalButton subcontractorId={sub.id} subcontractorName={sub.name} />}
        </div>
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">Certifications ({sub.certifications.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ComplianceScoreCard subcontractorId={sub.id} initialScore={complianceScore} />
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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
          <Card className="border-border/50 transition-all hover:shadow-md">
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
                    <div key={cert.id} className="flex items-start justify-between rounded-md border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{cert.name}</span>
                          {getExpiryBadge(cert.expiresAt)}
                          {cert.status && <StatusBadge type="certificationStatus" value={cert.status} />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuedBy && `Issued by ${cert.issuedBy}`}
                          {cert.issuedDate && ` on ${format(cert.issuedDate, "PPP")}`}
                          {cert.expiresAt && ` — Expires ${format(cert.expiresAt, "PPP")}`}
                        </p>
                        {cert.reviewNotes && (
                          <p className="text-xs text-muted-foreground">Review: {cert.reviewNotes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {cert.fileUrl && isR2Key(cert.fileUrl) && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={`/api/download/${cert.fileUrl}`} target="_blank" rel="noopener noreferrer">
                              <FileDown className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {cert.status === "PENDING_REVIEW" && isAdmin && (
                          <CertReviewActions certId={cert.id} subcontractorId={sub.id} certName={cert.name} />
                        )}
                        <CertificationActions
                          subcontractorId={sub.id}
                          certification={cert}
                          mode="edit"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/50 transition-all hover:shadow-md">
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

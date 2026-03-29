import { notFound } from "next/navigation"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ArrowLeft, Shield, FileDown, ExternalLink, FileCheck2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { getVendor } from "../actions"
import { calculateComplianceScore, type VendorScoringWeights } from "../compliance-score"
import { CertificationActions } from "./certification-actions"
import { CertReviewActions } from "./cert-review-actions"
import { ComplianceScoreCard } from "./compliance-score-card"
import { InviteToPortalButton } from "./invite-to-portal-button"
import { BeeTab } from "./bee-tab"
import { isR2Key } from "@/lib/r2-utils"
import { getAuthContext } from "@/lib/auth"
import { canManageOrg, canEdit } from "@/lib/permissions"
import { db } from "@/lib/db"

function getExpiryBadge(expiresAt: Date | null) {
  if (!expiresAt) return <Badge variant="outline">No expiry</Badge>

  const now = new Date()
  const days = differenceInDays(new Date(expiresAt), now)

  if (days < 0) return <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>
  if (days <= 30) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Expiring in {days}d</Badge>
  return <Badge variant="outline" className="bg-green-100 text-green-800">Valid</Badge>
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let sub: Awaited<ReturnType<typeof getVendor>>

  try {
    sub = await getVendor(id)
  } catch {
    notFound()
  }

  if (!sub) notFound()

  let isAdmin = false
  let userRole = "VIEWER"
  let customWeights: Partial<VendorScoringWeights> | undefined
  try {
    const ctx = await getAuthContext()
    isAdmin = canManageOrg(ctx.role)
    userRole = ctx.role
    const org = await db.organization.findUnique({
      where: { id: ctx.dbOrgId },
      select: { settings: true },
    })
    const settings = (org?.settings as Record<string, unknown>) ?? {}
    customWeights = settings.vendorScoringWeights as Partial<VendorScoringWeights> | undefined
  } catch {}

  const complianceScore = calculateComplianceScore(sub, customWeights)

  // Fetch obligations linked to this vendor
  const obligations = await db.complianceObligation.findMany({
    where: { vendorId: sub.id },
    orderBy: { expiryDate: "asc" },
    select: {
      id: true,
      title: true,
      obligationType: true,
      status: true,
      effectiveDate: true,
      expiryDate: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/vendors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={sub.name} description={sub.registrationNumber ?? undefined}>
        <div className="flex items-center gap-2">
          <StatusBadge type="vendor" value={sub.tier} />
          {isAdmin && <InviteToPortalButton vendorId={sub.id} vendorName={sub.name} />}
        </div>
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">Certifications ({sub.certifications.length})</TabsTrigger>
          <TabsTrigger value="bbbee">B-BBEE</TabsTrigger>
          <TabsTrigger value="obligations">Obligations ({obligations.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ComplianceScoreCard vendorId={sub.id} initialScore={complianceScore} />
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Tier</span>
                  <div className="mt-1"><StatusBadge type="vendor" value={sub.tier} /></div>
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
              <CertificationActions vendorId={sub.id} />
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
                          <CertReviewActions certId={cert.id} vendorId={sub.id} certName={cert.name} />
                        )}
                        <CertificationActions
                          vendorId={sub.id}
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

        <TabsContent value="bbbee" className="space-y-4">
          <BeeTab
            vendorId={sub.id}
            beeLevel={sub.beeLevel}
            beeEntityType={sub.beeEntityType}
            beeScore={sub.beeScore}
            beeScorecard={sub.beeScorecard}
            beeCertExpiry={sub.beeCertExpiry}
            beeVerifier={sub.beeVerifier}
            beeBlackOwnership={sub.beeBlackOwnership}
            canEdit={canEdit(userRole)}
          />
        </TabsContent>

        <TabsContent value="obligations" className="space-y-4">
          <Card className="border-border/50 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Obligations</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/obligations?vendorId=${sub.id}`}>
                  View All <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {obligations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No compliance obligations linked to this vendor.</p>
              ) : (
                <div className="space-y-3">
                  {obligations.map((ob) => {
                    const daysLeft = ob.expiryDate
                      ? differenceInDays(new Date(ob.expiryDate), new Date())
                      : null
                    return (
                      <Link
                        key={ob.id}
                        href={`/obligations/${ob.id}`}
                        className="flex items-start justify-between rounded-md border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileCheck2 className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{ob.title}</span>
                            <StatusBadge type="obligationStatus" value={ob.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ob.obligationType}
                            {ob.expiryDate && ` — Expires ${format(ob.expiryDate, "PPP")}`}
                            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
                              <span className="text-yellow-600 font-medium"> ({daysLeft}d remaining)</span>
                            )}
                            {daysLeft !== null && daysLeft < 0 && (
                              <span className="text-red-600 font-medium"> (expired)</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
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

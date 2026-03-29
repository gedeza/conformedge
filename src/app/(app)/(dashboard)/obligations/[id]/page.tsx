import { notFound } from "next/navigation"
import Link from "next/link"
import { ScrollText, FileText, Building2, FolderKanban, User, Calendar, Clock, ShieldCheck, ExternalLink } from "lucide-react"
import { getAuthContext } from "@/lib/auth"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getObligationDetail } from "../actions"
import { ObligationActions } from "./obligation-actions"
import { OBLIGATION_TYPES } from "../schema"

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  EXPIRED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REVOKED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  NOT_APPLICABLE: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })
}

function getDaysUntilExpiry(expiryDate: Date | null): { text: string; color: string } | null {
  if (!expiryDate) return null
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { text: `Expired ${Math.abs(days)} days ago`, color: "text-red-600" }
  if (days <= 30) return { text: `Expires in ${days} days`, color: "text-yellow-600" }
  if (days <= 90) return { text: `Expires in ${days} days`, color: "text-blue-600" }
  return { text: `Expires in ${days} days`, color: "text-green-600" }
}

export default async function ObligationDetailPage({ params }: Props) {
  const { id } = await params
  let role = "VIEWER"

  try {
    const ctx = await getAuthContext()
    role = ctx.role
  } catch {
    notFound()
  }

  const obligation = await getObligationDetail(id)
  if (!obligation) notFound()

  const typeLabel = OBLIGATION_TYPES.find((t) => t.value === obligation.obligationType)?.label ?? obligation.obligationType
  const expiryInfo = getDaysUntilExpiry(obligation.expiryDate)

  return (
    <div className="space-y-6">
      <PageHeader
        heading={obligation.title}
        description={typeLabel}
      >
        <ObligationActions obligationId={obligation.id} currentStatus={obligation.status} role={role} />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ScrollText className="h-4 w-4" /> Obligation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={STATUS_COLORS[obligation.status] ?? ""}>
                    {obligation.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{typeLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effective Date</p>
                  <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(obligation.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <div>
                    <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(obligation.expiryDate)}</p>
                    {expiryInfo && <p className={`text-xs mt-0.5 ${expiryInfo.color}`}>{expiryInfo.text}</p>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alert Lead Time</p>
                  <p>{obligation.renewalLeadDays ?? 30} days before expiry</p>
                </div>
              </div>

              {obligation.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{obligation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regulatory Clause */}
          {obligation.standardClause && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Regulatory Clause
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {obligation.standardClause.standard.code} {obligation.standardClause.clauseNumber}
                  </Badge>
                  <div>
                    <p className="font-medium">{obligation.standardClause.title}</p>
                    {obligation.standardClause.description && (
                      <p className="text-sm text-muted-foreground mt-1">{obligation.standardClause.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{obligation.standardClause.standard.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Linked Document */}
          {obligation.document && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Evidence Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{obligation.document.title}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{obligation.document.status}</Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/documents/${obligation.document.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor/Contractor */}
          {obligation.vendor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Vendor / Contractor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/vendors/${obligation.vendor.id}`} className="font-medium hover:underline">
                  {obligation.vendor.name}
                </Link>
                {obligation.vendor.contactEmail && (
                  <p className="text-sm text-muted-foreground mt-1">{obligation.vendor.contactEmail}</p>
                )}
                {obligation.vendor.contactPerson && (
                  <p className="text-sm text-muted-foreground">{obligation.vendor.contactPerson}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project */}
          {obligation.project && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" /> Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${obligation.project.id}`} className="font-medium hover:underline">
                  {obligation.project.name}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Responsible Person */}
          {obligation.responsibleUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Responsible Person
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{obligation.responsibleUser.firstName} {obligation.responsibleUser.lastName}</p>
                <p className="text-sm text-muted-foreground">{obligation.responsibleUser.email}</p>
              </CardContent>
            </Card>
          )}

          {/* Last Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Review</CardTitle>
            </CardHeader>
            <CardContent>
              {obligation.lastReviewedAt ? (
                <div>
                  <p className="text-sm">{formatDate(obligation.lastReviewedAt)}</p>
                  {obligation.lastReviewedBy && (
                    <p className="text-sm text-muted-foreground">
                      by {obligation.lastReviewedBy.firstName} {obligation.lastReviewedBy.lastName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not yet reviewed</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

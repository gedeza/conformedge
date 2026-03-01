import { headers } from "next/headers"
import { ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateShareToken, logShareAccess, incrementViewCount } from "@/lib/share-link"
import { getSharedDocument, getSharedAuditPack, getSharedPortalData, getSharedSubcontractorData } from "@/lib/share-data"
import { SharedDocumentView } from "./shared-document-view"
import { SharedAuditPackView } from "./shared-audit-pack-view"
import { SharedPortalView } from "./shared-portal-view"
import { SubcontractorPortal } from "./subcontractor-portal"

export default async function SharedPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const shareLink = await validateShareToken(token)

  if (!shareLink) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <CardTitle>Link Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            This share link has expired, been revoked, or is no longer valid.
            Please contact the organization that shared this link.
          </CardContent>
        </Card>
      </div>
    )
  }

  // Log access + increment view count
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
  const ua = headersList.get("user-agent") ?? null

  incrementViewCount(shareLink.id)
  logShareAccess({
    shareLinkId: shareLink.id,
    ipAddress: ip,
    userAgent: ua,
    action: "VIEW",
  })

  const orgName = shareLink.organization.name

  if (shareLink.type === "DOCUMENT") {
    const document = await getSharedDocument(shareLink)
    if (!document) {
      return <NotFoundCard />
    }
    return (
      <div className="space-y-4">
        <SharedByHeader orgName={orgName} />
        <SharedDocumentView document={document} allowDownload={shareLink.allowDownload} token={token} />
      </div>
    )
  }

  if (shareLink.type === "AUDIT_PACK") {
    const pack = await getSharedAuditPack(shareLink)
    if (!pack) {
      return <NotFoundCard />
    }
    return (
      <div className="space-y-4">
        <SharedByHeader orgName={orgName} />
        <SharedAuditPackView pack={pack} allowDownload={shareLink.allowDownload} token={token} />
      </div>
    )
  }

  if (shareLink.type === "PORTAL") {
    const portalData = await getSharedPortalData(shareLink)
    if (!portalData) {
      return <NotFoundCard />
    }
    return (
      <div className="space-y-4">
        <SharedByHeader orgName={orgName} />
        <SharedPortalView data={portalData} label={shareLink.label} />
      </div>
    )
  }

  if (shareLink.type === "SUBCONTRACTOR") {
    const subcontractor = await getSharedSubcontractorData(shareLink)
    if (!subcontractor) {
      return <NotFoundCard />
    }
    return (
      <div className="space-y-4">
        <SharedByHeader orgName={orgName} />
        <SubcontractorPortal
          subcontractor={subcontractor}
          token={token}
          allowDownload={shareLink.allowDownload}
        />
      </div>
    )
  }

  return <NotFoundCard />
}

function SharedByHeader({ orgName }: { orgName: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Shared by <span className="font-medium text-foreground">{orgName}</span>
    </p>
  )
}

function NotFoundCard() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Content Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          The shared content could not be found. It may have been removed.
        </CardContent>
      </Card>
    </div>
  )
}

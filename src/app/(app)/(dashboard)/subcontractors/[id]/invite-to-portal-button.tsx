"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateShareLinkDialog } from "../../settings/create-share-link-dialog"

interface InviteToPortalButtonProps {
  subcontractorId: string
  subcontractorName: string
}

export function InviteToPortalButton({ subcontractorId, subcontractorName }: InviteToPortalButtonProps) {
  return (
    <CreateShareLinkDialog
      documents={[]}
      auditPacks={[]}
      subcontractors={[{ id: subcontractorId, name: subcontractorName }]}
      prefilledType="SUBCONTRACTOR"
      prefilledEntityId={subcontractorId}
      trigger={
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Invite to Portal
        </Button>
      }
    />
  )
}

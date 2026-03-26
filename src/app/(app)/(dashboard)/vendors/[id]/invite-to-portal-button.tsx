"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateShareLinkDialog } from "../../settings/create-share-link-dialog"

interface InviteToPortalButtonProps {
  vendorId: string
  vendorName: string
}

export function InviteToPortalButton({ vendorId, vendorName }: InviteToPortalButtonProps) {
  return (
    <CreateShareLinkDialog
      documents={[]}
      auditPacks={[]}
      vendors={[{ id: vendorId, name: vendorName }]}
      prefilledType="VENDOR"
      prefilledEntityId={vendorId}
      trigger={
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          Invite to Portal
        </Button>
      }
    />
  )
}

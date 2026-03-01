"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateShareLinkDialog } from "../../settings/create-share-link-dialog"

interface ShareButtonProps {
  entityId: string
  entityTitle: string
  type: "DOCUMENT" | "AUDIT_PACK"
}

export function ShareButton({ entityId, entityTitle, type }: ShareButtonProps) {
  return (
    <CreateShareLinkDialog
      documents={type === "DOCUMENT" ? [{ id: entityId, title: entityTitle }] : []}
      auditPacks={type === "AUDIT_PACK" ? [{ id: entityId, title: entityTitle }] : []}
      prefilledType={type}
      prefilledEntityId={entityId}
      trigger={
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" /> Share
        </Button>
      }
    />
  )
}

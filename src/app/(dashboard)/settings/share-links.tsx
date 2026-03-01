"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Copy, Trash2, Ban, Eye, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateShareLinkDialog } from "./create-share-link-dialog"
import { ShareLinkAccessLog } from "./share-link-access-log"
import { revokeShareLink, deleteShareLink } from "./share-link-actions"
import type { ShareLinkItem } from "./share-link-actions"

interface ShareLinksProps {
  links: ShareLinkItem[]
  canManage: boolean
  documents: { id: string; title: string }[]
  auditPacks: { id: string; title: string }[]
  subcontractors?: { id: string; name: string }[]
}

export function ShareLinks({ links, canManage, documents, auditPacks, subcontractors = [] }: ShareLinksProps) {
  const [accessLogLinkId, setAccessLogLinkId] = useState<string | null>(null)

  async function handleRevoke(id: string) {
    const result = await revokeShareLink(id)
    if (result.success) {
      toast.success("Share link revoked")
    } else {
      toast.error(result.error ?? "Failed to revoke")
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteShareLink(id)
    if (result.success) {
      toast.success("Share link deleted")
    } else {
      toast.error(result.error ?? "Failed to delete")
    }
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <CreateShareLinkDialog documents={documents} auditPacks={auditPacks} subcontractors={subcontractors} />
        </div>
      )}

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No share links yet. Create one to share documents, audit packs, or a compliance portal with external stakeholders.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.label}</TableCell>
                  <TableCell>
                    <StatusBadge type="shareLinkType" value={link.type} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {link.recipientName || link.recipientEmail || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="shareLink" value={link.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {link.viewCount}
                    {link.maxViews !== null && `/${link.maxViews}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(link.expiresAt), "PP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setAccessLogLinkId(link.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View access log</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {canManage && link.status === "ACTIVE" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRevoke(link.id)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canManage && (
                        <AlertDialog>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete share link?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &ldquo;{link.label}&rdquo; and its access log.
                                Anyone with this link will lose access immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(link.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {accessLogLinkId && (
        <ShareLinkAccessLog
          linkId={accessLogLinkId}
          onClose={() => setAccessLogLinkId(null)}
        />
      )}
    </div>
  )
}

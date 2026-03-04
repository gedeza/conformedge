"use client"

import { format } from "date-fns"
import { RotateCw, Ban } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SendInvitationDialog } from "./send-invitation-dialog"
import { revokeInvitation, resendInvitation } from "./invitation-actions"
import type { InvitationItem } from "./invitation-actions"

interface InvitationsProps {
  invitations: InvitationItem[]
  canManage: boolean
}

export function Invitations({ invitations, canManage }: InvitationsProps) {
  async function handleRevoke(id: string) {
    const result = await revokeInvitation(id)
    if (result.success) {
      toast.success("Invitation revoked")
    } else {
      toast.error(result.error ?? "Failed to revoke")
    }
  }

  async function handleResend(id: string) {
    const result = await resendInvitation(id)
    if (result.success) {
      toast.success("Invitation resent with a new link")
    } else {
      toast.error(result.error ?? "Failed to resend")
    }
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <SendInvitationDialog />
        </div>
      )}

      {invitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No invitations sent yet. Invite team members to collaborate on compliance management.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                      {inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="invitation" value={inv.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(inv.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(inv.expiresAt), "dd MMM yyyy")}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {inv.status === "PENDING" && (
                        <TooltipProvider>
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleResend(inv.id)}
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Resend invitation</TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Revoke invitation</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will invalidate the invitation link sent to <strong>{inv.email}</strong>. They will no longer be able to accept it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRevoke(inv.id)}>
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

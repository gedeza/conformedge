"use client"

import { useTransition } from "react"
import { MoreHorizontal, Copy, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cancelReferral } from "../actions"

interface ReferralActionsMenuProps {
  referralId: string
  code: string
  status: string
}

export function ReferralActionsMenu({ referralId, code, status }: ReferralActionsMenuProps) {
  const [pending, startTransition] = useTransition()
  const appUrl = typeof window !== "undefined" ? window.location.origin : ""

  async function handleCopy() {
    await navigator.clipboard.writeText(`${appUrl}/ref/${code}`)
    toast.success("Link copied")
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelReferral(referralId)
      if (result.success) {
        toast.success("Referral cancelled")
      } else {
        toast.error(result.error)
      }
    })
  }

  const canCancel = !["CONVERTED", "CANCELLED", "EXPIRED"].includes(status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        {canCancel && (
          <DropdownMenuItem onClick={handleCancel} className="text-destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Referral
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

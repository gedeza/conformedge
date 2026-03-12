"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Unlink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { disconnectClientOrganization } from "../../actions"

interface Props {
  organizationId: string
  orgName: string
}

export function DisconnectClientButton({ organizationId, orgName }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectClientOrganization(organizationId)
      if (result.success) {
        toast.success("Client organization disconnected")
        router.push("/partner/clients")
      } else {
        toast.error(result.error)
      }
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Unlink className="mr-1 h-4 w-4" />
          Disconnect
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {orgName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove your partner access to this organization. The organization and its
            data will not be deleted. You can re-add the organization later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDisconnect}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending ? "Disconnecting..." : "Disconnect"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

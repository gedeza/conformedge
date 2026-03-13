"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { Loader2, Rocket } from "lucide-react"
import { toast } from "sonner"
import { publishTermsVersion } from "./actions"

export function PublishButton({ versionId, versionLabel }: { versionId: string; versionLabel: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handlePublish() {
    startTransition(async () => {
      const result = await publishTermsVersion(versionId)
      if (result.success) {
        toast.success("Version published — all users will need to re-accept")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to publish")
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" className="bg-green-600 hover:bg-green-700">
          <Rocket className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish v{versionLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will make version <strong>{versionLabel}</strong> the active terms version.
            Any currently active version will be superseded.
            All users will be required to re-accept the new terms on their next login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePublish} disabled={isPending} className="bg-green-600 hover:bg-green-700">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Publish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

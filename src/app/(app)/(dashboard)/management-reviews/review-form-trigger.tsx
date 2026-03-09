"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ReviewForm } from "./review-form"
import { canCreate } from "@/lib/permissions"

interface ReviewFormTriggerProps {
  members: { id: string; name: string }[]
  standards: { id: string; code: string; name: string }[]
  role: string
}

export function ReviewFormTrigger({ members, standards, role }: ReviewFormTriggerProps) {
  const [open, setOpen] = useState(false)

  if (!canCreate(role)) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Schedule Review
      </Button>
      <ReviewForm open={open} onOpenChange={setOpen} members={members} standards={standards} />
    </>
  )
}

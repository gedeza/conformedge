"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AssessmentForm } from "./assessment-form"

interface AssessmentFormTriggerProps {
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
}

export function AssessmentFormTrigger({ standards, projects }: AssessmentFormTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Assessment
      </Button>
      <AssessmentForm open={open} onOpenChange={setOpen} standards={standards} projects={projects} />
    </>
  )
}

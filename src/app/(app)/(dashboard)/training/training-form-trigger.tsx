"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrainingForm } from "./training-form"

interface TrainingFormTriggerProps {
  members: Array<{ id: string; firstName: string; lastName: string }>
  sites: Array<{ id: string; name: string; code: string }>
}

export function TrainingFormTrigger({ members, sites }: TrainingFormTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Training
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Training Record</DialogTitle>
          <DialogDescription>Record employee training with certificate and competency details.</DialogDescription>
        </DialogHeader>
        <TrainingForm members={members} sites={sites} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

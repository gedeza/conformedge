"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BookTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveChecklistAsTemplate } from "../actions"

interface SaveAsTemplateButtonProps {
  checklistId: string
  defaultName: string
}

export function SaveAsTemplateButton({ checklistId, defaultName }: SaveAsTemplateButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!name.trim()) {
      toast.error("Template name is required")
      return
    }

    startTransition(async () => {
      const result = await saveChecklistAsTemplate(checklistId, name.trim(), description.trim() || undefined)
      if (result.success) {
        toast.success("Template saved")
        setOpen(false)
        setName(defaultName)
        setDescription("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookTemplate className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ISO 9001 Basic Audit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-desc">Description (optional)</Label>
            <Textarea
              id="template-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

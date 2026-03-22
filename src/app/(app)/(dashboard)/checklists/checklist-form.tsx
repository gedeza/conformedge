"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ListChecks } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createChecklist, updateChecklist } from "./actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  standardId: z.string().min(1, "Standard is required"),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
})

interface ChecklistFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist?: {
    id: string
    title: string
    description: string | null
    standardId: string
    projectId: string | null
    assignedToId: string | null
  }
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

export function ChecklistForm({ open, onOpenChange, checklist, standards, projects, members }: ChecklistFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!checklist

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: checklist?.title ?? "",
      description: checklist?.description ?? "",
      standardId: checklist?.standardId ?? "",
      projectId: checklist?.projectId ?? undefined,
      assignedToId: checklist?.assignedToId ?? undefined,
    },
  })

  useEffect(() => {
    if (checklist) {
      form.reset({
        title: checklist.title, description: checklist.description ?? "",
        standardId: checklist.standardId,
        projectId: checklist.projectId ?? undefined,
        assignedToId: checklist.assignedToId ?? undefined,
      })
    } else {
      form.reset({ title: "", description: "", standardId: "", projectId: undefined, assignedToId: undefined })
    }
  }, [checklist, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateChecklist(checklist.id, values)
        : await createChecklist(values)
      if (result.success) {
        toast.success(isEditing ? "Checklist updated" : "Checklist created")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            {isEditing ? "Edit Checklist" : "New Checklist"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the checklist details." : "Create a compliance checklist linked to an ISO standard."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl><Input placeholder="e.g. ISO 9001 Compliance Check" {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="What this checklist covers..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="standardId" render={({ field }) => (
              <FormItem>
                <FormLabel>ISO Standard *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select standard..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {standards.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Assignment</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select project..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="assignedToId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select person..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Checklist" : "Create Checklist"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

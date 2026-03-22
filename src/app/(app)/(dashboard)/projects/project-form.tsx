"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { FolderOpen } from "lucide-react"
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
import { DatePicker } from "@/components/shared/date-picker"
import { PROJECT_STATUSES } from "@/lib/constants"
import { createProject, updateProject, type ProjectFormValues } from "./actions"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: {
    id: string
    name: string
    description: string | null
    status: string
    startDate: Date | null
    endDate: Date | null
  }
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!project

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      status: (project?.status as ProjectFormValues["status"]) ?? "PLANNING",
      startDate: project?.startDate ?? undefined,
      endDate: project?.endDate ?? undefined,
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name, description: project.description ?? "",
        status: (project.status as ProjectFormValues["status"]) ?? "PLANNING",
        startDate: project.startDate ?? undefined, endDate: project.endDate ?? undefined,
      })
    } else {
      form.reset({ name: "", description: "", status: "PLANNING", startDate: undefined, endDate: undefined })
    }
  }, [project, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateProject(project.id, values)
        : await createProject(values)
      if (result.success) {
        toast.success(isEditing ? "Project updated" : "Project created")
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
            <FolderOpen className="h-5 w-5" />
            {isEditing ? "Edit Project" : "New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the project details." : "Create a new project to organise your compliance work."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl><Input placeholder="e.g. ISO 9001 Certification" {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Project scope and objectives..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select status..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUSES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Timeline</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} placeholder="Start date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} placeholder="End date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

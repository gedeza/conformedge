"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ClipboardList } from "lucide-react"
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
import { createAssessment, updateAssessment } from "./actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  standardId: z.string().min(1, "Standard is required"),
  projectId: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
  assessorId: z.string().optional(),
})

export interface OrgMember {
  id: string
  name: string
  email: string
  role: string
}

interface AssessmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assessment?: {
    id: string
    title: string
    description: string | null
    standardId: string
    projectId: string | null
    scheduledDate: Date | null
    assessorId: string | null
  }
  standards: { id: string; code: string; name: string }[]
  projects: { id: string; name: string }[]
  members?: OrgMember[]
}

export function AssessmentForm({ open, onOpenChange, assessment, standards, projects, members }: AssessmentFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!assessment

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: assessment?.title ?? "",
      description: assessment?.description ?? "",
      standardId: assessment?.standardId ?? "",
      projectId: assessment?.projectId ?? undefined,
      scheduledDate: assessment?.scheduledDate ?? undefined,
      assessorId: assessment?.assessorId ?? undefined,
    },
  })

  useEffect(() => {
    if (assessment) {
      form.reset({
        title: assessment.title, description: assessment.description ?? "",
        standardId: assessment.standardId, projectId: assessment.projectId ?? undefined,
        scheduledDate: assessment.scheduledDate ?? undefined,
        assessorId: assessment.assessorId ?? undefined,
      })
    } else {
      form.reset({ title: "", description: "", standardId: "", projectId: undefined, scheduledDate: undefined, assessorId: undefined })
    }
  }, [assessment, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateAssessment(assessment.id, values)
        : await createAssessment(values)
      if (result.success) {
        toast.success(isEditing ? "Assessment updated" : "Assessment created")
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
            <ClipboardList className="h-5 w-5" />
            {isEditing ? "Edit Assessment" : "New Assessment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the assessment details." : "Create a compliance assessment against an ISO standard."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl><Input placeholder="e.g. ISO 9001 Gap Assessment Q1" {...field} className="h-10" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Assessment scope and objectives..." rows={3} {...field} /></FormControl>
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
              <Label className="text-sm font-semibold">Schedule & Assignment</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {members && members.length > 0 && (
                  <FormField control={form.control} name="assessorId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select assessor..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
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
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Assessment" : "Create Assessment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

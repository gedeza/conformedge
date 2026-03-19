"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
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
import { createAuditPack } from "./actions"

const AUDIT_TYPES = [
  { value: "INTERNAL", label: "Internal Audit" },
  { value: "EXTERNAL", label: "External Audit" },
  { value: "SURVEILLANCE", label: "Surveillance Audit" },
  { value: "RECERTIFICATION", label: "Recertification Audit" },
  { value: "SUPPLIER", label: "Supplier Audit" },
] as const

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  auditType: z.string().max(50).optional(),
  auditDateFrom: z.coerce.date().optional(),
  auditDateTo: z.coerce.date().optional(),
  leadAuditorId: z.string().optional(),
  scope: z.string().max(2000).optional(),
  projectId: z.string().min(1, "Project is required"),
})

interface AuditPackFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: { id: string; name: string }[]
  members?: { id: string; name: string }[]
}

export function AuditPackForm({ open, onOpenChange, projects, members = [] }: AuditPackFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      auditType: "",
      scope: "",
      projectId: "",
      leadAuditorId: undefined,
      auditDateFrom: undefined,
      auditDateTo: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await createAuditPack(values)
      if (result.success) {
        toast.success("Audit pack created")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Audit Pack</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

            {/* Section 1: Audit Details */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Audit Details</Label>
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Q1 2026 ISO 45001 Surveillance Audit" {...field} className="h-8 text-xs" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="auditType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Audit Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {AUDIT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select project..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Description</FormLabel>
                  <FormControl><Textarea placeholder="Purpose and objectives of this audit..." rows={2} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Section 2: Schedule & Assignment */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Schedule &amp; Assignment</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="auditDateFrom" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Audit Start Date</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="auditDateTo" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Audit End Date</FormLabel>
                    <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              {members.length > 0 && (
                <FormField control={form.control} name="leadAuditorId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Lead Auditor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select lead auditor..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            {/* Section 3: Scope */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Audit Scope</Label>
              <FormField control={form.control} name="scope" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Scope Description</FormLabel>
                  <FormControl><Textarea placeholder="Define the scope of the audit — standards, clauses, processes, departments, sites to be audited..." rows={3} className="text-xs" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Audit Pack"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

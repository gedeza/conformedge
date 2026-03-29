"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronRight, FileCheck2, ScrollText, Users, CalendarClock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/shared/date-picker"
import { createObligation, updateObligation } from "./actions"
import { obligationSchema, OBLIGATION_TYPES, type ObligationFormValues } from "./schema"

const STEPS = [
  { id: "type", title: "Obligation Type", description: "What type of obligation?", icon: ScrollText },
  { id: "details", title: "Details & Parties", description: "Vendor, project, responsible person", icon: Users },
  { id: "dates", title: "Dates & Evidence", description: "Effective, expiry, linked document", icon: CalendarClock },
  { id: "review", title: "Review & Notes", description: "Review and add notes", icon: FileCheck2 },
] as const

type StepId = (typeof STEPS)[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  type: ["title", "obligationType"],
  details: ["vendorId", "projectId", "responsibleUserId", "standardClauseId"],
  dates: ["effectiveDate", "expiryDate", "renewalLeadDays"],
  review: ["notes"],
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  obligation?: {
    id: string
    title: string
    obligationType: string
    standardClause?: { id: string } | null
    vendor?: { id: string } | null
    project?: { id: string } | null
    responsibleUser?: { id: string } | null
    effectiveDate: Date | null
    expiryDate: Date | null
    renewalLeadDays?: number | null
    document?: { id: string } | null
    notes?: string | null
    metadata?: Record<string, unknown> | null
  } | null
  vendors: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  members: { id: string; firstName: string; lastName: string }[]
  clauses: { id: string; clauseNumber: string; title: string; standard: { code: string; name: string } }[]
}

export function ObligationForm({ open, onOpenChange, obligation, vendors, projects, members, clauses }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()
  const isEditing = !!obligation?.id

  const form = useForm<ObligationFormValues>({
    resolver: zodResolver(obligationSchema) as any,
    defaultValues: {
      title: obligation?.title ?? "",
      obligationType: obligation?.obligationType ?? "",
      standardClauseId: obligation?.standardClause?.id ?? null,
      vendorId: obligation?.vendor?.id ?? null,
      projectId: obligation?.project?.id ?? null,
      responsibleUserId: obligation?.responsibleUser?.id ?? null,
      effectiveDate: obligation?.effectiveDate ?? null,
      expiryDate: obligation?.expiryDate ?? null,
      renewalLeadDays: obligation?.renewalLeadDays ?? 30,
      notes: obligation?.notes ?? "",
    },
  })

  useEffect(() => {
    if (obligation) {
      form.reset({
        title: obligation.title,
        obligationType: obligation.obligationType,
        standardClauseId: obligation.standardClause?.id ?? null,
        vendorId: obligation.vendor?.id ?? null,
        projectId: obligation.project?.id ?? null,
        responsibleUserId: obligation.responsibleUser?.id ?? null,
        effectiveDate: obligation.effectiveDate,
        expiryDate: obligation.expiryDate,
        renewalLeadDays: obligation.renewalLeadDays ?? 30,
        notes: obligation.notes ?? "",
      })
    } else {
      form.reset({
        title: "",
        obligationType: "",
        standardClauseId: null,
        vendorId: null,
        projectId: null,
        responsibleUserId: null,
        effectiveDate: null,
        expiryDate: null,
        renewalLeadDays: 30,
        notes: "",
      })
      setCurrentStep(0)
      setCompletedSteps(new Set())
    }
  }, [obligation, form])

  const obligationType = form.watch("obligationType")

  async function nextStep() {
    const fieldsToValidate = STEP_FIELDS[STEPS[currentStep].id] as (keyof ObligationFormValues)[]
    const valid = await form.trigger(fieldsToValidate)
    if (valid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  function goToStep(step: number) {
    if (step <= currentStep || completedSteps.has(step)) {
      setCurrentStep(step)
    }
  }

  function onSubmit(values: ObligationFormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateObligation(obligation!.id, values)
        : await createObligation(values)

      if (result.success) {
        toast.success(isEditing ? "Obligation updated" : "Obligation created")
        onOpenChange(false)
        form.reset()
        setCurrentStep(0)
        setCompletedSteps(new Set())
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 pt-6 pb-4 border-b space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Obligation" : "New Compliance Obligation"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update this compliance obligation." : "Track a regulatory obligation — Section 37(2), licence, permit, or certificate."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === currentStep
                    ? "bg-primary text-primary-foreground"
                    : completedSteps.has(i)
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="h-3.5 w-3.5" />
                {step.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="obligation-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Step 1: Obligation Type */}
              {currentStep === 0 && (
                <>
                  <FormField control={form.control} name="obligationType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Obligation Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select obligation type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OBLIGATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <span className="font-medium">{type.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder={obligationType === "SECTION_37_2" ? "Section 37(2) Agreement — ABC Construction" : "Obligation title"} {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for this obligation.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Step 2: Details & Parties */}
              {currentStep === 1 && (
                <>
                  <FormField control={form.control} name="vendorId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor / Contractor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select vendor (optional)" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {obligationType === "SECTION_37_2" && (
                        <FormDescription>The contractor accepting OHS responsibility under Section 37(2).</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="responsibleUserId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsible Person</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select responsible person (optional)" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="standardClauseId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regulatory Clause</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Link to regulatory clause (optional)" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {clauses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.standard.code} {c.clauseNumber} — {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Link this obligation to the regulatory clause that requires it.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Step 3: Dates & Evidence */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date</FormLabel>
                        <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={(d: Date | undefined) => field.onChange(d ?? null)} />
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <DatePicker value={field.value ? new Date(field.value) : undefined} onChange={(d: Date | undefined) => field.onChange(d ?? null)} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="renewalLeadDays" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Lead Time (days)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={365} {...field} value={field.value ?? 30} onChange={(e) => field.onChange(parseInt(e.target.value) || 30)} />
                      </FormControl>
                      <FormDescription>Notify this many days before expiry.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Step 4: Review & Notes */}
              {currentStep === 3 && (
                <>
                  <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
                    <h4 className="font-medium text-sm">Summary</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{OBLIGATION_TYPES.find((t) => t.value === obligationType)?.label ?? obligationType}</span>
                      <span className="text-muted-foreground">Title:</span>
                      <span>{form.watch("title")}</span>
                      <span className="text-muted-foreground">Vendor:</span>
                      <span>{vendors.find((v) => v.id === form.watch("vendorId"))?.name ?? "None"}</span>
                      <span className="text-muted-foreground">Project:</span>
                      <span>{projects.find((p) => p.id === form.watch("projectId"))?.name ?? "None"}</span>
                      <span className="text-muted-foreground">Expiry:</span>
                      <span>{form.watch("expiryDate") ? new Date(form.watch("expiryDate")!).toLocaleDateString("en-ZA") : "No expiry"}</span>
                    </div>
                  </div>

                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes or context..." rows={4} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}
            </form>
          </Form>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep} type="button">Previous</Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} type="button">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" form="obligation-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Create Obligation"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

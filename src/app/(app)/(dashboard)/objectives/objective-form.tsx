"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ChevronRight, ChevronLeft, Check,
  Target, Gauge, BookOpen, UserCheck,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
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
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/shared/date-picker"
import { MEASUREMENT_FREQUENCIES } from "@/lib/constants"
import { createObjective, updateObjective, getClausesForStandard, type ObjectiveFormValues } from "./actions"

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  targetValue: z.coerce.number().positive("Target must be positive"),
  unit: z.string().max(50).optional(),
  measurementFrequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  dueDate: z.coerce.date().optional(),
  standardId: z.string().optional(),
  standardClauseId: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
})

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "objective", title: "Objective", description: "Define the goal", icon: Target },
  { id: "measurement", title: "Measurement", description: "Target and frequency", icon: Gauge },
  { id: "standard", title: "Standard Mapping", description: "Link to ISO clause", icon: BookOpen },
  { id: "ownership", title: "Ownership", description: "Assign and schedule", icon: UserCheck },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  objective: ["title"],
  measurement: ["targetValue", "measurementFrequency"],
  standard: [],
  ownership: ["ownerId"],
}

/* ─────────────── Step Indicator ─────────────── */

function StepIndicator({ steps, currentStep, onStepClick, completedSteps }: {
  steps: typeof STEPS
  currentStep: number
  onStepClick: (index: number) => void
  completedSteps: Set<number>
}) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === currentStep
        const isCompleted = completedSteps.has(index)
        const isPast = index < currentStep
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left w-full ${
                isActive ? "bg-primary text-primary-foreground shadow-sm"
                : isCompleted || isPast ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-semibold ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground"
                : isCompleted ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {isCompleted && !isActive ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-medium truncate">{step.title}</p>
                <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className={`h-4 w-4 shrink-0 mx-1 ${isPast ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────── Props ─────────────── */

interface ObjectiveFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  objective?: {
    id: string
    title: string
    description: string | null
    targetValue: number
    unit: string | null
    measurementFrequency: string
    dueDate: Date | null
    standardId: string | null
    standardClauseId: string | null
    ownerId: string
  }
  standards: { id: string; code: string; name: string }[]
  members: { id: string; name: string }[]
}

/* ─────────────── Main Component ─────────────── */

export function ObjectiveForm({ open, onOpenChange, objective, standards, members }: ObjectiveFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!objective

  const [clauses, setClauses] = useState<{ id: string; clauseNumber: string; title: string }[]>([])
  const [selectedStandardId, setSelectedStandardId] = useState(objective?.standardId || "")

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: objective?.title ?? "",
      description: objective?.description ?? "",
      targetValue: objective?.targetValue ?? 100,
      unit: objective?.unit ?? "",
      measurementFrequency: (objective?.measurementFrequency as ObjectiveFormValues["measurementFrequency"]) ?? "MONTHLY",
      dueDate: objective?.dueDate ?? undefined,
      standardId: objective?.standardId ?? undefined,
      standardClauseId: objective?.standardClauseId ?? undefined,
      ownerId: objective?.ownerId ?? "",
    },
  })

  useEffect(() => {
    if (objective) {
      form.reset({
        title: objective.title, description: objective.description ?? "",
        targetValue: objective.targetValue, unit: objective.unit ?? "",
        measurementFrequency: (objective.measurementFrequency as ObjectiveFormValues["measurementFrequency"]) ?? "MONTHLY",
        dueDate: objective.dueDate ?? undefined,
        standardId: objective.standardId ?? undefined,
        standardClauseId: objective.standardClauseId ?? undefined,
        ownerId: objective.ownerId,
      })
      setSelectedStandardId(objective.standardId || "")
    } else {
      form.reset({
        title: "", description: "", targetValue: 100, unit: "",
        measurementFrequency: "MONTHLY", dueDate: undefined,
        standardId: undefined, standardClauseId: undefined, ownerId: "",
      })
      setSelectedStandardId("")
      setClauses([])
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [objective, form])

  useEffect(() => { if (!open) { setCurrentStep(0); setCompletedSteps(new Set()) } }, [open])

  useEffect(() => {
    if (selectedStandardId) {
      getClausesForStandard(selectedStandardId).then(setClauses)
    } else {
      setClauses([])
    }
  }, [selectedStandardId])

  /* ── Navigation ── */
  async function goToStep(index: number) {
    if (index > currentStep) {
      const fieldsToValidate = STEP_FIELDS[STEPS[currentStep].id]
      if (fieldsToValidate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valid = await form.trigger(fieldsToValidate as any)
        if (!valid) return
      }
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    }
    setCurrentStep(index)
  }
  async function nextStep() { await goToStep(currentStep + 1) }
  function prevStep() { setCurrentStep(Math.max(0, currentStep - 1)) }

  /* ── Submit ── */
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateObjective(objective.id, values)
        : await createObjective(values)
      if (result.success) {
        toast.success(isEditing ? "Objective updated" : "Objective created")
        onOpenChange(false)
        form.reset()
        setSelectedStandardId("")
        setClauses([])
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
            <DialogTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isEditing ? "Edit Objective" : "New Objective & KPI"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the objective details." : "Define a measurable objective linked to your management system."}
            </DialogDescription>
          </DialogHeader>
          <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} completedSteps={completedSteps} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="objective-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: Objective ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Define Objective</h3>
                  </div>
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objective Title *</FormLabel>
                      <FormControl><Input placeholder="e.g. Reduce customer complaints by 20%" {...field} className="h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the objective, its rationale, and how it will be measured..." rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* ═══════════ STEP 2: Measurement ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Measurement & KPI</h3>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Target</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="targetValue" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Value *</FormLabel>
                          <FormControl><Input type="number" step="any" placeholder="100" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <FormControl><Input placeholder="e.g. %, hours, incidents, defects" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Measurement Schedule</Label>
                    <FormField control={form.control} name="measurementFrequency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.entries(MEASUREMENT_FREQUENCIES).map(([v, c]) => (
                              <SelectItem key={v} value={v}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* ═══════════ STEP 3: Standard Mapping ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Standard Mapping</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Optionally link this objective to a specific ISO standard and clause for traceability.
                  </p>

                  <div className="space-y-4 rounded-lg border p-4">
                    <FormField control={form.control} name="standardId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO Standard</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val)
                            setSelectedStandardId(val)
                            form.setValue("standardClauseId", undefined)
                          }}
                          value={field.value}
                        >
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select standard..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {standards.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="standardClauseId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Clause</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={clauses.length === 0}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={clauses.length === 0 ? "Select a standard first" : "Select clause..."} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clauses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>§{c.clauseNumber} — {c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* ═══════════ STEP 4: Ownership ═══════════ */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Ownership & Schedule</h3>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="ownerId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select owner..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              {members.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dueDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <Label className="text-sm font-semibold">Objective Summary</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="ml-2 font-medium">{form.watch("title") || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <span className="ml-2 font-medium">
                          {form.watch("targetValue")} {form.watch("unit") || ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="ml-2">
                          <Badge variant="outline" className="text-xs">
                            {MEASUREMENT_FREQUENCIES[form.watch("measurementFrequency") as keyof typeof MEASUREMENT_FREQUENCIES]?.label}
                          </Badge>
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Standard:</span>
                        <span className="ml-2">
                          {selectedStandardId
                            ? standards.find(s => s.id === selectedStandardId)?.code ?? "—"
                            : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
            ) : (
              <Button type="submit" form="objective-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Objective" : "Create Objective"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

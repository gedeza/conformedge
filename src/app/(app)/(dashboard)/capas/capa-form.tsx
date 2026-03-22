"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Plus, Trash2, ChevronRight, ChevronLeft, Check,
  FileWarning, SearchCode, UserCheck, AlertTriangle, Shield, Wrench,
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
import { CAPA_STATUSES, CAPA_PRIORITIES, CAPA_TYPES } from "@/lib/constants"
import { createCapa, updateCapa, type CapaFormValues } from "./actions"
import type { RootCauseData, RootCauseWhy } from "@/types"

/* ─────────────── Constants ─────────────── */

const ROOT_CAUSE_CATEGORIES = [
  { value: "human", label: "Human", description: "People-related causes" },
  { value: "machine", label: "Machine", description: "Equipment & tools" },
  { value: "material", label: "Material", description: "Raw materials & supplies" },
  { value: "method", label: "Method", description: "Processes & procedures" },
  { value: "environment", label: "Environment", description: "Working conditions" },
  { value: "measurement", label: "Measurement", description: "Monitoring & data" },
] as const

type RootCauseCategory = typeof ROOT_CAUSE_CATEGORIES[number]["value"]

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["CORRECTIVE", "PREVENTIVE"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "VERIFICATION", "CLOSED"]).default("OPEN"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  rootCause: z.string().max(2000).optional(),
  rootCauseData: z.any().optional(),
  dueDate: z.coerce.date().optional(),
  projectId: z.string().optional(),
  assignedToId: z.string().optional(),
})

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "details", title: "CAPA Details", description: "Define the action", icon: FileWarning },
  { id: "rootcause", title: "Root Cause", description: "Analyse the problem", icon: SearchCode },
  { id: "assignment", title: "Assignment", description: "Assign and schedule", icon: UserCheck },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  details: ["title", "type", "priority"],
  rootcause: [],
  assignment: [],
}

/* ─────────────── Helpers ─────────────── */

function createEmptyWhy(index: number): RootCauseWhy {
  return { question: `Why ${index + 1}?`, answer: "" }
}

function parseExistingRootCauseData(capa?: CapaFormProps["capa"]) {
  if (!capa?.rootCauseData) return null
  try {
    const data = capa.rootCauseData as RootCauseData
    if (data.method === "5-whys" || data.method === "simple") return data
    return null
  } catch {
    return null
  }
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
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left w-full
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isCompleted || isPast
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }
              `}
            >
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-semibold
                ${isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }
              `}>
                {isCompleted && !isActive ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-medium truncate">{step.title}</p>
                <p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {step.description}
                </p>
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

interface CapaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  capa?: {
    id: string
    title: string
    description: string | null
    type: string
    status: string
    priority: string
    rootCause: string | null
    rootCauseData?: RootCauseData | null
    dueDate: Date | null
    projectId: string | null
    assignedToId: string | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

/* ─────────────── Main Component ─────────────── */

export function CapaForm({ open, onOpenChange, capa, projects, members }: CapaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!capa

  const existingData = parseExistingRootCauseData(capa)

  const [rcMethod, setRcMethod] = useState<"simple" | "5-whys">(existingData?.method ?? "simple")
  const [rcCategory, setRcCategory] = useState<RootCauseCategory | "">(existingData?.category ?? "")
  const [whys, setWhys] = useState<RootCauseWhy[]>(
    existingData?.method === "5-whys" && existingData.whys.length > 0 ? existingData.whys : [createEmptyWhy(0)]
  )
  const [fiveWhysRootCause, setFiveWhysRootCause] = useState(existingData?.method === "5-whys" ? existingData.rootCause : "")
  const [containmentAction, setContainmentAction] = useState(existingData?.containmentAction ?? "")

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: capa?.title ?? "",
      description: capa?.description ?? "",
      type: (capa?.type as CapaFormValues["type"]) ?? "CORRECTIVE",
      status: (capa?.status as CapaFormValues["status"]) ?? "OPEN",
      priority: (capa?.priority as CapaFormValues["priority"]) ?? "MEDIUM",
      rootCause: capa?.rootCause ?? "",
      dueDate: capa?.dueDate ?? undefined,
      projectId: capa?.projectId ?? undefined,
      assignedToId: capa?.assignedToId ?? undefined,
    },
  })

  const capaType = form.watch("type")

  // Reset on capa change
  useEffect(() => {
    if (capa) {
      form.reset({
        title: capa.title,
        description: capa.description ?? "",
        type: (capa.type as CapaFormValues["type"]) ?? "CORRECTIVE",
        status: (capa.status as CapaFormValues["status"]) ?? "OPEN",
        priority: (capa.priority as CapaFormValues["priority"]) ?? "MEDIUM",
        rootCause: capa.rootCause ?? "",
        dueDate: capa.dueDate ?? undefined,
        projectId: capa.projectId ?? undefined,
        assignedToId: capa.assignedToId ?? undefined,
      })
      const data = parseExistingRootCauseData(capa)
      setRcMethod(data?.method ?? "simple")
      setRcCategory(data?.category ?? "")
      setWhys(data?.method === "5-whys" && data.whys.length > 0 ? data.whys : [createEmptyWhy(0)])
      setFiveWhysRootCause(data?.method === "5-whys" ? data.rootCause : "")
      setContainmentAction(data?.containmentAction ?? "")
    } else {
      form.reset({
        title: "",
        description: "",
        type: "CORRECTIVE",
        status: "OPEN",
        priority: "MEDIUM",
        rootCause: "",
        dueDate: undefined,
        projectId: undefined,
        assignedToId: undefined,
      })
      setRcMethod("simple")
      setRcCategory("")
      setWhys([createEmptyWhy(0)])
      setFiveWhysRootCause("")
      setContainmentAction("")
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [capa, form])

  useEffect(() => {
    if (!open) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
    }
  }, [open])

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

  /* ── 5-Whys helpers ── */

  function addWhy() {
    if (whys.length >= 5) return
    setWhys([...whys, createEmptyWhy(whys.length)])
  }

  function removeWhy(index: number) {
    if (whys.length <= 1) return
    setWhys(whys.filter((_, i) => i !== index))
  }

  function updateWhyAnswer(index: number, answer: string) {
    setWhys(whys.map((w, i) => i === index ? { ...w, answer } : w))
  }

  /* ── Submit ── */

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      let submitValues = { ...values }

      if (rcMethod === "simple") {
        submitValues.rootCauseData = {
          method: "simple" as const,
          whys: [],
          rootCause: values.rootCause ?? "",
        }
      } else {
        const rootCauseData: RootCauseData = {
          method: "5-whys",
          category: rcCategory || undefined,
          whys: whys.filter(w => w.answer.trim()),
          rootCause: fiveWhysRootCause,
          containmentAction: containmentAction || undefined,
        }
        submitValues = { ...values, rootCauseData }
      }

      const result = isEditing
        ? await updateCapa(capa.id, submitValues)
        : await createCapa(submitValues)

      if (result.success) {
        toast.success(isEditing ? "CAPA updated" : "CAPA created")
        onOpenChange(false)
        form.reset()
        setRcMethod("simple")
        setRcCategory("")
        setWhys([createEmptyWhy(0)])
        setFiveWhysRootCause("")
        setContainmentAction("")
      } else {
        toast.error(result.error)
      }
    })
  }

  /* ─────────────── Render ─────────────── */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {capaType === "CORRECTIVE" ? <Wrench className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
              {isEditing ? "Edit CAPA" : "New Corrective / Preventive Action"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the CAPA details below."
                : "Define the action, analyse the root cause, and assign responsibility."
              }
            </DialogDescription>
          </DialogHeader>
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="capa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: CAPA Details ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FileWarning className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">CAPA Details</h3>
                  </div>

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Concise description of the corrective or preventive action" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the non-conformity, problem, or risk that this action addresses..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Type selector — visual cards */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Action Type *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => form.setValue("type", "CORRECTIVE")}
                        className={`
                          flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all
                          ${capaType === "CORRECTIVE"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/30"
                          }
                        `}
                      >
                        <Wrench className={`h-5 w-5 mt-0.5 shrink-0 ${capaType === "CORRECTIVE" ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium text-sm">Corrective Action</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Fix an existing non-conformity or problem that has already occurred</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => form.setValue("type", "PREVENTIVE")}
                        className={`
                          flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all
                          ${capaType === "PREVENTIVE"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-muted hover:border-muted-foreground/30"
                          }
                        `}
                      >
                        <Shield className={`h-5 w-5 mt-0.5 shrink-0 ${capaType === "PREVENTIVE" ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium text-sm">Preventive Action</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Prevent a potential non-conformity or risk from occurring</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isEditing && (
                      <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CAPA_STATUSES).filter(([k]) => k !== "OVERDUE").map(([v, c]) => (
                                <SelectItem key={v} value={v}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CAPA_PRIORITIES).map(([v, c]) => (
                              <SelectItem key={v} value={v}>
                                <span className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${c.color.split(" ")[0]}`} />
                                  {c.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Priority warning */}
                  {(form.watch("priority") === "HIGH" || form.watch("priority") === "CRITICAL") && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">{form.watch("priority") === "CRITICAL" ? "Critical" : "High"} priority CAPA</p>
                        <p className="text-red-600 dark:text-red-300 mt-0.5">
                          This action requires urgent attention and should be resolved within the shortest possible timeframe.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 2: Root Cause Analysis ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <SearchCode className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Root Cause Analysis</h3>
                  </div>

                  {/* Method toggle */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Analysis Method</Label>
                    <div className="flex rounded-lg border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setRcMethod("simple")}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                          rcMethod === "simple"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        Simple
                      </button>
                      <button
                        type="button"
                        onClick={() => setRcMethod("5-whys")}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                          rcMethod === "5-whys"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        5-Whys Method
                      </button>
                    </div>
                  </div>

                  {rcMethod === "simple" ? (
                    <FormField control={form.control} name="rootCause" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Root Cause</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the underlying root cause of the problem..." rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ) : (
                    <div className="space-y-5">
                      {/* Ishikawa Category */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Category (Ishikawa / Fishbone)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ROOT_CAUSE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setRcCategory(cat.value)}
                              className={`
                                flex flex-col items-start rounded-lg border-2 p-3 text-left transition-all
                                ${rcCategory === cat.value
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-muted hover:border-muted-foreground/30"
                                }
                              `}
                            >
                              <p className="font-medium text-sm">{cat.label}</p>
                              <p className="text-xs text-muted-foreground">{cat.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Why chain */}
                      <div className="space-y-3 rounded-lg border p-4">
                        <Label className="text-sm font-semibold">Why Analysis</Label>
                        {whys.map((w, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Why {index + 1}?</Label>
                              {whys.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeWhy(index)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <Textarea
                              value={w.answer}
                              onChange={(e) => updateWhyAnswer(index, e.target.value)}
                              placeholder={`Why did ${index === 0 ? "this problem occur" : "that happen"}?`}
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        ))}
                        {whys.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addWhy}
                            className="w-full"
                            disabled={!whys[whys.length - 1]?.answer.trim()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Why {whys.length + 1}
                          </Button>
                        )}
                      </div>

                      {/* Final root cause */}
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Root Cause (final determination)</Label>
                        <Textarea
                          value={fiveWhysRootCause}
                          onChange={(e) => setFiveWhysRootCause(e.target.value)}
                          placeholder="The ultimate root cause determined from the analysis..."
                          rows={3}
                        />
                      </div>

                      {/* Containment action */}
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1.5 block">Containment Action (optional)</Label>
                        <Textarea
                          value={containmentAction}
                          onChange={(e) => setContainmentAction(e.target.value)}
                          placeholder="Immediate containment action taken to limit impact while root cause is being addressed..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 3: Assignment ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Assignment & Scheduling</h3>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Responsibility</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="assignedToId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select responsible person..." />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Project</Label>
                    <FormField control={form.control} name="projectId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Project (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select project..." />
                            </SelectTrigger>
                          </FormControl>
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

                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <Label className="text-sm font-semibold">CAPA Summary</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2">
                          <Badge variant="outline" className="text-xs">
                            {capaType === "CORRECTIVE" ? "Corrective" : "Preventive"}
                          </Badge>
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="ml-2">
                          <Badge variant="outline" className="text-xs">
                            {CAPA_PRIORITIES[form.watch("priority") as keyof typeof CAPA_PRIORITIES]?.label}
                          </Badge>
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="ml-2 font-medium">{form.watch("title") || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Analysis:</span>
                        <span className="ml-2">{rcMethod === "5-whys" ? `5-Whys (${whys.filter(w => w.answer.trim()).length} completed)` : "Simple"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" form="capa-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update CAPA" : "Create CAPA"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

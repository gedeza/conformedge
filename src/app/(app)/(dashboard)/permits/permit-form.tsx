"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Plus, Trash2, ChevronRight, ChevronLeft, Check,
  ClipboardList, ShieldAlert, HardHat, CalendarClock, AlertTriangle,
  Flame, Wind, ArrowUpFromDot, Zap, Construction, ChevronsUp,
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
import { WORK_PERMIT_TYPES, RISK_LEVELS } from "@/lib/constants"
import { createPermit, updatePermit, type PermitFormValues } from "./actions"

/* ─────────────── Constants ─────────────── */

const PPE_OPTIONS = [
  "Hard Hat", "Safety Boots", "Safety Glasses", "Hi-Vis Vest",
  "Gloves (leather)", "Gloves (chemical)", "Respirator / Dust Mask",
  "Full Face Shield", "Welding Shield", "Safety Harness / Lanyard",
  "Hearing Protection", "Fire Retardant Clothing", "Chemical Suit",
  "Life Jacket", "Other",
] as const

const PERMIT_TYPE_ICONS: Record<string, typeof Flame> = {
  HOT_WORK: Flame,
  CONFINED_SPACE: Wind,
  WORKING_AT_HEIGHTS: ArrowUpFromDot,
  ELECTRICAL: Zap,
  EXCAVATION: Construction,
  LIFTING: ChevronsUp,
  GENERAL: ClipboardList,
}

const PERMIT_GUIDANCE: Record<string, { color: string; title: string; items: string[] }> = {
  HOT_WORK: {
    color: "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 text-red-800 dark:text-red-200",
    title: "Hot Work Requirements",
    items: [
      "Fire watcher must be assigned for the duration of work",
      "Fire extinguisher within 10m of work area",
      "Combustible materials cleared from the work area",
      "Gas testing completed before work begins",
    ],
  },
  CONFINED_SPACE: {
    color: "border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900 text-purple-800 dark:text-purple-200",
    title: "Confined Space Requirements",
    items: [
      "Atmospheric testing (O₂, LEL, H₂S, CO) completed before entry",
      "Standby person stationed at entry point at all times",
      "Rescue plan must be in place before work starts",
      "Communication system established between entrant and standby",
    ],
  },
  WORKING_AT_HEIGHTS: {
    color: "border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 dark:border-sky-900 text-sky-800 dark:text-sky-200",
    title: "Working at Heights Requirements",
    items: [
      "Fall protection required above 2m",
      "Safety harness inspected and properly anchored",
      "Scaffolding must be certified and inspected",
      "Edge protection and toe boards in place",
    ],
  },
  ELECTRICAL: {
    color: "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200",
    title: "Electrical Work Requirements",
    items: [
      "Lock-out / Tag-out (LOTO) procedures must be followed",
      "Only qualified electricians may perform work",
      "Voltage testing completed before work begins",
      "Rubber insulating gloves and mats required",
    ],
  },
  EXCAVATION: {
    color: "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 text-amber-800 dark:text-amber-200",
    title: "Excavation Requirements",
    items: [
      "Underground services located and marked",
      "Shoring required for depths exceeding 1.5m",
      "Barricading and signage around the excavation",
      "Safe access/egress provided (ladder within 7.5m)",
    ],
  },
  LIFTING: {
    color: "border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200",
    title: "Lifting Operations Requirements",
    items: [
      "Lift plan prepared and approved",
      "Crane/equipment load charts checked against load weight",
      "Exclusion zone established and enforced",
      "Rigging inspected and certified",
    ],
  },
}

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  permitType: z.enum(["HOT_WORK", "CONFINED_SPACE", "WORKING_AT_HEIGHTS", "ELECTRICAL", "EXCAVATION", "LIFTING", "GENERAL"]),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  location: z.string().min(1, "Location is required").max(500),
  description: z.string().min(1, "Description is required").max(5000),
  hazardsIdentified: z.string().max(5000).optional(),
  precautions: z.string().max(5000).optional(),
  ppeRequirements: z.string().max(2000).optional(),
  emergencyProcedures: z.string().max(5000).optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  projectId: z.string().optional(),
  issuedById: z.string().optional(),
})

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "work", title: "Work Details", description: "What work is being done?", icon: ClipboardList },
  { id: "hazards", title: "Hazards & Risks", description: "Identify dangers and controls", icon: ShieldAlert },
  { id: "ppe", title: "PPE & Safety", description: "Equipment and procedures", icon: HardHat },
  { id: "validity", title: "Validity & Assignment", description: "Dates, project, and issuer", icon: CalendarClock },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  work: ["title", "permitType", "riskLevel", "location", "description"],
  hazards: [],
  ppe: [],
  validity: ["validFrom", "validTo"],
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

interface PermitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permit?: {
    id: string
    title: string
    permitType: string
    riskLevel: string
    location: string
    description: string
    hazardsIdentified?: string | null
    precautions?: string | null
    ppeRequirements?: string | null
    emergencyProcedures?: string | null
    validFrom: Date
    validTo: Date
    projectId: string | null
    issuedById: string | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

/* ─────────────── Main Component ─────────────── */

export function PermitForm({ open, onOpenChange, permit, projects, members }: PermitFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!permit

  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [selectedPPE, setSelectedPPE] = useState<string[]>(
    permit?.ppeRequirements ? permit.ppeRequirements.split(",").map(s => s.trim()).filter(Boolean) : []
  )

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: permit?.title ?? "",
      permitType: (permit?.permitType as PermitFormValues["permitType"]) ?? "GENERAL",
      riskLevel: (permit?.riskLevel as PermitFormValues["riskLevel"]) ?? "MEDIUM",
      location: permit?.location ?? "",
      description: permit?.description ?? "",
      hazardsIdentified: permit?.hazardsIdentified ?? "",
      precautions: permit?.precautions ?? "",
      ppeRequirements: permit?.ppeRequirements ?? "",
      emergencyProcedures: permit?.emergencyProcedures ?? "",
      validFrom: permit?.validFrom ?? new Date(),
      validTo: permit?.validTo ?? new Date(Date.now() + 8 * 60 * 60 * 1000),
      projectId: permit?.projectId ?? undefined,
      issuedById: permit?.issuedById ?? undefined,
    },
  })

  const permitType = form.watch("permitType")
  const PermitIcon = PERMIT_TYPE_ICONS[permitType] ?? ClipboardList
  const guidance = PERMIT_GUIDANCE[permitType]

  // Reset on permit change
  useEffect(() => {
    if (permit) {
      form.reset({
        title: permit.title,
        permitType: (permit.permitType as PermitFormValues["permitType"]) ?? "GENERAL",
        riskLevel: (permit.riskLevel as PermitFormValues["riskLevel"]) ?? "MEDIUM",
        location: permit.location,
        description: permit.description,
        hazardsIdentified: permit.hazardsIdentified ?? "",
        precautions: permit.precautions ?? "",
        ppeRequirements: permit.ppeRequirements ?? "",
        emergencyProcedures: permit.emergencyProcedures ?? "",
        validFrom: permit.validFrom,
        validTo: permit.validTo,
        projectId: permit.projectId ?? undefined,
        issuedById: permit.issuedById ?? undefined,
      })
      setSelectedPPE(permit.ppeRequirements ? permit.ppeRequirements.split(",").map(s => s.trim()).filter(Boolean) : [])
    } else {
      form.reset({
        title: "",
        permitType: "GENERAL",
        riskLevel: "MEDIUM",
        location: "",
        description: "",
        hazardsIdentified: "",
        precautions: "",
        ppeRequirements: "",
        emergencyProcedures: "",
        validFrom: new Date(),
        validTo: new Date(Date.now() + 8 * 60 * 60 * 1000),
        projectId: undefined,
        issuedById: undefined,
      })
      setChecklistItems([])
      setSelectedPPE([])
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [permit, form])

  // Reset step on close
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

  /* ── PPE & Checklist helpers ── */

  function togglePPE(item: string) {
    const updated = selectedPPE.includes(item)
      ? selectedPPE.filter(p => p !== item)
      : [...selectedPPE, item]
    setSelectedPPE(updated)
    form.setValue("ppeRequirements", updated.join(", "))
  }

  function addChecklistItem() {
    if (newItem.trim()) {
      setChecklistItems([...checklistItems, newItem.trim()])
      setNewItem("")
    }
  }

  function removeChecklistItem(index: number) {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  /* ── Submit ── */

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submitValues = {
        ...values,
        ppeRequirements: selectedPPE.length > 0 ? selectedPPE.join(", ") : undefined,
        checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      }

      const result = isEditing
        ? await updatePermit(permit.id, submitValues)
        : await createPermit(submitValues)

      if (result.success) {
        toast.success(isEditing ? "Permit updated" : "Permit created")
        onOpenChange(false)
        form.reset()
        setChecklistItems([])
        setSelectedPPE([])
      } else {
        toast.error(result.error)
      }
    })
  }

  /* ─────────────── Render ─────────────── */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <PermitIcon className="h-5 w-5" />
              {isEditing ? "Edit Work Permit" : "Create Work Permit"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the permit details below."
                : "Complete each section to issue a permit to work. All required fields must be completed."
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
            <form id="permit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: Work Details ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Work Details</h3>
                  </div>

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Description / Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of work to be performed" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="permitType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permit Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(WORK_PERMIT_TYPES).map(([v, c]) => {
                              const TypeIcon = PERMIT_TYPE_ICONS[v] ?? ClipboardList
                              return (
                                <SelectItem key={v} value={v}>
                                  <span className="flex items-center gap-2">
                                    <TypeIcon className="h-4 w-4" />
                                    {c.label}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="riskLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(RISK_LEVELS).map(([v, c]) => (
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
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location / Site Area *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Building A, Level 3" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope of Work *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of the work to be performed, including tools, equipment, and methods..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Risk level warning */}
                  {(form.watch("riskLevel") === "HIGH" || form.watch("riskLevel") === "CRITICAL") && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">
                          {form.watch("riskLevel") === "CRITICAL" ? "Critical" : "High"} risk work
                        </p>
                        <p className="text-red-600 dark:text-red-300 mt-0.5">
                          This permit requires senior management approval before work may commence.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 2: Hazards & Risks ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Hazards & Risk Assessment</h3>
                    {permitType !== "GENERAL" && (
                      <Badge variant="outline" className="ml-auto text-xs flex items-center gap-1">
                        <PermitIcon className="h-3 w-3" />
                        {WORK_PERMIT_TYPES[permitType as keyof typeof WORK_PERMIT_TYPES]?.label}
                      </Badge>
                    )}
                  </div>

                  {/* Permit-type-specific guidance */}
                  {guidance && (
                    <div className={`rounded-lg border p-4 space-y-2 ${guidance.color}`}>
                      <div className="flex items-center gap-2">
                        <PermitIcon className="h-5 w-5 shrink-0" />
                        <p className="font-semibold text-sm">{guidance.title}</p>
                      </div>
                      <ul className="space-y-1.5 ml-7">
                        {guidance.items.map((item, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <FormField control={form.control} name="hazardsIdentified" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazards Identified</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List all identified hazards associated with this work (e.g. fire risk, toxic fumes, fall hazard, electrical shock)..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="precautions" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precautions / Control Measures</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Safety measures and controls to mitigate the identified hazards..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* ═══════════ STEP 3: PPE & Safety ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <HardHat className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">PPE & Safety Controls</h3>
                  </div>

                  {/* PPE Selection */}
                  <div className="space-y-3 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">
                      Required Personal Protective Equipment
                      {selectedPPE.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">{selectedPPE.length} selected</Badge>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3 bg-background">
                      {PPE_OPTIONS.map(ppe => (
                        <label key={ppe} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={selectedPPE.includes(ppe)}
                            onChange={() => togglePPE(ppe)}
                            className="rounded border-gray-300 h-4 w-4 accent-blue-600"
                          />
                          {ppe}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Procedures */}
                  <FormField control={form.control} name="emergencyProcedures" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Procedures</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Emergency response steps, assembly point, emergency contacts, first aid provisions..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Safety Checklist Builder (create only) */}
                  {!isEditing && (
                    <div className="space-y-3 rounded-lg border p-4">
                      <Label className="text-sm font-semibold">
                        Safety Checklist Items
                        {checklistItems.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">{checklistItems.length} items</Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add pre-work safety checks that must be verified before work commences.
                      </p>
                      {checklistItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-lg bg-background border px-3 py-2">
                          <span className="text-sm text-muted-foreground font-medium w-6">{index + 1}.</span>
                          <span className="text-sm flex-1">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          placeholder="e.g. Gas detector calibrated and tested"
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem() } }}
                          className="h-10"
                        />
                        <Button type="button" variant="outline" onClick={addChecklistItem} disabled={!newItem.trim()} className="shrink-0">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 4: Validity & Assignment ═══════════ */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Validity & Assignment</h3>
                  </div>

                  {/* Validity Period */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Permit Validity Period</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="validFrom" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid From *</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="validTo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid To *</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Assignment</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="projectId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project / Site</FormLabel>
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
                      <FormField control={form.control} name="issuedById" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Authorised Issuer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select issuer..." />
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
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <Label className="text-sm font-semibold">Permit Summary</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium flex items-center gap-1 inline-flex">
                          <PermitIcon className="h-3.5 w-3.5" />
                          {WORK_PERMIT_TYPES[permitType as keyof typeof WORK_PERMIT_TYPES]?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span>
                        <span className="ml-2">
                          <Badge variant="outline" className="text-xs">
                            {RISK_LEVELS[form.watch("riskLevel") as keyof typeof RISK_LEVELS]?.label}
                          </Badge>
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="ml-2 font-medium">{form.watch("location") || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">PPE:</span>
                        <span className="ml-2">{selectedPPE.length > 0 ? `${selectedPPE.length} items` : "None selected"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </Form>
        </div>

        {/* Footer with navigation */}
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
              <Button type="submit" form="permit-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Permit" : "Issue Permit"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Plus, Trash2, ChevronRight, ChevronLeft, Check,
  FileText, Users, Heart, Search, AlertTriangle,
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
import { INCIDENT_TYPES, RISK_LEVELS, TREATMENT_TYPES, CONTRIBUTING_FACTORS, MHSA_SECTIONS, BODY_PARTS, NATURE_OF_INJURIES } from "@/lib/constants"
import { BodyMapDual } from "@/components/shared/body-map-dual"
import { createIncident, updateIncident, type IncidentFormValues } from "./actions"
import type { RootCauseData, RootCauseWhy } from "@/types"

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  incidentType: z.enum(["NEAR_MISS", "FIRST_AID", "MEDICAL", "LOST_TIME", "FATALITY", "ENVIRONMENTAL", "PROPERTY_DAMAGE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  incidentDate: z.coerce.date(),
  location: z.string().max(500).optional(),
  injuredParty: z.string().max(500).optional(),
  witnesses: z.string().max(2000).optional(),
  immediateAction: z.string().max(2000).optional(),
  rootCause: z.string().max(2000).optional(),
  rootCauseData: z.any().optional(),
  incidentTime: z.string().max(5).optional(),
  lostDays: z.coerce.number().int().min(0).optional(),
  bodyPartInjured: z.string().max(500).optional(),
  natureOfInjury: z.string().max(500).optional(),
  treatmentType: z.enum(["NONE", "FIRST_AID", "MEDICAL", "HOSPITALIZED"]).optional(),
  contributingFactors: z.array(z.string()).optional(),
  isReportable: z.boolean().default(false),
  mhsaSection: z.enum(["11", "23", "24"]).optional(),
  investigationDue: z.coerce.date().optional(),
  projectId: z.string().optional(),
  investigatorId: z.string().optional(),
  victimOccupation: z.string().max(200).optional(),
  victimStaffNo: z.string().max(50).optional(),
  victimDepartment: z.string().max(200).optional(),
  victimIdNumber: z.string().max(50).optional(),
  victimNationality: z.string().max(100).optional(),
  victimContractor: z.string().max(200).optional(),
  immediateSupervisor: z.string().max(200).optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  spillVolume: z.coerce.number().min(0).optional(),
  impactAreas: z.array(z.string()).optional(),
  nonInjuriousType: z.string().max(200).optional(),
  returnedToWork: z.boolean().optional(),
  returnedToWorkDate: z.coerce.date().optional(),
})

/* ─────────────── Constants ─────────────── */

const ROOT_CAUSE_CATEGORIES = [
  { value: "human", label: "Human" },
  { value: "machine", label: "Machine" },
  { value: "material", label: "Material" },
  { value: "method", label: "Method" },
  { value: "environment", label: "Environment" },
  { value: "measurement", label: "Measurement" },
] as const

type RootCauseCategory = typeof ROOT_CAUSE_CATEGORIES[number]["value"]

const INJURY_TYPES = ["FIRST_AID", "MEDICAL", "LOST_TIME", "FATALITY"] as const
const NON_INJURY_TYPES = ["ENVIRONMENTAL", "PROPERTY_DAMAGE", "NEAR_MISS"] as const

const STEPS = [
  { id: "details", title: "Incident Details", description: "What happened?", icon: FileText },
  { id: "personnel", title: "People Involved", description: "Who was affected?", icon: Users },
  { id: "injury", title: "Injury & Impact", description: "Injury details and consequences", icon: Heart },
  { id: "investigation", title: "Investigation", description: "Root cause and reporting", icon: Search },
] as const

type StepId = typeof STEPS[number]["id"]

// Fields to validate per step
const STEP_FIELDS: Record<StepId, string[]> = {
  details: ["title", "incidentType", "severity", "incidentDate"],
  personnel: [],
  injury: [],
  investigation: [],
}

/* ─────────────── Helpers ─────────────── */

function createEmptyWhy(index: number): RootCauseWhy {
  return { question: `Why ${index + 1}?`, answer: "" }
}

function parseExistingRootCauseData(incident?: IncidentFormProps["incident"]) {
  if (!incident?.rootCauseData) return null
  try {
    const data = incident.rootCauseData as RootCauseData
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

interface IncidentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incident?: {
    id: string
    title: string
    description: string | null
    incidentType: string
    severity: string
    incidentDate: Date
    location: string | null
    injuredParty: string | null
    witnesses: string | null
    immediateAction: string | null
    rootCause: string | null
    rootCauseData?: RootCauseData | null
    incidentTime: string | null
    lostDays: number | null
    bodyPartInjured: string | null
    natureOfInjury: string | null
    treatmentType: string | null
    contributingFactors: unknown
    isReportable: boolean
    mhsaSection: string | null
    investigationDue: Date | null
    projectId: string | null
    investigatorId: string | null
    victimOccupation: string | null
    victimStaffNo: string | null
    victimDepartment: string | null
    victimIdNumber: string | null
    victimNationality: string | null
    victimContractor: string | null
    immediateSupervisor: string | null
    estimatedCost: number | null
    spillVolume: number | null
    impactAreas: unknown
    nonInjuriousType: string | null
    returnedToWork: boolean | null
    returnedToWorkDate: Date | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
}

/* ─────────────── Main Component ─────────────── */

export function IncidentForm({ open, onOpenChange, incident, projects, members }: IncidentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!incident

  const existingData = parseExistingRootCauseData(incident)

  const [rcMethod, setRcMethod] = useState<"simple" | "5-whys">(existingData?.method ?? "simple")
  const [rcCategory, setRcCategory] = useState<RootCauseCategory | "">(existingData?.category ?? "")
  const [whys, setWhys] = useState<RootCauseWhy[]>(
    existingData?.method === "5-whys" && existingData.whys.length > 0 ? existingData.whys : [createEmptyWhy(0)]
  )
  const [fiveWhysRootCause, setFiveWhysRootCause] = useState(existingData?.method === "5-whys" ? existingData.rootCause : "")
  const [containmentAction, setContainmentAction] = useState(existingData?.containmentAction ?? "")
  const [selectedFactors, setSelectedFactors] = useState<string[]>((incident?.contributingFactors as string[]) ?? [])
  const [selectedImpactAreas, setSelectedImpactAreas] = useState<string[]>((incident?.impactAreas as string[]) ?? [])

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: incident?.title ?? "",
      description: incident?.description ?? "",
      incidentType: (incident?.incidentType as IncidentFormValues["incidentType"]) ?? "NEAR_MISS",
      severity: (incident?.severity as IncidentFormValues["severity"]) ?? "MEDIUM",
      incidentDate: incident?.incidentDate ?? new Date(),
      location: incident?.location ?? "",
      injuredParty: incident?.injuredParty ?? "",
      witnesses: incident?.witnesses ?? "",
      immediateAction: incident?.immediateAction ?? "",
      rootCause: incident?.rootCause ?? "",
      incidentTime: incident?.incidentTime ?? "",
      lostDays: incident?.lostDays ?? undefined,
      bodyPartInjured: incident?.bodyPartInjured ?? "",
      natureOfInjury: incident?.natureOfInjury ?? "",
      treatmentType: (incident?.treatmentType as "NONE" | "FIRST_AID" | "MEDICAL" | "HOSPITALIZED") ?? undefined,
      isReportable: incident?.isReportable ?? false,
      mhsaSection: (incident?.mhsaSection as "11" | "23" | "24") ?? undefined,
      investigationDue: incident?.investigationDue ?? undefined,
      projectId: incident?.projectId ?? undefined,
      investigatorId: incident?.investigatorId ?? undefined,
      victimOccupation: incident?.victimOccupation ?? "",
      victimStaffNo: incident?.victimStaffNo ?? "",
      victimDepartment: incident?.victimDepartment ?? "",
      victimIdNumber: incident?.victimIdNumber ?? "",
      victimNationality: incident?.victimNationality ?? "",
      victimContractor: incident?.victimContractor ?? "",
      immediateSupervisor: incident?.immediateSupervisor ?? "",
      estimatedCost: incident?.estimatedCost ?? undefined,
      spillVolume: incident?.spillVolume ?? undefined,
      nonInjuriousType: incident?.nonInjuriousType ?? "",
      returnedToWork: incident?.returnedToWork ?? undefined,
      returnedToWorkDate: incident?.returnedToWorkDate ?? undefined,
    },
  })

  const incidentType = form.watch("incidentType")
  const isInjuryType = INJURY_TYPES.includes(incidentType as typeof INJURY_TYPES[number])
  const isNonInjuryType = NON_INJURY_TYPES.includes(incidentType as typeof NON_INJURY_TYPES[number])

  // Reset form when incident changes
  useEffect(() => {
    if (incident) {
      form.reset({
        title: incident.title,
        description: incident.description ?? "",
        incidentType: incident.incidentType as IncidentFormValues["incidentType"],
        severity: incident.severity as IncidentFormValues["severity"],
        incidentDate: incident.incidentDate,
        location: incident.location ?? "",
        injuredParty: incident.injuredParty ?? "",
        witnesses: incident.witnesses ?? "",
        immediateAction: incident.immediateAction ?? "",
        rootCause: incident.rootCause ?? "",
        incidentTime: incident.incidentTime ?? "",
        lostDays: incident.lostDays ?? undefined,
        bodyPartInjured: incident.bodyPartInjured ?? "",
        natureOfInjury: incident.natureOfInjury ?? "",
        treatmentType: (incident.treatmentType as "NONE" | "FIRST_AID" | "MEDICAL" | "HOSPITALIZED") ?? undefined,
        isReportable: incident.isReportable ?? false,
        mhsaSection: (incident.mhsaSection as "11" | "23" | "24") ?? undefined,
        investigationDue: incident.investigationDue ?? undefined,
        projectId: incident.projectId ?? undefined,
        investigatorId: incident.investigatorId ?? undefined,
        victimOccupation: incident.victimOccupation ?? "",
        victimStaffNo: incident.victimStaffNo ?? "",
        victimDepartment: incident.victimDepartment ?? "",
        victimIdNumber: incident.victimIdNumber ?? "",
        victimNationality: incident.victimNationality ?? "",
        victimContractor: incident.victimContractor ?? "",
        immediateSupervisor: incident.immediateSupervisor ?? "",
        estimatedCost: incident.estimatedCost ?? undefined,
        spillVolume: incident.spillVolume ?? undefined,
        nonInjuriousType: incident.nonInjuriousType ?? "",
        returnedToWork: incident.returnedToWork ?? undefined,
        returnedToWorkDate: incident.returnedToWorkDate ?? undefined,
      })
      setSelectedImpactAreas((incident.impactAreas as string[]) ?? [])
      const data = parseExistingRootCauseData(incident)
      setRcMethod(data?.method ?? "simple")
      setRcCategory(data?.category ?? "")
      setWhys(data?.method === "5-whys" && data.whys.length > 0 ? data.whys : [createEmptyWhy(0)])
      setFiveWhysRootCause(data?.method === "5-whys" ? data.rootCause : "")
      setContainmentAction(data?.containmentAction ?? "")
      setSelectedFactors((incident.contributingFactors as string[]) ?? [])
    } else {
      form.reset({
        title: "",
        description: "",
        incidentType: "NEAR_MISS",
        severity: "MEDIUM",
        incidentDate: new Date(),
        location: "",
        injuredParty: "",
        witnesses: "",
        immediateAction: "",
        rootCause: "",
        incidentTime: "",
        lostDays: undefined,
        bodyPartInjured: "",
        natureOfInjury: "",
        treatmentType: undefined,
        isReportable: false,
        mhsaSection: undefined,
        investigationDue: undefined,
        projectId: undefined,
        investigatorId: undefined,
        victimOccupation: "",
        victimStaffNo: "",
        victimDepartment: "",
        victimIdNumber: "",
        victimNationality: "",
        victimContractor: "",
        immediateSupervisor: "",
        estimatedCost: undefined,
        spillVolume: undefined,
        nonInjuriousType: "",
        returnedToWork: undefined,
        returnedToWorkDate: undefined,
      })
      setRcMethod("simple")
      setRcCategory("")
      setWhys([createEmptyWhy(0)])
      setFiveWhysRootCause("")
      setContainmentAction("")
      setSelectedFactors([])
      setSelectedImpactAreas([])
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident])

  // Also reset step on open/close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
    }
  }, [open])

  /* ── Navigation ── */

  async function goToStep(index: number) {
    // Validate current step before going forward
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

  async function nextStep() {
    await goToStep(currentStep + 1)
  }

  function prevStep() {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

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
      let submitValues = {
        ...values,
        contributingFactors: selectedFactors.length > 0 ? selectedFactors : undefined,
        impactAreas: selectedImpactAreas.length > 0 ? selectedImpactAreas : undefined,
      }

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
        submitValues = { ...submitValues, rootCauseData }
      }

      const result = isEditing
        ? await updateIncident(incident.id, submitValues)
        : await createIncident(submitValues)

      if (result.success) {
        toast.success(isEditing ? "Incident updated" : "Incident reported")
        onOpenChange(false)
        form.reset()
        setRcMethod("simple")
        setRcCategory("")
        setWhys([createEmptyWhy(0)])
        setFiveWhysRootCause("")
        setContainmentAction("")
        setSelectedFactors([])
        setSelectedImpactAreas([])
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
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Incident Report" : "Report New Incident"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the incident details below."
                : "Complete each section to file an incident report. Required fields are marked with *."
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
            <form id="incident-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: Incident Details ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Incident Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the incident" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed account of what happened, including sequence of events..." rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="incidentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(INCIDENT_TYPES).map(([v, c]) => (
                                <SelectItem key={v} value={v}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity *</FormLabel>
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
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incident *</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="incidentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time of Incident</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Where did it happen?" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
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
                      )}
                    />
                  </div>

                  {/* Severity warning for critical */}
                  {form.watch("severity") === "CRITICAL" && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">Critical severity incident</p>
                        <p className="text-red-600 dark:text-red-300 mt-0.5">
                          This will trigger immediate notifications to senior management. Ensure all details are accurate.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 2: People Involved ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">People Involved</h3>
                  </div>

                  {/* Injured Party */}
                  <FormField
                    control={form.control}
                    name="injuredParty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Injured / Affected Person&apos;s Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name of the injured or affected person" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Personnel Details */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Personnel Details</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField control={form.control} name="victimOccupation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation / Job Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Electrician, Operator" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="victimStaffNo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff / Employee No.</FormLabel>
                          <FormControl><Input placeholder="Employee number" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="victimDepartment" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department / Section</FormLabel>
                          <FormControl><Input placeholder="e.g. Operations, Maintenance" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField control={form.control} name="victimIdNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID / Passport Number</FormLabel>
                          <FormControl><Input placeholder="SA ID or passport number" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="victimNationality" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl><Input placeholder="e.g. South African" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="victimContractor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contractor Company</FormLabel>
                          <FormControl><Input placeholder="If applicable" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="immediateSupervisor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Immediate Supervisor</FormLabel>
                          <FormControl><Input placeholder="Name of direct supervisor" {...field} className="h-10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Witnesses */}
                  <FormField
                    control={form.control}
                    name="witnesses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Witnesses</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Names and contact details of any witnesses to the incident..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ═══════════ STEP 3: Injury & Impact ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Injury & Impact</h3>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {isInjuryType ? "Injury Incident" : "Non-Injurious Incident"}
                    </Badge>
                  </div>

                  {/* Non-Injurious Classification */}
                  {isNonInjuryType && (
                    <div className="space-y-3 rounded-lg border border-amber-200 dark:border-amber-900 p-4 bg-amber-50/50 dark:bg-amber-950/20">
                      <Label className="text-sm font-semibold">Non-Injurious Incident Classification</Label>
                      <FormField control={form.control} name="nonInjuriousType" render={({ field }) => {
                        const options = [
                          "Fire / Explosion", "Equipment Damage", "Vehicle Hazard",
                          "Oil / Chemical Spill", "Ammonia Release", "CNG Release",
                          "WWTP Discharge", "Public / Security", "Other",
                        ]
                        return (
                          <FormItem>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3 bg-background">
                              {options.map(opt => (
                                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5">
                                  <input
                                    type="radio"
                                    name="nonInjuriousType"
                                    checked={field.value === opt}
                                    onChange={() => field.onChange(opt)}
                                    className="h-4 w-4 accent-amber-600"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )
                      }} />
                    </div>
                  )}

                  {/* Injury Details — shown for injury types */}
                  {isInjuryType && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <Label className="text-sm font-semibold">Injury Details</Label>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-5">
                        {/* Nature of Injury */}
                        <FormField control={form.control} name="natureOfInjury" render={({ field }) => {
                          const selected = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                          function toggleInjury(injury: string) {
                            const updated = selected.includes(injury)
                              ? selected.filter((i: string) => i !== injury)
                              : [...selected, injury]
                            field.onChange(updated.join(", "))
                          }
                          return (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Nature of Injury
                                {selected.length > 0 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">{selected.length} selected</Badge>
                                )}
                              </FormLabel>
                              <div className="grid grid-cols-1 gap-1 rounded-md border p-3 bg-background max-h-[380px] overflow-y-auto">
                                {NATURE_OF_INJURIES.map(injury => (
                                  <label key={injury} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                                    <input
                                      type="checkbox"
                                      checked={selected.includes(injury)}
                                      onChange={() => toggleInjury(injury)}
                                      className="rounded border-gray-300 h-4 w-4 accent-red-600"
                                    />
                                    {injury}
                                  </label>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )
                        }} />

                        {/* Body Map */}
                        <FormField control={form.control} name="bodyPartInjured" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Body Map</FormLabel>
                            <BodyMapDual value={field.value || undefined} onChange={field.onChange} />
                          </FormItem>
                        )} />

                        {/* Right column: body parts checklist + treatment + lost days */}
                        <div className="grid grid-cols-1 gap-4 content-start">
                          <FormField control={form.control} name="bodyPartInjured" render={({ field }) => {
                            const selected = (field.value || "").split(",").map((s: string) => s.trim()).filter(Boolean)
                            function togglePart(bp: string) {
                              const updated = selected.includes(bp)
                                ? selected.filter((p: string) => p !== bp)
                                : [...selected, bp]
                              field.onChange(updated.join(", "))
                            }
                            return (
                              <FormItem>
                                <FormLabel className="font-semibold">
                                  Body Parts Injured
                                  {selected.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 text-xs">{selected.length} selected</Badge>
                                  )}
                                </FormLabel>
                                <div className="grid grid-cols-2 gap-1 rounded-md border p-3 bg-background max-h-[180px] overflow-y-auto">
                                  {BODY_PARTS.map(bp => (
                                    <label key={bp} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                                      <input
                                        type="checkbox"
                                        checked={selected.includes(bp)}
                                        onChange={() => togglePart(bp)}
                                        className="rounded border-gray-300 h-4 w-4 accent-red-600"
                                      />
                                      {bp}
                                    </label>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )
                          }} />

                          <FormField control={form.control} name="treatmentType" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Treatment Obtained</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select treatment type..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(TREATMENT_TYPES).map(([v, c]) => (
                                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="lostDays" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Work Days Lost</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} placeholder="0" {...field} value={field.value ?? ""} className="h-10" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Consequence & Impact */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Consequence & Impact</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="estimatedCost" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost (R)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="spillVolume" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spill Volume (m&sup3;)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Impact Areas</Label>
                      <div className="flex flex-wrap gap-3 rounded-md border p-3 bg-background">
                        {["Health", "Safety", "Environment", "Production"].map(area => (
                          <label key={area} className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-muted/50">
                            <input
                              type="checkbox"
                              checked={selectedImpactAreas.includes(area)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedImpactAreas([...selectedImpactAreas, area])
                                else setSelectedImpactAreas(selectedImpactAreas.filter(a => a !== area))
                              }}
                              className="rounded border-gray-300 h-4 w-4"
                            />
                            {area}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contributing Factors */}
                  <div className="space-y-3 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">
                      Contributing Factors
                      {selectedFactors.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">{selectedFactors.length} selected</Badge>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3 bg-background max-h-[200px] overflow-y-auto">
                      {CONTRIBUTING_FACTORS.map(factor => (
                        <label key={factor} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedFactors.includes(factor)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedFactors([...selectedFactors, factor])
                              else setSelectedFactors(selectedFactors.filter(f => f !== factor))
                            }}
                            className="rounded border-gray-300 h-4 w-4"
                          />
                          {factor}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Outcome of Injured Person — only for injury types */}
                  {isInjuryType && (
                    <div className="space-y-4 rounded-lg border p-4">
                      <Label className="text-sm font-semibold">Outcome of Injured Person</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="returnedToWork" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Returned to Work?</FormLabel>
                            <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value === true ? "true" : field.value === false ? "false" : ""}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes — returned to work</SelectItem>
                                <SelectItem value="false">No — not yet returned</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        {form.watch("returnedToWork") === true && (
                          <FormField control={form.control} name="returnedToWorkDate" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Returned</FormLabel>
                              <FormControl>
                                <DatePicker value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                        {form.watch("returnedToWork") === false && (
                          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>Inform Safety & Health Officer immediately</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ STEP 4: Investigation ═══════════ */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Investigation & Reporting</h3>
                  </div>

                  {/* Immediate Action */}
                  <FormField
                    control={form.control}
                    name="immediateAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Immediate Action Taken</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What was done immediately after the incident to secure the scene and assist those affected?" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Root Cause Analysis */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Root Cause Analysis</Label>
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
                      <FormField
                        control={form.control}
                        name="rootCause"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea placeholder="Describe the root cause of the incident..." rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Category (Ishikawa)</Label>
                          <Select value={rcCategory} onValueChange={(val) => setRcCategory(val as RootCauseCategory)}>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select root cause category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOT_CAUSE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
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
                                placeholder={`Why did ${index === 0 ? "this incident occur" : "that happen"}?`}
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

                        <div>
                          <Label className="text-sm font-medium mb-1.5 block">Root Cause (final determination)</Label>
                          <Textarea
                            value={fiveWhysRootCause}
                            onChange={(e) => setFiveWhysRootCause(e.target.value)}
                            placeholder="The ultimate root cause determined from the analysis..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground mb-1.5 block">Containment Action (optional)</Label>
                          <Textarea
                            value={containmentAction}
                            onChange={(e) => setContainmentAction(e.target.value)}
                            placeholder="Immediate containment action taken..."
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="investigationDue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investigation Due Date</FormLabel>
                          <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="investigatorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned Investigator</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select investigator..." />
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
                      )}
                    />
                  </div>

                  {/* Regulatory Reporting */}
                  <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-sm font-semibold">Regulatory Reporting</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="isReportable" render={({ field }) => (
                        <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                          <FormControl>
                            <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded border-gray-300 h-5 w-5" />
                          </FormControl>
                          <div>
                            <FormLabel className="!mt-0 font-medium">Reportable to Regulator</FormLabel>
                            <p className="text-xs text-muted-foreground">This incident must be reported to the relevant authority</p>
                          </div>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="mhsaSection" render={({ field }) => (
                        <FormItem>
                          <FormLabel>MHSA Section</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Not applicable" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(MHSA_SECTIONS).map(([v, c]) => (
                                <SelectItem key={v} value={v}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
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
              <Button type="submit" form="incident-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Incident" : "Submit Report"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

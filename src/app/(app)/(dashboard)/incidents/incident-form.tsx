"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
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
import { INCIDENT_TYPES, RISK_LEVELS, TREATMENT_TYPES, CONTRIBUTING_FACTORS, MHSA_SECTIONS, BODY_PARTS, NATURE_OF_INJURIES } from "@/lib/constants"
import { BodyMap } from "@/components/shared/body-map"
import { createIncident, updateIncident, type IncidentFormValues } from "./actions"
import type { RootCauseData, RootCauseWhy } from "@/types"

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
  bodyPartInjured: z.string().max(200).optional(),
  natureOfInjury: z.string().max(200).optional(),
  treatmentType: z.enum(["NONE", "FIRST_AID", "MEDICAL", "HOSPITALIZED"]).optional(),
  contributingFactors: z.array(z.string()).optional(),
  isReportable: z.boolean().default(false),
  mhsaSection: z.enum(["11", "23", "24"]).optional(),
  investigationDue: z.coerce.date().optional(),
  projectId: z.string().optional(),
  investigatorId: z.string().optional(),
})

const ROOT_CAUSE_CATEGORIES = [
  { value: "human", label: "Human" },
  { value: "machine", label: "Machine" },
  { value: "material", label: "Material" },
  { value: "method", label: "Method" },
  { value: "environment", label: "Environment" },
  { value: "measurement", label: "Measurement" },
] as const

type RootCauseCategory = typeof ROOT_CAUSE_CATEGORIES[number]["value"]

function createEmptyWhy(index: number): RootCauseWhy {
  return { question: `Why ${index + 1}?`, answer: "" }
}

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
    contributingFactors: unknown // Json
    isReportable: boolean
    mhsaSection: string | null
    investigationDue: Date | null
    projectId: string | null
    investigatorId: string | null
  }
  projects: { id: string; name: string }[]
  members: { id: string; name: string }[]
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

export function IncidentForm({ open, onOpenChange, incident, projects, members }: IncidentFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!incident

  const existingData = parseExistingRootCauseData(incident)

  const [rcMethod, setRcMethod] = useState<"simple" | "5-whys">(
    existingData?.method ?? "simple"
  )
  const [rcCategory, setRcCategory] = useState<RootCauseCategory | "">(
    existingData?.category ?? ""
  )
  const [whys, setWhys] = useState<RootCauseWhy[]>(
    existingData?.method === "5-whys" && existingData.whys.length > 0
      ? existingData.whys
      : [createEmptyWhy(0)]
  )
  const [fiveWhysRootCause, setFiveWhysRootCause] = useState(
    existingData?.method === "5-whys" ? existingData.rootCause : ""
  )
  const [containmentAction, setContainmentAction] = useState(
    existingData?.containmentAction ?? ""
  )
  const [selectedFactors, setSelectedFactors] = useState<string[]>(
    (incident?.contributingFactors as string[]) ?? []
  )

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
    },
  })

  useEffect(() => {
    if (incident) {
      form.reset({
        title: incident.title,
        description: incident.description ?? "",
        incidentType: (incident.incidentType as IncidentFormValues["incidentType"]),
        severity: (incident.severity as IncidentFormValues["severity"]),
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
      })
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
      })
      setRcMethod("simple")
      setRcCategory("")
      setWhys([createEmptyWhy(0)])
      setFiveWhysRootCause("")
      setContainmentAction("")
      setSelectedFactors([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident])

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      let submitValues = {
        ...values,
        contributingFactors: selectedFactors.length > 0 ? selectedFactors : undefined,
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
        submitValues = {
          ...submitValues,
          rootCauseData,
        }
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
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Incident" : "Report Incident"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Brief description of the incident" {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="Detailed account of what happened..." rows={3} {...field} /></FormControl>
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(RISK_LEVELS).map(([v, c]) => (
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
                name="incidentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Incident</FormLabel>
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
                    <FormControl><Input type="time" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="Where did it happen?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="injuredParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Injured Party</FormLabel>
                    <FormControl><Input placeholder="Name(s) of injured person(s)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Injury Details Section */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Injury Details</Label>
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
                {/* Body Map — visual selector */}
                <FormField control={form.control} name="bodyPartInjured" render={({ field }) => (
                  <div className="flex justify-center">
                    <BodyMap
                      value={field.value || undefined}
                      onChange={field.onChange}
                      className="w-full max-w-[220px]"
                    />
                  </div>
                )} />

                {/* Right side — dropdowns and inputs */}
                <div className="grid grid-cols-1 gap-3">
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
                        <FormLabel className="text-xs">
                          Body Parts Injured
                          {selected.length > 0 && (
                            <span className="ml-1 text-red-600">({selected.length} selected)</span>
                          )}
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-1 rounded-md border p-2 bg-background max-h-[160px] overflow-y-auto">
                          {BODY_PARTS.map(bp => (
                            <label key={bp} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                              <input
                                type="checkbox"
                                checked={selected.includes(bp)}
                                onChange={() => togglePart(bp)}
                                className="rounded border-gray-300 h-3 w-3"
                              />
                              {bp}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }} />
                  <FormField control={form.control} name="natureOfInjury" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nature of Injury</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {NATURE_OF_INJURIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="treatmentType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Treatment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.entries(TREATMENT_TYPES).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lostDays" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Lost Days</FormLabel>
                      <FormControl><Input type="number" min={0} placeholder="0" {...field} value={field.value ?? ""} className="h-8 text-xs" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Contributing Factors</Label>
              <div className="grid grid-cols-2 gap-1.5 rounded-md border p-3 bg-muted/30 max-h-[200px] overflow-y-auto">
                {CONTRIBUTING_FACTORS.map(factor => (
                  <label key={factor} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFactors.includes(factor)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFactors([...selectedFactors, factor])
                        else setSelectedFactors(selectedFactors.filter(f => f !== factor))
                      }}
                      className="rounded border-gray-300 h-3.5 w-3.5"
                    />
                    {factor}
                  </label>
                ))}
              </div>
            </div>

            {/* Regulatory Reporting */}
            <div className="space-y-3 rounded-md border p-3 bg-muted/30">
              <Label className="text-sm font-medium">Regulatory Reporting</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField control={form.control} name="isReportable" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded border-gray-300 h-4 w-4" />
                    </FormControl>
                    <FormLabel className="text-xs !mt-0">Reportable to Regulator</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="mhsaSection" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">MHSA Section</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Not applicable" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(MHSA_SECTIONS).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <FormField
              control={form.control}
              name="witnesses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Witnesses</FormLabel>
                  <FormControl><Textarea placeholder="Names and contact details of witnesses..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="immediateAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immediate Action Taken</FormLabel>
                  <FormControl><Textarea placeholder="What was done immediately after the incident?" rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Root Cause Analysis Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Root Cause Analysis</Label>
                <div className="flex rounded-md border">
                  <button
                    type="button"
                    onClick={() => setRcMethod("simple")}
                    className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                      rcMethod === "simple"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setRcMethod("5-whys")}
                    className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors ${
                      rcMethod === "5-whys"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    5-Whys
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
                        <Textarea placeholder="Root cause analysis..." rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-3 rounded-md border p-3 bg-muted/30">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select
                      value={rcCategory}
                      onValueChange={(val) => setRcCategory(val as RootCauseCategory)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOT_CAUSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {whys.map((w, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Why {index + 1}?</Label>
                          {whys.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWhy(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <Textarea
                          value={w.answer}
                          onChange={(e) => updateWhyAnswer(index, e.target.value)}
                          placeholder={`Why did ${index === 0 ? "this incident occur" : "that happen"}?`}
                          rows={1}
                          className="text-sm resize-none min-h-[2.25rem]"
                        />
                      </div>
                    ))}
                    {whys.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWhy}
                        className="w-full h-7 text-xs"
                        disabled={!whys[whys.length - 1]?.answer.trim()}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Why {whys.length + 1}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Root Cause (final determination)</Label>
                    <Textarea
                      value={fiveWhysRootCause}
                      onChange={(e) => setFiveWhysRootCause(e.target.value)}
                      placeholder="The ultimate root cause determined from the analysis..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Containment Action (optional)</Label>
                    <Textarea
                      value={containmentAction}
                      onChange={(e) => setContainmentAction(e.target.value)}
                      placeholder="Immediate containment action taken..."
                      rows={1}
                      className="text-sm resize-none min-h-[2.25rem]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="investigationDue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investigation Due</FormLabel>
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
                    <FormLabel>Investigator</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
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

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Report"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

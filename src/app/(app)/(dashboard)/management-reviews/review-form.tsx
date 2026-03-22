"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ChevronRight, ChevronLeft, Check,
  CalendarCheck, BookOpen, Users, ClipboardPen,
} from "lucide-react"
import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/shared/date-picker"
import { createReview, updateReview, type ReviewFormValues } from "./actions"

/* ─────────────── Schema ─────────────── */

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  reviewDate: z.coerce.date(),
  location: z.string().max(500).optional(),
  meetingMinutes: z.string().max(10000).optional(),
  nextReviewDate: z.coerce.date().optional(),
  facilitatorId: z.string().min(1, "Facilitator is required"),
  standardIds: z.array(z.string()).min(1, "Select at least one standard"),
  attendeeIds: z.array(z.string()).optional(),
})

/* ─────────────── Steps ─────────────── */

const STEPS = [
  { id: "details", title: "Review Details", description: "Date, location, facilitator", icon: CalendarCheck },
  { id: "standards", title: "Standards", description: "Scope of the review", icon: BookOpen },
  { id: "attendees", title: "Attendees", description: "Who is attending?", icon: Users },
  { id: "minutes", title: "Minutes", description: "Record of discussion", icon: ClipboardPen },
] as const

type StepId = typeof STEPS[number]["id"]

const STEP_FIELDS: Record<StepId, string[]> = {
  details: ["title", "reviewDate", "facilitatorId"],
  standards: ["standardIds"],
  attendees: [],
  minutes: [],
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

interface ReviewFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review?: {
    id: string
    title: string
    reviewDate: Date
    location: string | null
    meetingMinutes: string | null
    nextReviewDate: Date | null
    facilitatorId: string
    standardIds: string[]
    attendeeIds: string[]
  }
  members: { id: string; name: string }[]
  standards: { id: string; code: string; name: string }[]
}

/* ─────────────── Main Component ─────────────── */

export function ReviewForm({ open, onOpenChange, review, members, standards }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const isEditing = !!review

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: review?.title ?? "",
      reviewDate: review?.reviewDate ?? new Date(),
      location: review?.location ?? "",
      meetingMinutes: review?.meetingMinutes ?? "",
      nextReviewDate: review?.nextReviewDate ?? undefined,
      facilitatorId: review?.facilitatorId ?? "",
      standardIds: review?.standardIds ?? [],
      attendeeIds: review?.attendeeIds ?? [],
    },
  })

  useEffect(() => {
    if (review) {
      form.reset({
        title: review.title,
        reviewDate: review.reviewDate,
        location: review.location ?? "",
        meetingMinutes: review.meetingMinutes ?? "",
        nextReviewDate: review.nextReviewDate ?? undefined,
        facilitatorId: review.facilitatorId,
        standardIds: review.standardIds,
        attendeeIds: review.attendeeIds,
      })
    } else {
      form.reset({
        title: "", reviewDate: new Date(), location: "", meetingMinutes: "",
        nextReviewDate: undefined, facilitatorId: "", standardIds: [], attendeeIds: [],
      })
    }
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [review, form])

  useEffect(() => { if (!open) { setCurrentStep(0); setCompletedSteps(new Set()) } }, [open])

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
        ? await updateReview(review.id, values as ReviewFormValues)
        : await createReview(values as ReviewFormValues)
      if (result.success) {
        toast.success(isEditing ? "Review updated" : "Review scheduled")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  const selectedStandardIds = form.watch("standardIds") ?? []
  const selectedAttendeeIds = form.watch("attendeeIds") ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="px-6 pt-6 pb-4 border-b space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              {isEditing ? "Edit Management Review" : "Schedule Management Review"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the review details." : "Plan and schedule a management review meeting."}
            </DialogDescription>
          </DialogHeader>
          <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} completedSteps={completedSteps} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="review-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ═══════════ STEP 1: Review Details ═══════════ */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Review Details</h3>
                  </div>

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl><Input placeholder="e.g. Q1 2026 Management Review" {...field} className="h-10" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="reviewDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Date *</FormLabel>
                        <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nextReviewDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Review Date</FormLabel>
                        <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g. Boardroom A, or Virtual (Teams)" {...field} className="h-10" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="facilitatorId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facilitator *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select facilitator..." /></SelectTrigger></FormControl>
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
              )}

              {/* ═══════════ STEP 2: Standards ═══════════ */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Standards Under Review</h3>
                    {selectedStandardIds.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">{selectedStandardIds.length} selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Select all standards that will be covered in this management review.</p>

                  <FormField
                    control={form.control}
                    name="standardIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 gap-2 rounded-lg border p-4 bg-background">
                          {standards.map((s) => (
                            <FormField
                              key={s.id}
                              control={form.control}
                              name="standardIds"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md hover:bg-muted/50 px-2 py-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(s.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || []
                                        field.onChange(
                                          checked
                                            ? [...current, s.id]
                                            : current.filter((id: string) => id !== s.id)
                                        )
                                      }}
                                    />
                                  </FormControl>
                                  <div>
                                    <span className="text-sm font-medium">{s.code}</span>
                                    <span className="text-sm text-muted-foreground ml-2">— {s.name}</span>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ═══════════ STEP 3: Attendees ═══════════ */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Attendees</h3>
                    {selectedAttendeeIds.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">{selectedAttendeeIds.length} selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Select team members who will attend this review meeting.</p>

                  <FormField
                    control={form.control}
                    name="attendeeIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border p-4 bg-background">
                          {members.map((m) => (
                            <FormField
                              key={m.id}
                              control={form.control}
                              name="attendeeIds"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md hover:bg-muted/50 px-2 py-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(m.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || []
                                        field.onChange(
                                          checked
                                            ? [...current, m.id]
                                            : current.filter((id: string) => id !== m.id)
                                        )
                                      }}
                                    />
                                  </FormControl>
                                  <span className="text-sm">{m.name}</span>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ═══════════ STEP 4: Minutes ═══════════ */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardPen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Meeting Minutes</h3>
                  </div>

                  <FormField control={form.control} name="meetingMinutes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minutes of the Meeting</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Record of discussion points, decisions made, action items, and key outcomes..."
                          rows={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <Label className="text-sm font-semibold">Review Summary</Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Title:</span>
                        <span className="ml-2 font-medium">{form.watch("title") || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Standards:</span>
                        <span className="ml-2">{selectedStandardIds.length > 0 ? `${selectedStandardIds.length} standards` : "None"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attendees:</span>
                        <span className="ml-2">{selectedAttendeeIds.length > 0 ? `${selectedAttendeeIds.length} people` : "None"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="ml-2">{form.watch("location") || "—"}</span>
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
              <Button type="submit" form="review-form" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Review" : "Schedule Review"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

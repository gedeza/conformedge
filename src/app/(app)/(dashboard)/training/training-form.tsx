"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createTrainingRecord, updateTrainingRecord } from "./actions"
import { trainingSchema, TRAINING_CATEGORIES, type TrainingFormValues } from "./schema"

interface TrainingFormProps {
  members: Array<{ id: string; firstName: string; lastName: string }>
  sites: Array<{ id: string; name: string; code: string }>
  initialData?: Partial<TrainingFormValues> & { id?: string }
  onSuccess: () => void
}

export function TrainingForm({ members, sites, initialData, onSuccess }: TrainingFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEdit = !!initialData?.id

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      category: initialData?.category ?? "",
      description: initialData?.description ?? "",
      trainingDate: initialData?.trainingDate ?? new Date(),
      duration: initialData?.duration ?? "",
      location: initialData?.location ?? "",
      trainerName: initialData?.trainerName ?? "",
      trainerAccreditation: initialData?.trainerAccreditation ?? "",
      trainingProvider: initialData?.trainingProvider ?? "",
      providerAccreditationNo: initialData?.providerAccreditationNo ?? "",
      certificateNumber: initialData?.certificateNumber ?? "",
      issuedDate: initialData?.issuedDate ?? null,
      expiryDate: initialData?.expiryDate ?? null,
      assessmentResult: initialData?.assessmentResult ?? "",
      saqaUnitStandard: initialData?.saqaUnitStandard ?? "",
      nqfLevel: initialData?.nqfLevel ?? null,
      notes: initialData?.notes ?? "",
      traineeId: initialData?.traineeId ?? "",
      siteId: initialData?.siteId ?? "",
    },
  })

  function onSubmit(values: TrainingFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateTrainingRecord(initialData!.id!, values)
        : await createTrainingRecord(values)

      if (result.success) {
        toast.success(isEdit ? "Training record updated" : "Training record created")
        onSuccess()
      } else {
        toast.error(result.error)
      }
    })
  }

  // Auto-suggest expiry based on category
  const selectedCategory = form.watch("category")
  const suggestedExpiry = TRAINING_CATEGORIES.find((c) => c.value === selectedCategory)?.expiryYears

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Section 1: Training Details */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Training Title</FormLabel>
              <FormControl><Input {...field} placeholder="e.g., Working at Heights Level 2" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRAINING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="traineeId" render={({ field }) => (
            <FormItem>
              <FormLabel>Trainee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="trainingDate" render={({ field }) => (
            <FormItem>
              <FormLabel>Training Date</FormLabel>
              <FormControl>
                <Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g., 8 hours" /></FormControl>
            </FormItem>
          )} />

          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} placeholder="Training venue" /></FormControl>
            </FormItem>
          )} />

          {sites.length > 0 && (
            <FormField control={form.control} name="siteId" render={({ field }) => (
              <FormItem>
                <FormLabel>Site</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No site</SelectItem>
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          )}
        </div>

        {/* Section 2: Trainer / Provider */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">Trainer & Provider</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="trainerName" render={({ field }) => (
              <FormItem>
                <FormLabel>Trainer Name</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="trainingProvider" render={({ field }) => (
              <FormItem>
                <FormLabel>Training Provider</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="trainerAccreditation" render={({ field }) => (
              <FormItem>
                <FormLabel>Trainer Accreditation</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="providerAccreditationNo" render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Accreditation No.</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* Section 3: Certificate */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">
            Certificate & Assessment
            {suggestedExpiry && (
              <span className="text-xs text-muted-foreground font-normal ml-2">
                (Statutory validity: {suggestedExpiry} years)
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="certificateNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate Number</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="assessmentResult" render={({ field }) => (
              <FormItem>
                <FormLabel>Assessment Result</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Not assessed</SelectItem>
                    <SelectItem value="Competent">Competent</SelectItem>
                    <SelectItem value="Not Yet Competent">Not Yet Competent</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="issuedDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Issued Date</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="saqaUnitStandard" render={({ field }) => (
              <FormItem>
                <FormLabel>SAQA Unit Standard</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g., US 229998" /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="nqfLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>NQF Level</FormLabel>
                <FormControl><Input type="number" min={1} max={10} {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea {...field} value={field.value ?? ""} rows={2} /></FormControl>
          </FormItem>
        )} />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : isEdit ? "Update Training Record" : "Create Training Record"}
        </Button>
      </form>
    </Form>
  )
}

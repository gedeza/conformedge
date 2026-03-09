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
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/shared/date-picker"
import { createReview, updateReview, type ReviewFormValues } from "./actions"

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

export function ReviewForm({ open, onOpenChange, review, members, standards }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition()
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = isEditing
        ? await updateReview(review.id, values as ReviewFormValues)
        : await createReview(values as ReviewFormValues)

      if (result.success) {
        toast.success(isEditing ? "Review updated" : "Review created")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Review" : "Schedule Review"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Q1 2026 Management Review" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextReviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Review Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input placeholder="e.g. Boardroom A" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facilitatorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilitator</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select facilitator" /></SelectTrigger></FormControl>
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

            {/* Standards multi-select via checkboxes */}
            <FormField
              control={form.control}
              name="standardIds"
              render={() => (
                <FormItem>
                  <FormLabel>Standards Under Review</FormLabel>
                  <div className="grid grid-cols-1 gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                    {standards.map((s) => (
                      <FormField
                        key={s.id}
                        control={form.control}
                        name="standardIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
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
                            <span className="text-sm">{s.code} — {s.name}</span>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attendees multi-select via checkboxes */}
            <FormField
              control={form.control}
              name="attendeeIds"
              render={() => (
                <FormItem>
                  <FormLabel>Attendees</FormLabel>
                  <div className="grid grid-cols-1 gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                    {members.map((m) => (
                      <FormField
                        key={m.id}
                        control={form.control}
                        name="attendeeIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
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

            <FormField
              control={form.control}
              name="meetingMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Minutes</FormLabel>
                  <FormControl><Textarea placeholder="Record of discussion..." rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update" : "Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

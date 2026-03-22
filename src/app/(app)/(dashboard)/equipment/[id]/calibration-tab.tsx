"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DatePicker } from "@/components/shared/date-picker"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { canCreate, canDelete } from "@/lib/permissions"
import { addCalibrationRecord, deleteCalibrationRecord, type CalibrationFormValues } from "../actions"

const formSchema = z.object({
  calibrationDate: z.coerce.date(),
  nextDueDate: z.coerce.date(),
  certificateNumber: z.string().max(200).optional(),
  calibratedBy: z.string().min(1, "Required").max(200),
  result: z.enum(["PASS", "FAIL", "CONDITIONAL"]),
  deviation: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
})

interface CalibrationRecord {
  id: string
  calibrationDate: Date
  nextDueDate: Date
  certificateNumber: string | null
  calibratedBy: string
  result: string
  deviation: string | null
  notes: string | null
  createdAt: Date
  recordedBy: { id: string; firstName: string; lastName: string }
}

interface Props {
  equipmentId: string
  records: CalibrationRecord[]
  role: string
}

export function CalibrationTab({ equipmentId, records, role }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      calibrationDate: new Date(),
      result: "PASS",
      calibratedBy: "",
      certificateNumber: "",
      deviation: "",
      notes: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await addCalibrationRecord(equipmentId, values as CalibrationFormValues)
      if (result.success) {
        toast.success("Calibration record added")
        setShowForm(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteCalibrationRecord(deleteTarget)
    setDeleting(false)
    if (result.success) {
      toast.success("Record deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Calibration Records</CardTitle>
        {canCreate(role) && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No calibration records yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-start justify-between border rounded-lg p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="calibration" value={record.result} />
                    <span className="text-sm font-medium">
                      {format(new Date(record.calibrationDate), "MMM d, yyyy")}
                    </span>
                    {record.certificateNumber && (
                      <span className="text-xs text-muted-foreground font-mono">#{record.certificateNumber}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By: {record.calibratedBy} — Next due: {format(new Date(record.nextDueDate), "MMM d, yyyy")}
                  </p>
                  {record.deviation && (
                    <p className="text-xs text-muted-foreground">Deviation: {record.deviation}</p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-muted-foreground">{record.notes}</p>
                  )}
                </div>
                {canDelete(role) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(record.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calibration Record</DialogTitle>
            <DialogDescription>Record a calibration event for this equipment.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="calibrationDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calibration Date *</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nextDueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Due Date *</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="calibratedBy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Calibrated By *</FormLabel>
                  <FormControl><Input placeholder="Lab or person name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="result" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="PASS">Pass</SelectItem>
                        <SelectItem value="FAIL">Fail</SelectItem>
                        <SelectItem value="CONDITIONAL">Conditional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="certificateNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate No.</FormLabel>
                    <FormControl><Input placeholder="Certificate number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="deviation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Deviation</FormLabel>
                  <FormControl><Input placeholder="Measured deviation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Add Record"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Calibration Record"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Card>
  )
}

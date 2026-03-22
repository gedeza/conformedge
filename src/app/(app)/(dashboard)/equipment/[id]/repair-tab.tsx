"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Plus, Trash2, ArrowUpRight } from "lucide-react"
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
import { canCreate, canEdit, canDelete } from "@/lib/permissions"
import { addRepairRecord, deleteRepairRecord, escalateRepairToCapa, type RepairFormValues } from "../actions"

const formSchema = z.object({
  repairDate: z.coerce.date(),
  description: z.string().min(1, "Description is required").max(5000),
  supplierName: z.string().min(1, "Supplier is required").max(200),
  supplierReference: z.string().max(200).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).default("MEDIUM"),
  cost: z.coerce.number().min(0).optional(),
  verifiedBy: z.string().max(200).optional(),
  verificationNotes: z.string().max(5000).optional(),
  returnToServiceDate: z.coerce.date().optional(),
})

interface RepairRecord {
  id: string
  repairDate: Date
  description: string
  supplierName: string
  supplierReference: string | null
  priority: string
  cost: unknown
  verifiedBy: string | null
  verificationNotes: string | null
  returnToServiceDate: Date | null
  createdAt: Date
  recordedBy: { id: string; firstName: string; lastName: string }
  capa: { id: string; title: string; status: string } | null
}

interface Props {
  equipmentId: string
  records: RepairRecord[]
  role: string
}

export function RepairTab({ equipmentId, records, role }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      repairDate: new Date(),
      description: "",
      supplierName: "",
      supplierReference: "",
      priority: "MEDIUM",
      verifiedBy: "",
      verificationNotes: "",
    },
  })

  function handleSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await addRepairRecord(equipmentId, values as RepairFormValues)
      if (result.success) {
        toast.success("Repair record added")
        setShowForm(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleEscalate(repairId: string) {
    startTransition(async () => {
      const result = await escalateRepairToCapa(repairId)
      if (result.success) {
        toast.success("Escalated to CAPA")
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteRepairRecord(deleteTarget)
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
        <CardTitle className="text-base">Repair History</CardTitle>
        {canCreate(role) && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Repair
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No repair records yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-start justify-between border rounded-lg p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="repairPriority" value={record.priority} />
                    <span className="text-sm font-medium">
                      {format(new Date(record.repairDate), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">{record.supplierName}</span>
                  </div>
                  <p className="text-sm">{record.description}</p>
                  {record.supplierReference && (
                    <p className="text-xs text-muted-foreground">Ref: {record.supplierReference}</p>
                  )}
                  {record.cost != null && Number(record.cost) > 0 && (
                    <p className="text-xs text-muted-foreground">Cost: R{Number(record.cost).toLocaleString()}</p>
                  )}
                  {record.verifiedBy && (
                    <p className="text-xs text-muted-foreground">
                      Verified by: {record.verifiedBy}
                      {record.returnToServiceDate && ` — Returned: ${format(new Date(record.returnToServiceDate), "MMM d, yyyy")}`}
                    </p>
                  )}
                  {record.capa && (
                    <p className="text-xs">
                      Linked CAPA: <a href={`/capas`} className="text-primary hover:underline">{record.capa.title}</a>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!record.capa && canEdit(role) && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleEscalate(record.id)} disabled={isPending} title="Escalate to CAPA">
                      <ArrowUpRight className="mr-1 h-3 w-3" /> CAPA
                    </Button>
                  )}
                  {canDelete(role) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(record.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Repair Record</DialogTitle>
            <DialogDescription>Log a repair or service event for this equipment.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="repairDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repair Date *</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="What was repaired..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="supplierName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier / Repairer *</FormLabel>
                    <FormControl><Input placeholder="Company name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supplierReference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference / Job No.</FormLabel>
                    <FormControl><Input placeholder="Invoice or job number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="cost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (R)</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="verifiedBy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verified By</FormLabel>
                    <FormControl><Input placeholder="Verifier name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="returnToServiceDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return to Service</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="verificationNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Notes</FormLabel>
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
        title="Delete Repair Record"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Card>
  )
}

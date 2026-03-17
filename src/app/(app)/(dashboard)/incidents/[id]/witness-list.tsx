"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, UserCircle, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { canEdit, canDelete } from "@/lib/permissions"
import { addWitness, removeWitness, type WitnessFormValues } from "../actions"

interface WitnessItem {
  id: string
  name: string
  contactNumber: string | null
  email: string | null
  statement: string | null
  createdAt: Date
}

interface WitnessListProps {
  incidentId: string
  witnesses: WitnessItem[]
  legacyWitnesses: string | null
  role: string
}

export function WitnessList({ incidentId, witnesses, legacyWitnesses, role }: WitnessListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<WitnessFormValues>({
    name: "",
    contactNumber: "",
    email: "",
    statement: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    startTransition(async () => {
      const result = await addWitness(incidentId, formData)
      if (result.success) {
        toast.success("Witness added")
        setFormData({ name: "", contactNumber: "", email: "", statement: "" })
        setShowForm(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await removeWitness(deleteId)
      if (result.success) {
        toast.success("Witness removed")
        setDeleteId(null)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card className="border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Witness Statements</CardTitle>
        {canEdit(role) && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Witness
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Legacy free-text witnesses */}
        {legacyWitnesses && witnesses.length === 0 && (
          <div className="rounded-md border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Legacy witness notes</p>
            <p className="text-sm whitespace-pre-wrap">{legacyWitnesses}</p>
          </div>
        )}

        {/* Structured witness records */}
        {witnesses.map((w) => (
          <div key={w.id} className="rounded-md border p-3 space-y-2 relative group">
            {canDelete(role) && (
              <button
                onClick={() => setDeleteId(w.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{w.name}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {w.contactNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />{w.contactNumber}
                </span>
              )}
              {w.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />{w.email}
                </span>
              )}
            </div>
            {w.statement && (
              <div className="mt-1 rounded bg-muted/30 p-2">
                <p className="text-xs text-muted-foreground mb-0.5">Statement</p>
                <p className="text-sm whitespace-pre-wrap">{w.statement}</p>
              </div>
            )}
          </div>
        ))}

        {witnesses.length === 0 && !legacyWitnesses && !showForm && (
          <p className="text-sm text-muted-foreground">No witnesses recorded.</p>
        )}

        {/* Add witness form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-md border p-3 space-y-3 bg-muted/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Witness full name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Contact Number</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Phone number"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Statement</Label>
              <Textarea
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                placeholder="Witness account of the incident..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isPending || !formData.name.trim()}>
                {isPending ? "Saving..." : "Add Witness"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Witness"
        description="Remove this witness record from the incident?"
        confirmLabel="Remove"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </Card>
  )
}

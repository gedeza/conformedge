"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CertificationForm } from "../certification-form"
import { deleteCertification } from "../actions"

interface CertificationActionsProps {
  subcontractorId: string
  certification?: {
    id: string
    name: string
    issuedBy: string | null
    issuedDate: Date | null
    expiresAt: Date | null
  }
  mode?: "add" | "edit"
}

export function CertificationActions({ subcontractorId, certification, mode = "add" }: CertificationActionsProps) {
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!certification) return
    setDeleting(true)
    const result = await deleteCertification(certification.id, subcontractorId)
    setDeleting(false)
    if (result.success) {
      toast.success("Certification deleted")
      setShowDelete(false)
    } else {
      toast.error(result.error)
    }
  }

  if (mode === "add") {
    return (
      <>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
        <CertificationForm
          open={showForm}
          onOpenChange={setShowForm}
          subcontractorId={subcontractorId}
        />
      </>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowDelete(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
      <CertificationForm
        open={showForm}
        onOpenChange={setShowForm}
        subcontractorId={subcontractorId}
        certification={certification}
      />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Certification"
        description={`Delete "${certification?.name}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

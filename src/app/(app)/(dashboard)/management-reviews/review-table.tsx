"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { MANAGEMENT_REVIEW_STATUSES } from "@/lib/constants"
import { getColumns, type ReviewRow } from "./columns"
import { ReviewForm } from "./review-form"
import { deleteReview } from "./actions"

interface ReviewTableProps {
  data: ReviewRow[]
  members: { id: string; name: string }[]
  standards: { id: string; code: string; name: string }[]
  role: string
}

export function ReviewTable({ data, members, standards, role }: ReviewTableProps) {
  const [editItem, setEditItem] = useState<ReviewRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const columns = getColumns({
    onEdit: (r) => setEditItem(r),
    onDelete: (r) => setDeleteTarget(r),
    role,
  })

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteReview(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      toast.success("Review deleted")
      setDeleteTarget(null)
    } else {
      toast.error(result.error)
    }
  }

  const filterOptions = Object.entries(MANAGEMENT_REVIEW_STATUSES).map(([value, config]) => ({
    label: config.label,
    value,
  }))

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search reviews..."
        filterKey="status"
        filterOptions={filterOptions}
        filterPlaceholder="All statuses"
      />
      <ReviewForm
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        review={editItem ? {
          id: editItem.id,
          title: editItem.title,
          reviewDate: editItem.reviewDate,
          location: editItem.location,
          nextReviewDate: editItem.nextReviewDate,
          facilitatorId: editItem.facilitator.id,
          standardIds: editItem.standards.map((s) => s.standard.id),
          meetingMinutes: editItem.meetingMinutes,
          attendeeIds: editItem.attendees.map((a) => a.userId),
        } : undefined}
        members={members}
        standards={standards}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Review"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  CheckCircle2,
  XCircle,
  Clock,
  SkipForward,
  Ban,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { ReviewActionDialog } from "./review-action-dialog"
import { SubmitForApprovalDialog } from "./submit-for-approval-dialog"
import { cancelApprovalRequest, skipApprovalStep } from "../approval-actions"
import { canManageOrg } from "@/lib/permissions"

interface ApprovalStep {
  id: string
  stepOrder: number
  label: string
  requiredRole: string
  status: string
  comment: string | null
  decidedAt: Date | null
  createdAt: Date
  assignedToId: string
  assignedTo: {
    id: string
    firstName: string
    lastName: string
    imageUrl: string | null
  }
}

interface ApprovalRequest {
  id: string
  status: string
  completedAt: Date | null
  createdAt: Date
  submittedBy: {
    id: string
    firstName: string
    lastName: string
    imageUrl: string | null
  }
  template: { id: string; name: string } | null
  steps: ApprovalStep[]
}

interface Template {
  id: string
  name: string
  steps: unknown
  isDefault: boolean
}

interface OrgMember {
  id: string
  name: string
  role: string
}

interface Props {
  documentId: string
  documentTitle: string
  documentStatus: string
  approvalHistory: ApprovalRequest[]
  currentUserId: string
  role: string
  templates: Template[]
  members: OrgMember[]
}

const STEP_ICON: Record<string, typeof CheckCircle2> = {
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  SKIPPED: SkipForward,
  PENDING: Clock,
}

const STEP_ICON_COLOR: Record<string, string> = {
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  SKIPPED: "text-gray-400",
  PENDING: "text-yellow-500",
}

export function ApprovalPanel({
  documentId,
  documentTitle,
  documentStatus,
  approvalHistory,
  currentUserId,
  role,
  templates,
  members,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [expandedPast, setExpandedPast] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState("")

  const activeRequest = approvalHistory.find((r) => r.status === "IN_PROGRESS")
  const pastRequests = approvalHistory.filter((r) => r.status !== "IN_PROGRESS")

  function handleCancel(requestId: string) {
    startTransition(async () => {
      const result = await cancelApprovalRequest(requestId)
      if (result.success) {
        toast.success("Approval request cancelled")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleSkip(stepId: string) {
    const reason = prompt("Reason for skipping this step:")
    if (!reason?.trim()) return

    startTransition(async () => {
      const result = await skipApprovalStep(stepId, reason.trim())
      if (result.success) {
        toast.success("Step skipped")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Submit for Approval trigger */}
      {!activeRequest && documentStatus === "DRAFT" && templates.length > 0 && (
        <div className="flex items-center justify-between rounded-md border border-dashed p-4">
          <div>
            <p className="text-sm font-medium">Ready for review?</p>
            <p className="text-xs text-muted-foreground">
              Submit this document for approval through your organization&apos;s workflow.
            </p>
          </div>
          <SubmitForApprovalDialog
            documentId={documentId}
            templates={templates}
            members={members}
          />
        </div>
      )}

      {!activeRequest && documentStatus === "DRAFT" && templates.length === 0 && (
        <div className="rounded-md border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            No approval workflow templates configured. An admin can create templates in Settings.
          </p>
        </div>
      )}

      {/* Active Approval Request */}
      {activeRequest && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Current Approval</h3>
              <StatusBadge type="approvalRequest" value={activeRequest.status} />
              {activeRequest.template && (
                <Badge variant="outline" className="text-xs">{activeRequest.template.name}</Badge>
              )}
            </div>
            {(activeRequest.submittedBy.id === currentUserId || canManageOrg(role)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(activeRequest.id)}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                <Ban className="mr-1 h-4 w-4" /> Cancel
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Submitted by {activeRequest.submittedBy.firstName} {activeRequest.submittedBy.lastName}
            {" on "}
            {format(new Date(activeRequest.createdAt), "MMM d, yyyy 'at' HH:mm")}
          </div>

          {/* Steps Timeline */}
          <div className="relative ml-3 border-l-2 border-muted pl-6 space-y-4">
            {activeRequest.steps.map((step) => {
              const Icon = STEP_ICON[step.status] ?? Clock
              const iconColor = STEP_ICON_COLOR[step.status] ?? ""
              const isCurrentStep = step.status === "PENDING" &&
                activeRequest.steps.find((s) => s.status === "PENDING")?.id === step.id
              const isAssignedToMe = step.assignedToId === currentUserId

              return (
                <div
                  key={step.id}
                  className={`relative ${isCurrentStep ? "bg-muted/50 -ml-6 pl-6 -mr-2 pr-2 py-2 rounded-md" : ""}`}
                >
                  <div className="absolute -left-[calc(1.5rem+9px)] top-0.5">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{step.label}</span>
                        <StatusBadge type="approvalStep" value={step.status} />
                        <Badge variant="outline" className="text-xs">
                          {step.requiredRole}+
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>
                        {step.assignedTo.firstName} {step.assignedTo.lastName}
                      </span>
                      {step.decidedAt && (
                        <span>
                          — {format(new Date(step.decidedAt), "MMM d, yyyy HH:mm")}
                        </span>
                      )}
                    </div>
                    {step.comment && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        &ldquo;{step.comment}&rdquo;
                      </p>
                    )}

                    {/* Action buttons for current step */}
                    {isCurrentStep && (
                      <div className="flex items-center gap-2 pt-2">
                        {isAssignedToMe && (
                          <ReviewActionDialog
                            stepId={step.id}
                            stepLabel={step.label}
                            documentTitle={documentTitle}
                          />
                        )}
                        {canManageOrg(role) && !isAssignedToMe && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSkip(step.id)}
                            disabled={isPending}
                          >
                            <SkipForward className="mr-1 h-4 w-4" /> Skip
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Approval Requests */}
      {pastRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Past Approvals</h3>
          {pastRequests.map((req) => (
            <div key={req.id} className="rounded-md border">
              <button
                className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/50"
                onClick={() => setExpandedPast(expandedPast === req.id ? null : req.id)}
              >
                <div className="flex items-center gap-2">
                  <StatusBadge type="approvalRequest" value={req.status} />
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                    {" by "}{req.submittedBy.firstName} {req.submittedBy.lastName}
                  </span>
                  {req.template && (
                    <Badge variant="outline" className="text-xs">{req.template.name}</Badge>
                  )}
                </div>
                {expandedPast === req.id
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {expandedPast === req.id && (
                <div className="px-3 pb-3 border-t">
                  <div className="relative ml-3 border-l-2 border-muted pl-6 space-y-3 pt-3">
                    {req.steps.map((step) => {
                      const Icon = STEP_ICON[step.status] ?? Clock
                      const iconColor = STEP_ICON_COLOR[step.status] ?? ""
                      return (
                        <div key={step.id} className="relative">
                          <div className="absolute -left-[calc(1.5rem+9px)] top-0.5">
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{step.label}</span>
                              <StatusBadge type="approvalStep" value={step.status} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.assignedTo.firstName} {step.assignedTo.lastName}
                              {step.decidedAt && (
                                <> — {format(new Date(step.decidedAt), "MMM d, yyyy HH:mm")}</>
                              )}
                            </div>
                            {step.comment && (
                              <p className="text-xs text-muted-foreground italic">
                                &ldquo;{step.comment}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approvalHistory.length === 0 && !activeRequest && documentStatus !== "DRAFT" && (
        <p className="text-sm text-muted-foreground">No approval history for this document.</p>
      )}
    </div>
  )
}

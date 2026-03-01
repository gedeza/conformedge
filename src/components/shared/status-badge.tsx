import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PROJECT_STATUSES,
  DOCUMENT_STATUSES,
  CAPA_STATUSES,
  CHECKLIST_STATUSES,
  SUBCONTRACTOR_TIERS,
  AUDIT_PACK_STATUSES,
  RISK_LEVELS,
  CAPA_PRIORITIES,
  APPROVAL_STEP_STATUSES,
  APPROVAL_REQUEST_STATUSES,
  SHARE_LINK_STATUSES,
  SHARE_LINK_TYPES,
  CERTIFICATION_STATUSES,
} from "@/lib/constants"

type StatusMap = Record<string, { label: string; color: string }>

const STATUS_MAPS: Record<string, StatusMap> = {
  project: PROJECT_STATUSES,
  document: DOCUMENT_STATUSES,
  capa: CAPA_STATUSES,
  checklist: CHECKLIST_STATUSES,
  subcontractor: SUBCONTRACTOR_TIERS,
  auditPack: AUDIT_PACK_STATUSES,
  risk: RISK_LEVELS,
  priority: CAPA_PRIORITIES,
  approvalStep: APPROVAL_STEP_STATUSES,
  approvalRequest: APPROVAL_REQUEST_STATUSES,
  shareLink: SHARE_LINK_STATUSES,
  shareLinkType: SHARE_LINK_TYPES,
  certificationStatus: CERTIFICATION_STATUSES,
}

interface StatusBadgeProps {
  type: keyof typeof STATUS_MAPS
  value: string
  className?: string
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const map = STATUS_MAPS[type]
  const config = map?.[value]

  if (!config) {
    return <Badge variant="outline" className={className}>{value}</Badge>
  }

  return (
    <Badge variant="outline" className={cn(config.color, className)}>
      {config.label}
    </Badge>
  )
}

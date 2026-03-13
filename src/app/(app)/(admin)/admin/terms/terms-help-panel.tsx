"use client"

import { FileText, AlertTriangle, Eye, Upload } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function TermsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={FileText}
      summary="Manage Terms & Conditions versions. Publishing a new version forces ALL users to accept the updated terms on their next login — this cannot be undone."
      expandLabel="Show critical warnings"
      items={[
        {
          icon: Upload,
          label: "Publishing",
          description: "Publishing activates the version and supersedes all previous versions.",
        },
        {
          icon: AlertTriangle,
          label: "User Impact",
          description: "All users must accept new terms — they cannot use the platform until they do.",
        },
        {
          icon: Eye,
          label: "Acceptance Stats",
          description: "Track how many users have accepted each version.",
        },
        {
          icon: FileText,
          label: "Version History",
          description: "All versions are retained for legal compliance and audit trails.",
        },
      ]}
      tips={[
        "NEVER publish terms without legal review — published terms are legally binding.",
        "Publishing is irreversible — the old version is superseded and cannot be restored as active.",
        "Have someone else review the content before publishing — typos in legal text look unprofessional.",
        "Set the effective date carefully — a past date can create compliance confusion.",
        "Draft versions are safe to edit — they have no impact on users until published.",
        "Check acceptance stats after publishing to ensure users are re-accepting promptly.",
      ]}
    />
  )
}

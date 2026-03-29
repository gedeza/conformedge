"use client"

import { FileCheck2, Shield, Bell, Building2, Scale } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ObligationsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={FileCheck2}
      summary="Track compliance obligations including Section 37(2) agreements, licences, permits, and certificates with automated expiry monitoring and vendor email alerts."
      items={[
        { icon: Scale, label: "Obligation Types", description: "Section 37(2), Water Use Licences, AELs, Waste Licences, COIDA, Tax Clearance, CIDB, B-BBEE, Competent Person appointments" },
        { icon: Bell, label: "Expiry Alerts", description: "Daily cron checks expiry dates and notifies responsible users. Sends email alerts to linked vendors" },
        { icon: Building2, label: "Site Scoping", description: "Obligations can be linked to specific sites, projects, or vendors for targeted tracking" },
        { icon: Shield, label: "Review Workflow", description: "Track last review date and reviewer for audit trail compliance" },
      ]}
      expandLabel="Regulatory references"
      tips={[
        "Section 37(2): OHS Act — mandatory agreement between client and contractor for OHS liability transfer",
        "Water Use Licence: NWA Section 21 — required for any water abstraction, storage, or discharge",
        "AEL: NEM:AQA Section 22 — required for listed atmospheric emission activities",
        "Waste Licence: NEM:WA Section 20 — required for waste management activities",
        "COIDA: Letter of Good Standing from Compensation Fund — required for all employers",
        "CIDB Grading: Required for all construction works contracts",
        "Renewal lead days default to 30 — you'll be notified before expiry",
        "Available on Enterprise plan",
      ]}
    />
  )
}

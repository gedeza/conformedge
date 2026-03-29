"use client"

import { Building2, BarChart3, AlertTriangle, FileDown, Shield } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function CorporateHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Building2}
      summary="Cross-site compliance and safety overview for enterprise organisations with multiple divisions, sites, or depots. Compare LTIFR, incidents, obligations, and checklist compliance across your entire operation."
      items={[
        { icon: BarChart3, label: "KPI Cards", description: "Total incidents, cross-site LTIFR, obligation status, and overall compliance at a glance" },
        { icon: Shield, label: "Site Comparison", description: "Sortable table comparing all sites on incidents, LTI, CAPAs, permits, equipment, and compliance %" },
        { icon: AlertTriangle, label: "Alerts", description: "Automatic alerts for sites with high LTIFR, overdue CAPAs, or expiring obligations" },
        { icon: FileDown, label: "CSV Export", description: "Export the full cross-site comparison as a CSV report" },
      ]}
      expandLabel="Tips"
      tips={[
        "Configure sites in Settings → Multi-Site Hierarchy",
        "Use the site selector in the sidebar to filter other pages by site",
        "LTIFR calculation requires 'Monthly Hours Worked' configured in Settings",
        "LTIFR threshold: < 0.5 = Good (green), 0.5-1.0 = Moderate (yellow), > 1.0 = High (red)",
        "CAPAs and checklists are site-scoped via their project assignment",
        "Available on Enterprise plan",
      ]}
    />
  )
}

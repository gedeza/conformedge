"use client"

import { BarChart3, Calendar, Download, TrendingUp } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function ReportsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={BarChart3}
      summary="Reports give you a bird's-eye view of your compliance posture. See summary metrics, trends over time, and breakdowns by status across all entities. Export reports as PDF or CSV for management reviews."
      items={[
        { icon: TrendingUp, label: "Metrics", description: "Compliance score, overdue CAPAs, expired documents at a glance" },
        { icon: Calendar, label: "Date Range", description: "Filter data by time period — last 30 days, quarter, year, or custom" },
        { icon: Download, label: "Export", description: "Download as PDF or CSV for board presentations and audits" },
      ]}
      expandLabel="Tips"
      tips={[
        "Use the <strong>date range filter</strong> to compare periods (e.g. Q1 vs Q2)",
        "Charts include: compliance by standard, CAPAs by status/priority, document status, and more",
        "The <strong>compliance trend</strong> chart shows your trajectory over 12 months",
        "Export reports <strong>before management reviews</strong> to have data-driven discussions",
      ]}
    />
  )
}

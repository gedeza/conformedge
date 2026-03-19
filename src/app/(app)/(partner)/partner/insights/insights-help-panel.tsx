"use client"

import { Shield, Activity, AlertTriangle, TrendingUp } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function InsightsHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Shield}
      summary="Monitor partner compliance health with automated scoring across user activity, client density, revenue trends, and feature utilization. Alerts flag anomalies like ghost seats, seat stuffing, and revenue decline."
      items={[
        { icon: Activity, label: "Health Score", description: "Weighted composite (0-100) across 5 dimensions: activity (30%), client density (20%), revenue (25%), feature utilization (15%), compliance (10%)" },
        { icon: AlertTriangle, label: "Alerts", description: "Automated behavioral alerts for ghost seats, low activity, high client density, revenue decline, and overdue invoices" },
        { icon: TrendingUp, label: "Trends", description: "Track score history over time to identify improving or declining partner performance" },
      ]}
      expandLabel="Scoring & thresholds"
      tips={[
        "Score 80-100 = LOW risk (healthy, no action needed)",
        "Score 60-79 = MEDIUM risk (monitor at next billing cycle)",
        "Score 40-59 = HIGH risk (investigate, direct outreach to partner)",
        "Score 0-39 = CRITICAL risk (escalate, potential suspension review)",
        "Ghost Seats alert: <20% of allocated seats logged in within 30 days",
        "Client Density alert: >8 users per client org (potential seat stuffing)",
        "Revenue Decline alert: MoM revenue dropped >15%",
        "Click Recalculate to refresh scores with latest data",
        "Resolve or dismiss alerts after investigation — dismissed alerts won't re-trigger",
      ]}
    />
  )
}

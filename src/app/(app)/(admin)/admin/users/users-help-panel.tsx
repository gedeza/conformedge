"use client"

import { Users, ShieldCheck, Search, AlertTriangle } from "lucide-react"
import { HelpPanel } from "@/components/shared/help-panel"

export function UsersHelpPanel() {
  return (
    <HelpPanel
      title="Guide"
      icon={Users}
      summary="View all platform users and manage super admin access. Super admin grants unrestricted access to this entire admin console — use extreme caution."
      expandLabel="Show critical warnings"
      items={[
        {
          icon: ShieldCheck,
          label: "Super Admin Toggle",
          description: "Grants or revokes full platform admin access for any user.",
        },
        {
          icon: Search,
          label: "User Search",
          description: "Search by name or email to find specific users across all orgs.",
        },
        {
          icon: Users,
          label: "User List",
          description: "Shows all registered users with their org, role, and admin status.",
        },
        {
          icon: AlertTriangle,
          label: "Access Control",
          description: "Super admins can see and modify ALL organizations and billing.",
        },
      ]}
      tips={[
        "Granting super admin gives FULL access to billing, subscriptions, user data, and org controls.",
        "Only grant super admin to ISU Technologies staff — never to customer users.",
        "Review the super admin list regularly and revoke access for anyone who no longer needs it.",
        "Revoking super admin takes effect on the user's next page load.",
        "There is no undo — but you can re-toggle the switch if done by mistake.",
      ]}
    />
  )
}

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrgSettings, getMembers, getStandardsList } from "./actions"
import { getNotificationPreferences, type NotificationPreferenceMap } from "./notification-actions"
import { getWorkflowTemplates, type WorkflowTemplate } from "./workflow-template-actions"
import { getShareLinks, type ShareLinkItem } from "./share-link-actions"
import { OrgSettingsForm } from "./org-settings-form"
import { MembersList } from "./members-list"
import { StandardsList } from "./standards-list"
import { NotificationPreferences } from "./notification-preferences"
import { WorkflowTemplates } from "./workflow-templates"
import { ShareLinks } from "./share-links"
import { canManageOrg } from "@/lib/permissions"
import { db } from "@/lib/db"

export default async function SettingsPage() {
  let org: Awaited<ReturnType<typeof getOrgSettings>> = null
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let standards: Awaited<ReturnType<typeof getStandardsList>> = []
  let notifPrefs: NotificationPreferenceMap | null = null
  let workflowTemplates: WorkflowTemplate[] = []
  let shareLinks: ShareLinkItem[] = []
  let shareDocs: { id: string; title: string }[] = []
  let shareAuditPacks: { id: string; title: string }[] = []
  let shareSubcontractors: { id: string; name: string }[] = []
  let role = "VIEWER"
  let authError = false

  try {
    ;[org, members, standards, notifPrefs, workflowTemplates, shareLinks] = await Promise.all([
      getOrgSettings(), getMembers(), getStandardsList(), getNotificationPreferences(), getWorkflowTemplates(), getShareLinks(),
    ])
    const { getAuthContext } = await import("@/lib/auth")
    const ctx = await getAuthContext()
    role = ctx.role
    // Fetch entity pickers for share link dialog
    ;[shareDocs, shareAuditPacks, shareSubcontractors] = await Promise.all([
      db.document.findMany({ where: { organizationId: ctx.dbOrgId }, select: { id: true, title: true }, orderBy: { title: "asc" }, take: 200 }),
      db.auditPack.findMany({ where: { organizationId: ctx.dbOrgId }, select: { id: true, title: true }, orderBy: { title: "asc" }, take: 200 }),
      db.subcontractor.findMany({ where: { organizationId: ctx.dbOrgId }, select: { id: true, name: true }, orderBy: { name: "asc" }, take: 200 }),
    ])
  } catch {
    authError = true
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Settings" description="Manage your organization settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Manage organization details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {authError || !org ? (
              <p className="text-sm text-muted-foreground">Select an organization to manage settings.</p>
            ) : (
              <OrgSettingsForm org={org} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage team roles</CardDescription>
          </CardHeader>
          <CardContent>
            {authError || members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members found.</p>
            ) : (
              <MembersList members={members} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ISO Standards</CardTitle>
            <CardDescription>Toggle which standards are active</CardDescription>
          </CardHeader>
          <CardContent>
            {standards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ISO standards available. Please contact support to set up your standards.</p>
            ) : (
              <StandardsList standards={standards} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification preferences per channel</CardDescription>
          </CardHeader>
          <CardContent>
            {authError || !notifPrefs ? (
              <p className="text-sm text-muted-foreground">Select an organization to manage notifications.</p>
            ) : (
              <NotificationPreferences initialPreferences={notifPrefs} />
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Approval Workflows</CardTitle>
            <CardDescription>Define approval chains for document sign-off</CardDescription>
          </CardHeader>
          <CardContent>
            {authError ? (
              <p className="text-sm text-muted-foreground">Select an organization to manage workflows.</p>
            ) : (
              <WorkflowTemplates templates={workflowTemplates} canManage={canManageOrg(role)} />
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>External Sharing</CardTitle>
            <CardDescription>Share documents, audit packs, or compliance portals with external stakeholders</CardDescription>
          </CardHeader>
          <CardContent>
            {authError ? (
              <p className="text-sm text-muted-foreground">Select an organization to manage share links.</p>
            ) : (
              <ShareLinks links={shareLinks} canManage={canManageOrg(role)} documents={shareDocs} auditPacks={shareAuditPacks} subcontractors={shareSubcontractors} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

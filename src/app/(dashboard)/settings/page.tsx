import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrgSettings, getMembers, getStandardsList } from "./actions"
import { OrgSettingsForm } from "./org-settings-form"
import { MembersList } from "./members-list"
import { StandardsList } from "./standards-list"

export default async function SettingsPage() {
  let org: Awaited<ReturnType<typeof getOrgSettings>> = null
  let members: Awaited<ReturnType<typeof getMembers>> = []
  let standards: Awaited<ReturnType<typeof getStandardsList>> = []
  let authError = false

  try {
    ;[org, members, standards] = await Promise.all([
      getOrgSettings(), getMembers(), getStandardsList(),
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
              <p className="text-sm text-muted-foreground">No standards found. Run database seed.</p>
            ) : (
              <StandardsList standards={standards} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Notification settings coming in Phase 2 with AI integration.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

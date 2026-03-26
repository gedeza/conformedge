import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Building2 } from "lucide-react"
import { getVendors } from "./actions"
import { VendorTable } from "./vendor-table"
import { VendorFormTrigger } from "./vendor-form-trigger"
import { VendorsHelpPanel } from "./vendors-help-panel"
import { getAuthContext } from "@/lib/auth"

export default async function VendorsPage() {
  let vendors: Awaited<ReturnType<typeof getVendors>>["vendors"] = []
  let role = "VIEWER"
  let authError = false

  try {
    const ctx = await getAuthContext()
    role = ctx.role
    const result = await getVendors()
    vendors = result.vendors
  } catch {
    authError = true
  }

  if (authError) {
    return (
      <div className="space-y-6">
        <PageHeader heading="Vendors" description="Monitor vendor compliance and certifications" />
        <EmptyState
          icon={Building2}
          title="Organization required"
          description="Please select or create an organization to manage vendors."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader heading="Vendors" description="Monitor vendor compliance and certifications">
        <VendorsHelpPanel />
        <VendorFormTrigger role={role} />
      </PageHeader>
      {vendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors yet"
          description="Add vendors to track their certifications and compliance status."
        >
          <VendorFormTrigger role={role} />
        </EmptyState>
      ) : (
        <VendorTable data={vendors} role={role} />
      )}
    </div>
  )
}

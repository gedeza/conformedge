"use client"

import { OrganizationSwitcher } from "@clerk/nextjs"

export function OrgSwitcher() {
  return (
    <OrganizationSwitcher
      appearance={{
        elements: {
          rootBox: "w-full",
          organizationSwitcherTrigger: "w-full justify-start px-2 py-1.5",
        },
      }}
      afterSelectOrganizationUrl="/dashboard"
      afterCreateOrganizationUrl="/dashboard"
    />
  )
}

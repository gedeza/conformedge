import { Suspense } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { TrialBannerWrapper } from "@/components/billing/trial-banner-wrapper"
import { PartnerNavLink } from "@/components/partner/partner-nav-link"
import { ReferralAttribution } from "@/components/shared/referral-attribution"
import { AdminNavLink } from "@/components/admin/admin-nav-link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <Suspense fallback={null}>
          <TrialBannerWrapper />
        </Suspense>
        <Suspense fallback={null}>
          <div className="flex gap-2 px-6 pt-2">
            <PartnerNavLink />
            <AdminNavLink />
          </div>
        </Suspense>
        <Suspense fallback={null}>
          <ReferralAttribution />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { getSuperAdminContext } from "@/lib/admin-auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getSuperAdminContext()

  if (!ctx) {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

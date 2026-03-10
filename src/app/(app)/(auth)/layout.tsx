import Image from "next/image"
import { Shield, FileCheck, BarChart3 } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[oklch(0.15_0.02_255)] text-white p-12">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/C_Edge_Logo.png"
              alt="ConformEdge"
              width={220}
              height={48}
              className="brightness-0 invert"
              priority
            />
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            AI-powered ISO compliance management for South African construction
            and infrastructure companies.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <FileCheck className="h-5 w-5 text-[oklch(0.69_0.17_163)]" />
            </div>
            <div>
              <p className="text-sm font-medium">Document Intelligence</p>
              <p className="text-xs text-white/50">AI classifies and maps documents to ISO clauses automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <Shield className="h-5 w-5 text-[oklch(0.69_0.17_163)]" />
            </div>
            <div>
              <p className="text-sm font-medium">Multi-Standard Compliance</p>
              <p className="text-xs text-white/50">ISO 9001, 14001, 45001, 27001 and more from a single platform</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2">
              <BarChart3 className="h-5 w-5 text-[oklch(0.69_0.17_163)]" />
            </div>
            <div>
              <p className="text-sm font-medium">Gap Analysis & Reporting</p>
              <p className="text-xs text-white/50">Real-time compliance scoring with actionable insights</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/30">
          &copy; 2025&ndash;{new Date().getFullYear()} ISU Technologies. All rights reserved.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-4 lg:w-1/2">
        {/* Mobile logo (visible on < lg) */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <Image
            src="/images/logo-icon.png"
            alt="ConformEdge"
            width={48}
            height={48}
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">ConformEdge</h1>
            <p className="text-xs text-muted-foreground">ISO Compliance Management</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

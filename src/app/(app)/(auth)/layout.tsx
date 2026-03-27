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
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between text-white p-12"
        style={{
          background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 25%, #0a2239 50%, #0d2847 75%, #091a2a 100%)",
        }}
      >
        {/* Gradient mesh orbs */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }}
        />
        {/* Geometric dot grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 0.75px, transparent 0.75px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content (above overlays) */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/images/C_Edge_Logo.png"
            alt="ConformEdge"
            width={220}
            height={48}
            className="brightness-0 invert"
            priority
          />
          <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-white/60">
            AI-powered SHEQ and compliance management for South African construction
            and infrastructure companies.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
              <FileCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Document Intelligence</p>
              <p className="text-xs text-white/50">AI classifies and maps documents to ISO clauses automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Multi-Standard Compliance</p>
              <p className="text-xs text-white/50">ISO 9001, 14001, 45001, 27001 and more from a single platform</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Gap Analysis & Reporting</p>
              <p className="text-xs text-white/50">Real-time compliance scoring with actionable insights</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          &copy; 2025&ndash;{new Date().getFullYear()} ISU Technologies. All rights reserved.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 lg:w-1/2"
        style={{
          background: "linear-gradient(160deg, #e4eaf1 0%, #d6dde8 30%, #c8d9f2 60%, #d1efe0 100%)",
        }}
      >
        {/* Soft accent orbs */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-[350px] w-[350px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
        />
        {/* Subtle grid continuation */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 0.75px, transparent 0.75px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Mobile logo (visible on < lg) */}
        <div className="relative z-10 mb-8 flex flex-col items-center gap-3 lg:hidden">
          <Image
            src="/images/logo-icon.png"
            alt="ConformEdge"
            width={48}
            height={48}
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">ConformEdge</h1>
            <p className="text-xs text-muted-foreground">SHEQ & Compliance Management</p>
          </div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

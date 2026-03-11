import { Check, Brain, Layers, FileText, Shield, BarChart3, Link2, ArrowRight } from "lucide-react"
import { FEATURE_DETAILS } from "./data"

const icons = [Brain, Layers]

function AiDocumentMockup() {
  return (
    <div className="relative rounded-xl border border-border/50 bg-white p-1 shadow-lg">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 rounded-t-lg bg-muted/50 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/50" />
          <div className="size-2.5 rounded-full bg-yellow-400/50" />
          <div className="size-2.5 rounded-full bg-green-400/50" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-muted px-3 py-1 text-[10px] text-muted-foreground">
          conformedge.co.za/dashboard/documents
        </div>
      </div>
      {/* Realistic AI classification UI */}
      <div className="rounded-b-lg bg-slate-50 p-4 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-800">AI Document Classification</span>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            Auto-Classified
          </span>
        </div>

        {/* Document card */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <FileText className="size-4 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-800">Safety-Management-Plan-2026.pdf</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Uploaded 2 minutes ago · 24 pages</p>
            </div>
          </div>

          {/* Classification result */}
          <div className="mt-3 rounded-md border border-blue-100 bg-blue-50/50 p-2.5">
            <div className="flex items-center gap-2">
              <Brain className="size-3.5 text-blue-600" />
              <span className="text-[10px] font-semibold text-blue-800">AI Classification Result</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Standard</span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">ISO 45001:2018</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Clause</span>
                <span className="text-[10px] font-medium text-slate-800">6.1.2 — Hazard identification</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Confidence</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[94%] rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gap insight */}
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
          <div className="flex items-start gap-2">
            <BarChart3 className="mt-0.5 size-3 shrink-0 text-amber-600" />
            <div>
              <span className="text-[10px] font-semibold text-amber-800">Gap Insight</span>
              <p className="mt-0.5 text-[10px] text-amber-700">
                Clause 6.1.3 (Risk assessment) has only 23% coverage — consider uploading your risk register.
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-slate-800">847</p>
            <p className="text-[9px] text-slate-500">Docs Classified</p>
          </div>
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-emerald-600">91%</p>
            <p className="text-[9px] text-slate-500">Avg Confidence</p>
          </div>
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-blue-600">5</p>
            <p className="text-[9px] text-slate-500">Standards Covered</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImsMockup() {
  const standards = [
    { code: "ISO 9001", color: "bg-blue-500", coverage: "87%" },
    { code: "ISO 14001", color: "bg-emerald-500", coverage: "72%" },
    { code: "ISO 45001", color: "bg-amber-500", coverage: "91%" },
  ]

  const crossRefs = [
    { from: "9001 §4.1", to: "14001 §4.1", label: "Context of the organization", score: "95%" },
    { from: "9001 §6.1", to: "45001 §6.1", label: "Actions to address risks", score: "88%" },
    { from: "14001 §7.2", to: "45001 §7.2", label: "Competence", score: "92%" },
  ]

  return (
    <div className="relative rounded-xl border border-border/50 bg-white p-1 shadow-lg">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 rounded-t-lg bg-muted/50 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/50" />
          <div className="size-2.5 rounded-full bg-yellow-400/50" />
          <div className="size-2.5 rounded-full bg-green-400/50" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-muted px-3 py-1 text-[10px] text-muted-foreground">
          conformedge.co.za/dashboard/ims
        </div>
      </div>
      {/* Realistic IMS UI */}
      <div className="rounded-b-lg bg-slate-50 p-4 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-violet-600" />
            <span className="text-xs font-semibold text-slate-800">Integrated Management System</span>
          </div>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
            Integration Score: 78%
          </span>
        </div>

        {/* Standard readiness bars */}
        <div className="space-y-2.5">
          {standards.map((std) => (
            <div key={std.code} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="size-3 text-slate-500" />
                  <span className="text-[10px] font-semibold text-slate-800">{std.code}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700">{std.coverage}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${std.color}`}
                  style={{ width: std.coverage }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Cross-standard mappings */}
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 p-2.5">
          <div className="flex items-center gap-2">
            <Link2 className="size-3 text-violet-600" />
            <span className="text-[10px] font-semibold text-violet-800">Cross-Standard Equivalences</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {crossRefs.map((ref) => (
              <div key={ref.from} className="flex items-center gap-1.5 rounded-md bg-white p-1.5 shadow-sm ring-1 ring-violet-100">
                <span className="rounded bg-blue-100 px-1 py-0.5 text-[8px] font-medium text-blue-700">{ref.from}</span>
                <ArrowRight className="size-2.5 text-violet-400" />
                <span className="rounded bg-emerald-100 px-1 py-0.5 text-[8px] font-medium text-emerald-700">{ref.to}</span>
                <span className="ml-auto hidden text-[8px] text-slate-500 sm:inline">{ref.label}</span>
                <span className="text-[9px] font-bold text-violet-600">{ref.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMS summary stats */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-violet-600">47</p>
            <p className="text-[9px] text-slate-500">Shared Clauses</p>
          </div>
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-emerald-600">23</p>
            <p className="text-[9px] text-slate-500">Gap Cascades</p>
          </div>
          <div className="rounded-md bg-white p-2 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold text-blue-600">3</p>
            <p className="text-[9px] text-slate-500">Standards Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const mockups = [AiDocumentMockup, ImsMockup]

export function FeatureDetails() {
  return (
    <section className="bg-landing-light-bg py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            Deep Dive
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Capabilities Under the Hood
          </h2>
        </div>

        <div className="mt-16 space-y-24">
          {FEATURE_DETAILS.map((detail, idx) => {
            const Icon = icons[idx]
            const Mockup = mockups[idx]
            const isReversed = idx % 2 === 1
            return (
              <div
                key={detail.title}
                className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                  isReversed ? "lg:[direction:rtl]" : ""
                }`}
              >
                {/* Text */}
                <div className={isReversed ? "lg:[direction:ltr]" : ""}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-landing-accent/10">
                      <Icon className="size-5 text-landing-accent" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-landing-accent">
                      {detail.subtitle}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {detail.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {detail.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {detail.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-landing-cta/10">
                          <Check className="size-3 text-landing-cta" />
                        </div>
                        <span className="text-sm text-muted-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Feature mockup */}
                <div className={isReversed ? "lg:[direction:ltr]" : ""}>
                  <Mockup />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

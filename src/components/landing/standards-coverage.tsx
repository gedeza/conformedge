import { Shield } from "lucide-react"
import { ISO_STANDARDS } from "./data"

export function StandardsCoverage() {
  return (
    <section id="standards" className="bg-landing-navy py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            Standards Coverage
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Comprehensive ISO Framework Support
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Pre-loaded clause structures, requirement mappings, and cross-standard references
            for the most critical ISO standards.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ISO_STANDARDS.map((std) => (
            <div
              key={std.code}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-landing-accent/30 hover:bg-white/10"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-landing-accent/10">
                <Shield className="size-5 text-landing-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{std.code}</h3>
              <p className="mt-1 text-sm text-white/60">{std.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-landing-accent">{std.clauses}</span>
                <span className="text-xs text-white/40">clauses tracked</span>
              </div>
            </div>
          ))}

          {/* Coming soon card */}
          <div className="relative rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/5">
              <span className="text-lg text-white/20">+</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white/40">Custom Standards</h3>
            <p className="mt-1 text-sm text-white/30">Add your own standards and requirements</p>
            <div className="mt-4">
              <span className="rounded-full bg-landing-accent/10 px-3 py-1 text-xs font-medium text-landing-accent">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

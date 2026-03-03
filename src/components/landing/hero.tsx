import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-landing-navy via-landing-navy to-landing-navy-light">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative mx-auto px-4 pb-20 pt-24 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Text — 3/5 */}
          <div className="lg:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-landing-accent/30 bg-landing-accent/10 px-4 py-1.5 text-xs font-medium text-landing-accent">
              <span className="size-1.5 rounded-full bg-landing-accent animate-pulse" />
              AI-Powered ISO Compliance Management
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              ISO Compliance{" "}
              <span className="bg-gradient-to-r from-landing-cta to-landing-accent bg-clip-text text-transparent">
                Simplified by AI
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Manage ISO 9001, 14001, 45001, 27001 and more from a single platform.
              AI classifies documents, detects gaps, and generates audit packs —
              so your team can focus on delivering projects, not chasing paperwork.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="bg-landing-cta text-landing-navy font-semibold shadow-lg shadow-landing-cta/25 hover:bg-landing-cta/90"
              >
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#features">
                  <Play className="mr-2 size-4" />
                  See How It Works
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-white/40">
              No credit card required &middot; 14-day free trial &middot; Cancel anytime
            </p>
          </div>

          {/* Screenshot — 2/5 */}
          <div className="relative lg:col-span-2">
            <div className="relative rounded-xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-black/30 backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-lg bg-white/5 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-white/20" />
                  <div className="size-2.5 rounded-full bg-white/20" />
                  <div className="size-2.5 rounded-full bg-white/20" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-white/30">
                  app.conformedge.co.za/dashboard
                </div>
              </div>
              {/* Dashboard preview placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-b-lg bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="absolute inset-0 flex flex-col p-4">
                  {/* Mock sidebar */}
                  <div className="flex gap-3 flex-1">
                    <div className="hidden sm:flex w-16 flex-col gap-2 rounded-lg bg-white/5 p-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-2 rounded bg-white/10" />
                      ))}
                    </div>
                    {/* Mock content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-lg bg-landing-cta/20 p-3">
                          <div className="h-2 w-12 rounded bg-landing-cta/40" />
                          <div className="mt-2 h-6 w-16 rounded bg-landing-cta/30" />
                        </div>
                        <div className="flex-1 rounded-lg bg-landing-accent/20 p-3">
                          <div className="h-2 w-12 rounded bg-landing-accent/40" />
                          <div className="mt-2 h-6 w-16 rounded bg-landing-accent/30" />
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="h-2 w-24 rounded bg-white/10" />
                        <div className="mt-3 space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-landing-cta/50" />
                              <div className="h-1.5 flex-1 rounded bg-white/10" />
                              <div className="h-4 w-12 rounded-full bg-landing-cta/20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-landing-cta/5 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

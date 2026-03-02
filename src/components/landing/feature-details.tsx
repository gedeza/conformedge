import { Check, Brain, Layers } from "lucide-react"
import { FEATURE_DETAILS } from "./data"

const icons = [Brain, Layers]

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

                {/* Screenshot placeholder */}
                <div className={isReversed ? "lg:[direction:ltr]" : ""}>
                  <div className="relative rounded-xl border border-border/50 bg-white p-1 shadow-lg">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 rounded-t-lg bg-muted/50 px-4 py-2">
                      <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-400/50" />
                        <div className="size-2.5 rounded-full bg-yellow-400/50" />
                        <div className="size-2.5 rounded-full bg-green-400/50" />
                      </div>
                      <div className="ml-4 flex-1 rounded-md bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                        app.conformedge.co.za
                      </div>
                    </div>
                    {/* Content placeholder */}
                    <div className="aspect-[16/10] rounded-b-lg bg-gradient-to-br from-muted/30 to-muted/80 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-32 rounded bg-foreground/10" />
                          <div className="h-6 w-20 rounded-full bg-landing-accent/20" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-lg bg-white/60 p-3 shadow-sm">
                              <div className="h-2 w-10 rounded bg-foreground/10" />
                              <div className="mt-2 h-5 w-14 rounded bg-landing-cta/20" />
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg bg-white/60 p-3 shadow-sm">
                          <div className="h-2 w-20 rounded bg-foreground/10" />
                          <div className="mt-3 space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="size-3 rounded bg-landing-accent/30" />
                                <div className="h-1.5 flex-1 rounded bg-foreground/5" />
                                <div className="h-4 w-16 rounded-full bg-landing-cta/15" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

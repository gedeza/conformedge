import { Upload, BarChart3, Send } from "lucide-react"
import { PROCESS_STEPS } from "./data"

const icons = [Upload, BarChart3, Send]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-landing-light-bg py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Three Steps to Audit-Ready
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From document upload to audit submission — ConformEdge handles the heavy lifting.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connecting line — desktop only */}
          <div className="absolute top-16 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-landing-accent/0 via-landing-accent/40 to-landing-accent/0 lg:block" />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {PROCESS_STEPS.map((step, idx) => {
              const Icon = icons[idx]
              return (
                <div key={step.step} className="relative text-center">
                  {/* Step circle */}
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border-2 border-landing-accent/30 bg-white shadow-sm">
                    <Icon className="size-6 text-landing-accent" />
                  </div>
                  {/* Step number */}
                  <span className="mt-4 inline-flex size-7 items-center justify-center rounded-full bg-landing-accent/10 text-xs font-bold text-landing-accent">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

import { FileWarning, AlertOctagon, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PAIN_POINTS } from "./data"

const icons = [FileWarning, AlertOctagon, Clock]

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            The Problem
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Compliance Shouldn&apos;t Be This Hard
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            South African businesses lose time and money to manual compliance processes every day.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((point, idx) => {
            const Icon = icons[idx]
            return (
              <Card key={point.title} className="relative overflow-hidden border-border/50">
                <CardContent className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                    <Icon className="size-6 text-destructive" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                  <div className="mt-6 border-t pt-4">
                    <span className="text-2xl font-bold text-destructive">{point.stat}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{point.statLabel}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

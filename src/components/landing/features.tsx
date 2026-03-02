import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FEATURES } from "./data"

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for ISO Compliance
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From document upload to audit submission — a complete compliance management platform.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className={cn(
                "group relative overflow-hidden border-border/50 transition-all hover:border-landing-accent/30 hover:shadow-md",
                feature.span === 2 && "sm:col-span-2"
              )}
            >
              <CardContent className="p-6">
                <div className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  feature.span === 2
                    ? "bg-landing-accent/10"
                    : "bg-muted"
                )}>
                  <feature.icon className={cn(
                    "size-5",
                    feature.span === 2
                      ? "text-landing-accent"
                      : "text-foreground"
                  )} />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
              {/* Accent border on AI card */}
              {feature.span === 2 && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-landing-cta to-landing-accent" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PRICING_TIERS } from "./data"

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-landing-accent">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your organisation. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative overflow-hidden",
                tier.highlighted
                  ? "border-landing-accent shadow-lg shadow-landing-accent/10 scale-[1.02]"
                  : "border-border/50"
              )}
            >
              {tier.highlighted && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-landing-cta to-landing-accent" />
              )}
              <CardContent className="p-8">
                {tier.highlighted && (
                  <span className="inline-block rounded-full bg-landing-accent/10 px-3 py-1 text-xs font-medium text-landing-accent mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-landing-cta/10">
                        <Check className="size-3 text-landing-cta" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "mt-8 w-full",
                    tier.highlighted
                      ? "bg-landing-cta text-landing-navy font-semibold hover:bg-landing-cta/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  <Link href={tier.name === "Enterprise" ? "#" : "/sign-up"}>
                    {tier.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

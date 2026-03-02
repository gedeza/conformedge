"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  PRICING_TIERS,
  AI_CREDIT_PACKS,
  ANNUAL_DISCOUNT_MONTHS,
} from "./data"

function formatRand(amount: number): string {
  return "R" + amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 })
}

function getDisplayPrice(monthlyPrice: number, isAnnual: boolean) {
  if (isAnnual) {
    const annualTotal = monthlyPrice * ANNUAL_DISCOUNT_MONTHS
    const effectiveMonthly = Math.round(annualTotal / 12)
    return {
      price: formatRand(annualTotal),
      period: "/year",
      effective: `${formatRand(effectiveMonthly)}/mo effective`,
    }
  }
  return {
    price: formatRand(monthlyPrice),
    period: "/month",
    effective: null,
  }
}

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
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

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={cn("text-sm font-medium", !isAnnual && "text-foreground", isAnnual && "text-muted-foreground")}>
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual && "text-foreground", !isAnnual && "text-muted-foreground")}>
            Annual
          </span>
          <Badge variant="secondary" className="bg-landing-cta/10 text-landing-cta border-landing-cta/20">
            Save 17%
          </Badge>
        </div>

        {/* Pricing cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PRICING_TIERS.map((tier) => {
            const isEnterprise = tier.monthlyPrice === null
            const displayPrice = tier.monthlyPrice !== null
              ? getDisplayPrice(tier.monthlyPrice, isAnnual)
              : null

            return (
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

                  {/* Price block — fixed height to prevent layout shift */}
                  <div className="mt-4 min-h-[4.5rem] transition-all duration-300">
                    {isEnterprise ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">Custom</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">
                            {displayPrice!.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {displayPrice!.period}
                          </span>
                        </div>
                        {displayPrice!.effective && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {displayPrice!.effective}
                          </div>
                        )}
                      </>
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
                    <Link href={isEnterprise ? "#" : "/sign-up"}>
                      {tier.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI Credits add-on section */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <Zap className="size-5 text-landing-accent" />
            <h3 className="text-2xl font-bold">Need More AI Classifications?</h3>
          </div>
          <p className="mt-2 text-muted-foreground">
            Top up with credit packs. Credits never expire.
          </p>

          <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
            {AI_CREDIT_PACKS.map((pack) => (
              <Card
                key={pack.credits}
                className={cn(
                  "relative",
                  pack.popular
                    ? "border-landing-accent shadow-md shadow-landing-accent/10"
                    : "border-border/50"
                )}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-landing-accent text-white border-0">
                      Best Value
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 pt-5">
                  <div className="text-3xl font-bold">{pack.credits.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">credits</div>
                  <div className="mt-3 text-2xl font-bold text-landing-cta">
                    {formatRand(pack.price)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    R{pack.perCredit.toFixed(2)} per credit
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

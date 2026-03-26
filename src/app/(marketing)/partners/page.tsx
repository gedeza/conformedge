import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Users, Building2, Palette } from "lucide-react"

export const metadata: Metadata = {
  title: "Partner Programme | ConformEdge",
  description: "Earn recurring revenue as a ConformEdge partner. Referral, Consulting, and White-Label programmes available.",
}

const PARTNER_TIERS = [
  {
    name: "Referral Partner",
    icon: Users,
    tagline: "Passive income, zero effort",
    setup: "Free",
    monthly: "Free",
    highlight: false,
    benefits: [
      "10% commission on Year 1 subscription (accrued monthly)",
      "Unique referral link with 90-day cookie",
      "Real-time tracking dashboard",
      "No management responsibilities",
      "Monthly EFT payouts",
    ],
    cta: "Register as Referral Partner",
    ctaHref: "/referral/register",
    ideal: "SHEQ consultants, industry contacts, business networkers",
  },
  {
    name: "Consulting Partner",
    icon: Building2,
    tagline: "Scale your practice with our platform",
    setup: "R25,000 once-off",
    monthly: "R999/seat + R1,499\u2013R2,999/client",
    highlight: true,
    benefits: [
      "Multi-tenant partner console \u2014 manage all clients from one dashboard",
      "5 consultant seats included (R999/seat for additional)",
      "Flat per-client pricing: Essentials R1,499 | Professional R1,999 | Business R2,999",
      "Cross-org compliance insights and benchmarking",
      "Dedicated partner support and co-marketing",
      "Charge clients your own rates \u2014 keep the margin",
    ],
    cta: "Enquire About Consulting Partnership",
    ctaHref: "mailto:partners@isutech.co.za?subject=Consulting Partner Enquiry",
    ideal: "ISO consulting firms, SHEQ advisory practices, compliance service providers",
  },
  {
    name: "White-Label Partner",
    icon: Palette,
    tagline: "Your brand, your domain, our technology",
    setup: "R25,000+ once-off",
    monthly: "R999/seat + R1,499\u2013R2,999/client",
    highlight: false,
    benefits: [
      "Everything in Consulting, plus:",
      "Custom branding \u2014 your logo, colours, domain",
      "Your clients never see ConformEdge",
      "Custom email templates and notifications",
      "API access for deep integration",
      "White-glove onboarding and migration support",
    ],
    cta: "Enquire About White-Label Partnership",
    ctaHref: "mailto:partners@isutech.co.za?subject=White-Label Partner Enquiry",
    ideal: "Large consulting firms, software resellers, industry associations",
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/30 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-4">Partner Programme</Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Grow Your Business With ConformEdge
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Earn recurring revenue by offering SA&apos;s most comprehensive ISO compliance platform to your clients.
            Three partnership models to match your business.
          </p>
        </div>
      </section>

      {/* Partner Tiers */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {PARTNER_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${tier.highlight ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <tier.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="mb-4 space-y-1">
                    <p className="text-xs text-muted-foreground">Setup</p>
                    <p className="text-lg font-bold">{tier.setup}</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-sm font-semibold">{tier.monthly}</p>
                  </div>

                  <ul className="mb-6 flex-1 space-y-2">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mb-4 text-xs text-muted-foreground">
                    <strong>Ideal for:</strong> {tier.ideal}
                  </p>

                  <Button
                    asChild
                    className="w-full gap-2"
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    <Link href={tier.ctaHref}>
                      {tier.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Example */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Revenue Example — Consulting Partner</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Scenario</th>
                  <th className="pb-3 font-medium">Clients</th>
                  <th className="pb-3 font-medium">You Charge</th>
                  <th className="pb-3 font-medium">Platform Cost</th>
                  <th className="pb-3 font-medium">Your Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Starting", "5", "R25,000/mo", "R14,990/mo", "R10,010/mo"],
                  ["Growing", "10", "R50,000/mo", "R24,985/mo", "R25,015/mo"],
                  ["Established", "20", "R100,000/mo", "R47,975/mo", "R52,025/mo"],
                ].map(([scenario, clients, revenue, cost, margin]) => (
                  <tr key={scenario}>
                    <td className="py-3 font-medium">{scenario}</td>
                    <td className="py-3">{clients}</td>
                    <td className="py-3">{revenue}</td>
                    <td className="py-3 text-muted-foreground">{cost}</td>
                    <td className="py-3 font-bold text-green-700">{margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Based on Professional clients at R5,000/mo service fee. Platform cost: 5 seats (R4,995) + per-client (R1,999).
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Ready to Partner?</h2>
          <p className="mt-2 text-muted-foreground">
            Start with a Referral Partnership (free, no commitment) or get in touch about Consulting and White-Label options.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/referral/register">
                Register as Referral Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="mailto:partners@isutech.co.za?subject=Partner Programme Enquiry">
                Contact Us About Consulting
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

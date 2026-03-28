"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Banknote,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Target,
  TrendingUp,
  MessageSquare,
  Share2,
  Building2,
  HardHat,
  Factory,
  Pickaxe,
  Lightbulb,
  CreditCard,
  CalendarCheck,
  Gift,
  Shield,
  Smartphone,
  Zap,
  BarChart3,
  ClipboardCheck,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  How You Earn tab                                                   */
/* ------------------------------------------------------------------ */

function HowYouEarnTab({ commissionPercent }: { commissionPercent: number }) {
  return (
    <div className="space-y-6">
      {/* Step-by-step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            How It Works — 4 Simple Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                icon: Share2,
                title: "Share Your Link",
                desc: "Send your unique referral link to any company that needs SHEQ compliance management.",
              },
              {
                step: "2",
                icon: Users,
                title: "They Sign Up",
                desc: "Your referral visits ConformEdge and creates an account. We track them automatically via your link.",
              },
              {
                step: "3",
                icon: CreditCard,
                title: "They Subscribe",
                desc: "When your referral selects a paid plan (Essentials, Professional, or Business), you start earning.",
              },
              {
                step: "4",
                icon: Banknote,
                title: "You Get Paid",
                desc: "You earn commission on every payment they make for 12 months. Paid to your bank via EFT.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-lg border bg-card p-4 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {s.step}
                </div>
                <s.icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commission breakdown */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-600" />
            Your Commission — {commissionPercent}% for 12 Months
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            You earn <strong>{commissionPercent}%</strong> of every payment your
            referral makes during their <strong>first 12 months</strong> as a
            subscriber. Commission accrues monthly as the client pays — not as a
            lump sum.
          </p>

          {/* Earnings table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-semibold">
                    Client&apos;s Plan
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Monthly Fee
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Your Monthly Earn
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-green-700">
                    Your 12-Month Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: "Essentials", fee: 2299, badge: "Small firms" },
                  {
                    plan: "Professional",
                    fee: 5499,
                    badge: "Most common",
                    highlight: true,
                  },
                  { plan: "Business", fee: 8499, badge: "Large contractors" },
                  { plan: "Enterprise", fee: 16999, badge: "Mining / SOEs" },
                ].map((row) => {
                  const monthlyEarn = Math.round(
                    row.fee * (commissionPercent / 100)
                  )
                  const annualEarn = monthlyEarn * 12
                  return (
                    <tr
                      key={row.plan}
                      className={`border-b last:border-0 ${row.highlight ? "bg-green-50/50" : ""}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.plan}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            {row.badge}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        R{row.fee.toLocaleString()}/mo
                      </td>
                      <td className="py-3 px-4">
                        R{monthlyEarn.toLocaleString()}/mo
                      </td>
                      <td className="py-3 px-4 font-bold text-green-700">
                        R{annualEarn.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Multi-referral examples */}
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-5 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              What Multiple Referrals Look Like
            </h4>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { refs: 3, plan: "Professional", perClient: 6599 },
                { refs: 5, plan: "Professional", perClient: 6599 },
                { refs: 10, plan: "Mixed", perClient: 5500 },
              ].map((ex) => (
                <div
                  key={ex.refs}
                  className="rounded-md bg-white/80 p-3 text-center border border-green-100"
                >
                  <p className="text-2xl font-bold text-green-700">
                    R{(ex.refs * ex.perClient).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    per year
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ex.refs} {ex.plan} clients
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-green-700">
              No cap on referrals. The more you refer, the more you earn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-blue-200" />
              </div>
              <div className="pb-6">
                <p className="font-semibold text-sm">Commission Accrues Monthly</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Each time your referred client pays their monthly subscription, your{" "}
                  {commissionPercent}% commission is calculated and added to your balance.
                  For example, a Professional client paying R5,499/mo earns you R550 that month.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-blue-200" />
              </div>
              <div className="pb-6">
                <p className="font-semibold text-sm">Monthly EFT Payouts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Commission is paid out monthly via EFT to the bank account you registered with.
                  Payouts are processed on the <strong>last business day of each month</strong> for
                  all commissions accrued during that month.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  3
                </div>
                <div className="w-0.5 flex-1 bg-blue-200" />
              </div>
              <div className="pb-6">
                <p className="font-semibold text-sm">12-Month Earning Window</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You earn commission for each client&apos;s first 12 months of payments.
                  After 12 months, the commission for that client stops — but every new
                  referral starts a fresh 12-month window.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Annual Subscribers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  If your referral pays annually, all 12 months of commission credit at once.
                  Your payout is larger and immediate for that client.
                </p>
              </div>
            </div>
          </div>

          {/* Worked example */}
          <div className="mt-5 rounded-lg border bg-muted/30 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Worked Example
            </h4>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>You refer ABC Construction.</strong> They sign up for the
                Professional plan at R5,499/mo.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded bg-white p-2 border">
                  <p className="text-muted-foreground">Month 1</p>
                  <p className="font-bold text-foreground">R550</p>
                </div>
                <div className="rounded bg-white p-2 border">
                  <p className="text-muted-foreground">Month 3</p>
                  <p className="font-bold text-foreground">R1,650 total</p>
                </div>
                <div className="rounded bg-white p-2 border">
                  <p className="text-muted-foreground">Month 6</p>
                  <p className="font-bold text-foreground">R3,300 total</p>
                </div>
                <div className="rounded bg-white p-2 border border-green-200 bg-green-50">
                  <p className="text-green-700">Month 12</p>
                  <p className="font-bold text-green-700">R6,599 total</p>
                </div>
              </div>
              <p className="mt-2">
                Now refer 5 clients at the same tier ={" "}
                <strong className="text-foreground">R32,994/year</strong> with zero
                ongoing management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-600" />
            Important Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Clock,
                title: "90-Day Cookie",
                desc: "Your referral link tracks the prospect for 90 days. If they sign up within that window, you get credit.",
              },
              {
                icon: CheckCircle2,
                title: "No Sales Targets",
                desc: "There is no minimum number of referrals. Refer 1 or 100 — it's entirely up to you.",
              },
              {
                icon: Gift,
                title: "Free Forever",
                desc: "The referral programme costs nothing to join. No setup fees, no monthly charges, no contract.",
              },
              {
                icon: ArrowRight,
                title: "Upgrade Path",
                desc: "If you want to manage clients directly, you can upgrade to a Consulting Partner at any time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-lg border p-3"
              >
                <item.icon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Marketing Kit tab                                                  */
/* ------------------------------------------------------------------ */

function MarketingKitTab({ referralLink }: { referralLink: string }) {
  return (
    <div className="space-y-6">
      {/* Sector pitches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Sector-Specific Pitch Guides
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use these talking points when approaching prospects in specific
            industries. Each guide explains the pain points and how ConformEdge
            solves them.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: HardHat,
                sector: "Construction",
                color: "bg-amber-100 text-amber-700",
                points: [
                  "CIDB grading requires documented safety systems",
                  "ISO 45001 baseline for Tier 1 pre-qualification",
                  "Work permits still on carbon-copy books",
                  "Late W.Cl.2 submissions trigger penalties",
                ],
                opener:
                  '"Do your clients still manage safety files on spreadsheets? There\'s a platform built for SA construction that handles ISO 45001, incidents, permits, and equipment — all in one place."',
              },
              {
                icon: Pickaxe,
                sector: "Mining",
                color: "bg-slate-100 text-slate-700",
                points: [
                  "DMRE/MHSA compliance is non-negotiable",
                  "Section 11(5) requires designated safety officers",
                  "Incident escalation to Inspector of Mines",
                  "Equipment calibration for underground operations",
                ],
                opener:
                  '"Mining houses spend millions on compliance staff. ConformEdge automates MHSA reporting, incident escalation, and equipment tracking — purpose-built for SA mining regulations."',
              },
              {
                icon: Factory,
                sector: "Manufacturing",
                color: "bg-blue-100 text-blue-700",
                points: [
                  "ISO 9001 + 14001 + 45001 triple certification",
                  "Equipment calibration and maintenance tracking",
                  "Incident management with root cause analysis",
                  "Subcontractor compliance for site access",
                ],
                opener:
                  '"Manufacturers juggling quality, environmental, and safety certifications need one system. ConformEdge maps all three ISOs with cross-standard gap analysis."',
              },
            ].map((s) => (
              <div key={s.sector} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold">{s.sector}</h4>
                </div>
                <ul className="space-y-1.5">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-green-500" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="rounded-md bg-muted/50 p-3 border">
                  <p className="text-[11px] text-muted-foreground italic">
                    {s.opener}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick talking points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ready-Made Messages
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Copy and personalise these messages for WhatsApp, email, or LinkedIn.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "WhatsApp / SMS",
              msg: `Hi [Name], I came across a platform that handles ISO compliance, incidents, work permits, and equipment tracking — all in one system built for SA companies. It's called ConformEdge. Worth a quick look: ${referralLink}`,
            },
            {
              label: "Email Introduction",
              msg: `Subject: SHEQ compliance tool built for SA construction\n\nHi [Name],\n\nI wanted to share a platform I think would help your team — ConformEdge. It's an AI-powered SHEQ & compliance management system that handles ISO 45001/14001/9001, incident reporting (including COIDA W.Cl.2), work permits, and equipment tracking.\n\nBuilt specifically for South African regulations including MHSA/DMRE, POPIA, and ECSA.\n\nYou can take a look here: ${referralLink}\n\nHappy to chat if you'd like more detail.\n\nRegards`,
            },
            {
              label: "LinkedIn Message",
              msg: `Hi [Name], do you manage SHEQ compliance for construction or infrastructure projects? ConformEdge is an SA-built platform that centralises ISO standards, incidents, permits, and audits in one system — with AI document classification. Might be relevant: ${referralLink}`,
            },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {m.label}
                </Badge>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-sans leading-relaxed">
                {m.msg}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key stats to share */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Key Stats to Share With Prospects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stat: "36", label: "Modules" },
              { stat: "11", label: "Standards" },
              { stat: "395+", label: "Sub-clauses covered" },
              { stat: "7", label: "Work permit types" },
              { stat: "13", label: "Inspection templates" },
              { stat: "R2,299", label: "Starting price/mo" },
              { stat: "PWA", label: "Mobile + offline" },
              { stat: "AI", label: "Document classification" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-muted/50 p-3 text-center border"
              >
                <p className="text-lg font-bold text-foreground">{s.stat}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Overview tab                                               */
/* ------------------------------------------------------------------ */

function ProductOverviewTab() {
  return (
    <div className="space-y-6">
      {/* What is ConformEdge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            What is ConformEdge?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            ConformEdge is an <strong>AI-powered SHEQ & Compliance Management</strong>{" "}
            platform built specifically for South African construction, mining, and
            infrastructure companies. It replaces spreadsheets, paper-based permit
            books, and disconnected tools with a single system.
          </p>
          <p>
            Companies use it to manage their ISO certifications, log and investigate
            incidents, issue work permits, track equipment, and generate audit-ready
            documentation — all from one dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Core features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Core Features Your Referrals Get
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "AI Document Classification",
                desc: "Upload any document — AI reads it, identifies the ISO clause, and files it automatically. No manual tagging.",
              },
              {
                title: "11 Compliance Frameworks",
                desc: "ISO 9001, 14001, 45001, 22301, 27001, 37001, 39001, MHSA/DMRE, POPIA, ECSA, SACPCMP — all built in.",
              },
              {
                title: "Incident Management",
                desc: "Full lifecycle: near-miss to fatality. Evidence capture, fishbone analysis, COIDA W.Cl.2 export, LTIFR dashboards.",
              },
              {
                title: "Work Permits (7 Types)",
                desc: "Hot work, confined space, working at heights, electrical, excavation, lifting, general — digital sign-off and auto-expiry.",
              },
              {
                title: "Equipment Register",
                desc: "Asset lifecycle with maintenance schedules, calibration tracking, 13 WRC inspection templates, CAPA escalation.",
              },
              {
                title: "Audit Pack Generation",
                desc: "One-click PDF audit packs with cover page, executive summary, compliance evidence, and sign-off — audit-ready in minutes.",
              },
              {
                title: "Subcontractor Portal",
                desc: "Subcontractors upload their own certificates. Expiry alerts notify 30 days before lapse. Compliance scoring ranks them.",
              },
              {
                title: "Mobile PWA",
                desc: "Works on any device — capture data on-site with camera, digital signatures, and offline sync. No app store needed.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 rounded-lg border p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing at a glance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Pricing Your Referrals Will See
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            So you can answer pricing questions confidently.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-semibold">Tier</th>
                  <th className="py-3 px-4 text-left font-semibold">Monthly</th>
                  <th className="py-3 px-4 text-left font-semibold">Users</th>
                  <th className="py-3 px-4 text-left font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    tier: "Essentials",
                    price: "R2,299",
                    users: "3",
                    best: "Small firms, single standard",
                  },
                  {
                    tier: "Professional",
                    price: "R5,499",
                    users: "5",
                    best: "Multi-standard, growing teams",
                    highlight: true,
                  },
                  {
                    tier: "Business",
                    price: "R8,499",
                    users: "10",
                    best: "Large contractors, full features",
                  },
                  {
                    tier: "Enterprise",
                    price: "From R16,999",
                    users: "25",
                    best: "Mining, SOEs, multi-site",
                  },
                ].map((row) => (
                  <tr
                    key={row.tier}
                    className={`border-b last:border-0 ${row.highlight ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium">
                      {row.tier}
                      {row.highlight && (
                        <Badge className="ml-2 text-[10px] px-1.5" variant="secondary">
                          Popular
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{row.price}/mo</td>
                    <td className="py-3 px-4">{row.users} included</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {row.best}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All tiers include AI document classification, incident management,
            audit pack generation, and mobile access. 17% discount on annual billing.
          </p>
        </CardContent>
      </Card>

      {/* SA-specific */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Built for South Africa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Rand pricing — no USD surprises",
              "MHSA/DMRE mining regulations",
              "POPIA compliance framework",
              "ECSA & SACPCMP frameworks",
              "SA-hosted infrastructure",
              "Local support in SAST hours",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border p-2.5"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                <p className="text-xs text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ tab                                                            */
/* ------------------------------------------------------------------ */

function FaqItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-lg border p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-sm">{question}</p>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      {open && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {answer}
        </p>
      )}
    </button>
  )
}

function FaqTab() {
  const faqs = [
    {
      q: "Is it really free to join?",
      a: "Yes. The referral programme has no setup fees, no monthly charges, and no contract. You register, get your link, and start earning when your referrals convert.",
    },
    {
      q: "How long does my referral link stay active?",
      a: "Your referral link uses a 90-day tracking cookie. If a prospect clicks your link and signs up within 90 days, you receive credit for that referral — even if they don't sign up immediately.",
    },
    {
      q: "When exactly do I get paid?",
      a: "Commission is paid via EFT on the last business day of each month. You'll see accrued commission on your dashboard as clients pay their subscriptions. Payouts cover all commission earned during that calendar month.",
    },
    {
      q: "What if my referral upgrades their plan?",
      a: "If a client upgrades (e.g., Essentials to Professional), your commission adjusts to the new plan amount for the remainder of the 12-month window. Upgrades benefit you.",
    },
    {
      q: "What if my referral cancels early?",
      a: "You earn commission only on payments actually made. If a client cancels after 6 months, you receive 6 months of commission. There are no clawbacks on payments already made.",
    },
    {
      q: "Do I need SHEQ knowledge to refer?",
      a: "It helps but isn't required. If you know companies in construction, mining, or manufacturing that deal with safety compliance, ISO certifications, or audit requirements — you're a good fit. The marketing materials on this dashboard will help you talk about the product.",
    },
    {
      q: "Can I refer companies outside South Africa?",
      a: "ConformEdge currently focuses on South African regulatory frameworks (MHSA, POPIA, ECSA, etc.). International companies operating in SA are a great fit. Pure international referrals are less suited right now.",
    },
    {
      q: "What's the difference between Referral and Consulting Partner?",
      a: "As a Referral Partner, you simply introduce prospects — they manage their own ConformEdge account. As a Consulting Partner, you manage multiple client organisations from a single dashboard, with your own consultant seats. Consulting Partners pay R25,000 setup + monthly fees but earn much higher margins. You can upgrade anytime.",
    },
    {
      q: "How do I track my referrals?",
      a: "This dashboard shows every referral in real-time: link clicks, sign-ups, conversions, and commission earned. You'll also receive email notifications when a referral progresses through each stage.",
    },
    {
      q: "Is there a limit on how many companies I can refer?",
      a: "No limit. Refer as many companies as you like. Each conversion earns you 10% for 12 months.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </CardContent>
      </Card>

      {/* Tips for success */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Tips for Successful Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                tip: "Lead with the pain point, not the product",
                detail:
                  'Ask "how do you currently manage your safety files?" rather than pitching features. Let them describe their frustration first.',
              },
              {
                tip: "Target decision-makers",
                detail:
                  "SHEQ managers, compliance officers, operations directors, and business owners are the people who feel the compliance pain and can authorise purchases.",
              },
              {
                tip: "Focus on construction and mining",
                detail:
                  "These sectors have the heaviest compliance burden in SA — CIDB grading, MHSA, ISO 45001. They're the most likely to convert.",
              },
              {
                tip: "Mention the mobile app",
                detail:
                  "Site-based teams love hearing they can capture incidents, complete checklists, and sign permits from their phone — even offline.",
              },
              {
                tip: "Use the pricing comparison",
                detail:
                  '"R2,299/mo is less than a single safety officer\'s daily rate" is a powerful comparison that puts the cost in perspective.',
              },
              {
                tip: "Follow up within a week",
                detail:
                  "If someone clicks but doesn't sign up, a friendly follow-up message often converts interest into action.",
              },
            ].map((t) => (
              <div key={t.tip} className="flex gap-3 rounded-lg border p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-1" />
                <div>
                  <p className="font-medium text-sm">{t.tip}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact / support */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Need Help?</p>
              <p className="text-xs text-muted-foreground mt-1">
                If you have questions about the referral programme, need
                customised marketing material, or want to discuss upgrading to a
                Consulting Partner, contact us at{" "}
                <a
                  href="mailto:conformedge@isutech.co.za"
                  className="font-medium text-primary hover:underline"
                >
                  conformedge@isutech.co.za
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Resource Hub                                                  */
/* ------------------------------------------------------------------ */

export function ReferralResourceHub({
  commissionPercent,
  referralLink,
}: {
  commissionPercent: number
  referralLink: string
}) {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Partner Resource Hub</h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to understand the programme, pitch ConformEdge,
          and maximise your earnings.
        </p>
      </div>

      <Tabs defaultValue="earn" className="w-full">
        <TabsList className="w-full justify-start" variant="line">
          <TabsTrigger value="earn" className="gap-1.5">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">How You Earn</span>
            <span className="sm:hidden">Earn</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-1.5">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Marketing Kit</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
          <TabsTrigger value="product" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Product Guide</span>
            <span className="sm:hidden">Product</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ & Tips</span>
            <span className="sm:hidden">FAQ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earn" className="mt-4">
          <HowYouEarnTab commissionPercent={commissionPercent} />
        </TabsContent>

        <TabsContent value="marketing" className="mt-4">
          <MarketingKitTab referralLink={referralLink} />
        </TabsContent>

        <TabsContent value="product" className="mt-4">
          <ProductOverviewTab />
        </TabsContent>

        <TabsContent value="faq" className="mt-4">
          <FaqTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

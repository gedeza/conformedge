import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { RegisterForm } from "./register-form"
import { Gift, DollarSign, Clock, Shield } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register as Referral Partner | ConformEdge",
  description:
    "Earn 10% commission by referring companies to ConformEdge. No cost, no contract, no management required.",
}

export default function ReferralRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">
                Referral Partner Programme
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Earn by Referring.{" "}
              <span className="text-amber-400">No Cost. No Management.</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Know companies that need ISO compliance? Introduce them to
              ConformEdge and earn 10% of their subscription for 12 months.
            </p>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-10 bg-white border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">10% Commission</p>
                <p className="text-sm text-slate-500">On Year 1 payments</p>
              </div>
              <div>
                <Gift className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">R0 Cost</p>
                <p className="text-sm text-slate-500">Completely free</p>
              </div>
              <div>
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">5 Min Setup</p>
                <p className="text-sm text-slate-500">Register below</p>
              </div>
              <div>
                <Shield className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">No Contract</p>
                <p className="text-sm text-slate-500">Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Register as a Referral Partner
            </h2>
            <p className="text-slate-500 mb-8">
              Fill in the form below. We'll review your application and send your
              unique referral link within 24 hours.
            </p>
            <RegisterForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

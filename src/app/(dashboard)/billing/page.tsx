import { PageHeader } from "@/components/shared/page-header"
import { getBillingPageData } from "./actions"
import { CurrentPlanCard } from "./current-plan-card"
import { UsageCard } from "./usage-card"
import { PlanSelectorCard } from "./plan-selector-card"
import { CreditPacksCard } from "./credit-packs-card"
import { InvoiceHistoryCard } from "./invoice-history-card"
import { BillingHelpPanel } from "./billing-help-panel"

export default async function BillingPage() {
  const { billing, creditTransactions, invoices } = await getBillingPageData()

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Billing"
        description="Manage your subscription, usage, and payments."
      >
        <BillingHelpPanel />
      </PageHeader>

      <CurrentPlanCard billing={billing} />
      <UsageCard billing={billing} />
      <PlanSelectorCard billing={billing} />
      <CreditPacksCard billing={billing} transactions={creditTransactions} />
      <InvoiceHistoryCard invoices={invoices} />
    </div>
  )
}

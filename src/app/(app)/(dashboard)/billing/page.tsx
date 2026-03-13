import { PageHeader } from "@/components/shared/page-header"
import { getBillingPageData } from "./actions"
import { CurrentPlanCard } from "./current-plan-card"
import { UsageCard } from "./usage-card"
import { PlanSelectorCard } from "./plan-selector-card"
import { CreditPacksCard } from "./credit-packs-card"
import { InvoiceHistoryCard } from "./invoice-history-card"
import { BillingHelpPanel } from "./billing-help-panel"
import { PaymentCallbackHandler } from "./payment-callback-handler"
import { EftBankDetailsCard } from "./eft-bank-details-card"
import { PrepaidBalanceCard } from "./prepaid-balance-card"

export default async function BillingPage() {
  const {
    billing,
    paystackPublicKey,
    paymentMethod,
    accountBalanceCents,
    creditTransactions,
    invoices,
    accountTransactions,
  } = await getBillingPageData()

  const paystackEnabled = !!paystackPublicKey
  const isPaystack = paymentMethod === "PAYSTACK"
  const isEft = paymentMethod === "EFT"
  const isInvoice = paymentMethod === "INVOICE"
  const isPrepaid = paymentMethod === "PREPAID"

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Billing"
        description="Manage your subscription, usage, and payments."
      >
        <BillingHelpPanel />
      </PageHeader>

      {isPaystack && <PaymentCallbackHandler />}

      <CurrentPlanCard billing={billing} paymentMethod={paymentMethod} />
      <UsageCard billing={billing} />

      {/* EFT/Invoice: show bank details + invoices prominently */}
      {(isEft || isInvoice) && <EftBankDetailsCard />}

      {/* Prepaid: show account balance */}
      {isPrepaid && (
        <PrepaidBalanceCard
          balanceCents={accountBalanceCents}
          transactions={accountTransactions}
        />
      )}

      {/* Paystack: show plan selector and credit packs */}
      {isPaystack && (
        <>
          <PlanSelectorCard billing={billing} paystackEnabled={paystackEnabled} />
          <CreditPacksCard billing={billing} paystackEnabled={paystackEnabled} transactions={creditTransactions} />
        </>
      )}

      {/* Non-Paystack: still show credit packs (but they may need to contact admin) */}
      {!isPaystack && (
        <CreditPacksCard billing={billing} paystackEnabled={false} transactions={creditTransactions} />
      )}

      <InvoiceHistoryCard invoices={invoices} />
    </div>
  )
}

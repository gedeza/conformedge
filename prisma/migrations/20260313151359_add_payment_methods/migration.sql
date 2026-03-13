-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAYSTACK', 'EFT', 'INVOICE', 'PREPAID');

-- CreateEnum
CREATE TYPE "AccountTransactionType" AS ENUM ('FUND', 'DEDUCT', 'REFUND', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "bank_reference" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'PAYSTACK',
ADD COLUMN     "payment_terms_days" INTEGER;

-- CreateTable
CREATE TABLE "account_balances" (
    "id" TEXT NOT NULL,
    "balance_cents" INTEGER NOT NULL DEFAULT 0,
    "lifetime_funded_cents" INTEGER NOT NULL DEFAULT 0,
    "lifetime_deducted_cents" INTEGER NOT NULL DEFAULT 0,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_transactions" (
    "id" TEXT NOT NULL,
    "type" "AccountTransactionType" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "balance_after_cents" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "invoice_id" TEXT,
    "performed_by_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_organization_id_key" ON "account_balances"("organization_id");

-- CreateIndex
CREATE INDEX "idx_account_tx_org_created" ON "account_transactions"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_subscription_payment_method" ON "subscriptions"("payment_method");

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_tx_balance_fkey" FOREIGN KEY ("organization_id") REFERENCES "account_balances"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

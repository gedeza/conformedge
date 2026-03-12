-- CreateTable
CREATE TABLE "partner_invoices" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "platform_fee_cents" INTEGER NOT NULL,
    "client_fees_cents" INTEGER NOT NULL,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "subtotal_cents" INTEGER NOT NULL,
    "vat_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "line_items" JSONB NOT NULL,
    "external_payment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_invoices_invoice_number_key" ON "partner_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "idx_partner_invoice_partner" ON "partner_invoices"("partner_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_partner_invoice_status" ON "partner_invoices"("status");

-- AddForeignKey
ALTER TABLE "partner_invoices" ADD CONSTRAINT "partner_invoices_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

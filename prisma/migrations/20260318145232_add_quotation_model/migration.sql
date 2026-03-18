-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'INVOICED');

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "invoice_number" TEXT,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "client_name" TEXT NOT NULL,
    "client_company" TEXT,
    "client_email" TEXT,
    "client_phone" TEXT,
    "client_address" TEXT,
    "client_vat_number" TEXT,
    "client_reg_number" TEXT,
    "subtotal_cents" INTEGER NOT NULL,
    "vat_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "deposit_percent" INTEGER,
    "deposit_cents" INTEGER,
    "line_items" JSONB NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "invoiced_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "bank_reference" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_number_key" ON "quotations"("quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_invoice_number_key" ON "quotations"("invoice_number");

-- CreateIndex
CREATE INDEX "idx_quotation_status" ON "quotations"("status");

-- CreateIndex
CREATE INDEX "idx_quotation_created_by" ON "quotations"("created_by_id");

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

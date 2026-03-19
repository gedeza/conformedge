-- AlterTable
ALTER TABLE "subcontractors" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_person" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "liability_expiry" TIMESTAMP(3),
ADD COLUMN     "physical_address" TEXT,
ADD COLUMN     "tax_clearance_expiry" TIMESTAMP(3),
ADD COLUMN     "trade_types" JSONB;

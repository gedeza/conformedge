-- AlterTable
ALTER TABLE "audit_packs" ADD COLUMN     "audit_date_from" TIMESTAMP(3),
ADD COLUMN     "audit_date_to" TIMESTAMP(3),
ADD COLUMN     "audit_type" TEXT,
ADD COLUMN     "lead_auditor_id" TEXT,
ADD COLUMN     "scope" TEXT;

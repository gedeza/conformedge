-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "bank_account_holder" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_account_type" TEXT,
ADD COLUMN     "bank_branch_code" TEXT,
ADD COLUMN     "bank_name" TEXT;

-- AlterTable
ALTER TABLE "vendor_certifications" RENAME CONSTRAINT "subcontractor_certifications_pkey" TO "vendor_certifications_pkey";

-- AlterTable
ALTER TABLE "vendors" RENAME CONSTRAINT "subcontractors_pkey" TO "vendors_pkey";

-- RenameForeignKey
ALTER TABLE "vendor_certifications" RENAME CONSTRAINT "subcontractor_certifications_subcontractor_id_fkey" TO "vendor_certifications_vendor_id_fkey";

-- RenameForeignKey
ALTER TABLE "vendors" RENAME CONSTRAINT "subcontractors_organization_id_fkey" TO "vendors_organization_id_fkey";

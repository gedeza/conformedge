-- Rename SubcontractorTier enum to VendorTier
ALTER TYPE "SubcontractorTier" RENAME TO "VendorTier";

-- Rename tables
ALTER TABLE "subcontractors" RENAME TO "vendors";
ALTER TABLE "subcontractor_certifications" RENAME TO "vendor_certifications";

-- Rename columns
ALTER TABLE "vendor_certifications" RENAME COLUMN "subcontractor_id" TO "vendor_id";

-- Rename indexes
ALTER INDEX "idx_cert_subcontractor_expires" RENAME TO "idx_cert_vendor_expires";

-- CreateEnum
CREATE TYPE "StandardType" AS ENUM ('MANAGEMENT_SYSTEM', 'STATUTORY', 'PROFESSIONAL_BODY');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('STANDALONE', 'CORPORATE', 'DIVISION', 'SITE');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'NOT_APPLICABLE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'OBLIGATION_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'VENDOR_COMPLIANCE_ALERT';

-- AlterTable
ALTER TABLE "objectives" ADD COLUMN     "monitoring_point_id" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "organization_type" "OrganizationType" NOT NULL DEFAULT 'STANDALONE',
ADD COLUMN     "parent_organization_id" TEXT;

-- AlterTable
ALTER TABLE "standards" ADD COLUMN     "standard_type" "StandardType" NOT NULL DEFAULT 'MANAGEMENT_SYSTEM';

-- CreateTable
CREATE TABLE "clause_regulatory_metadata" (
    "id" TEXT NOT NULL,
    "standard_clause_id" TEXT NOT NULL,
    "reporting_deadline_hours" INTEGER,
    "reporting_authority" TEXT,
    "penalty_description" TEXT,
    "compliance_frequency" TEXT,
    "form_reference" TEXT,
    "is_reportable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clause_regulatory_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_obligations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "obligation_type" TEXT NOT NULL,
    "standard_clause_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "project_id" TEXT,
    "responsible_user_id" TEXT,
    "status" "ObligationStatus" NOT NULL DEFAULT 'PENDING',
    "effective_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "renewal_lead_days" INTEGER DEFAULT 30,
    "document_id" TEXT,
    "metadata" JSONB,
    "last_reviewed_at" TIMESTAMP(3),
    "last_reviewed_by_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "point_type" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "standard_clause_id" TEXT,
    "obligation_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clause_regulatory_metadata_standard_clause_id_key" ON "clause_regulatory_metadata"("standard_clause_id");

-- CreateIndex
CREATE INDEX "idx_obligation_org_status" ON "compliance_obligations"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_obligation_org_expiry" ON "compliance_obligations"("organization_id", "expiry_date");

-- CreateIndex
CREATE INDEX "idx_obligation_vendor" ON "compliance_obligations"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_obligation_type" ON "compliance_obligations"("obligation_type");

-- CreateIndex
CREATE INDEX "idx_monitoring_org_type" ON "monitoring_points"("organization_id", "point_type");

-- CreateIndex
CREATE INDEX "idx_org_parent" ON "organizations"("parent_organization_id");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_monitoring_point_id_fkey" FOREIGN KEY ("monitoring_point_id") REFERENCES "monitoring_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_regulatory_metadata" ADD CONSTRAINT "clause_regulatory_metadata_standard_clause_id_fkey" FOREIGN KEY ("standard_clause_id") REFERENCES "standard_clauses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_standard_clause_id_fkey" FOREIGN KEY ("standard_clause_id") REFERENCES "standard_clauses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_last_reviewed_by_id_fkey" FOREIGN KEY ("last_reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_points" ADD CONSTRAINT "monitoring_points_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_points" ADD CONSTRAINT "monitoring_points_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_points" ADD CONSTRAINT "monitoring_points_standard_clause_id_fkey" FOREIGN KEY ("standard_clause_id") REFERENCES "standard_clauses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_points" ADD CONSTRAINT "monitoring_points_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "compliance_obligations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

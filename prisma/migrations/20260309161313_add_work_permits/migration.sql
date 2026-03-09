-- CreateEnum
CREATE TYPE "WorkPermitType" AS ENUM ('HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHTS', 'ELECTRICAL', 'EXCAVATION', 'LIFTING', 'GENERAL');

-- CreateEnum
CREATE TYPE "WorkPermitStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ExtensionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PERMIT_EXPIRING';

-- CreateTable
CREATE TABLE "work_permits" (
    "id" TEXT NOT NULL,
    "permit_number" TEXT,
    "permit_type" "WorkPermitType" NOT NULL,
    "status" "WorkPermitStatus" NOT NULL DEFAULT 'DRAFT',
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hazards_identified" TEXT,
    "precautions" TEXT,
    "ppe_requirements" TEXT,
    "emergency_procedures" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closure_notes" TEXT,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "issued_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permit_checklists" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "permit_id" TEXT NOT NULL,
    "checked_by_id" TEXT,
    "checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_permit_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permit_extensions" (
    "id" TEXT NOT NULL,
    "permit_id" TEXT NOT NULL,
    "original_valid_to" TIMESTAMP(3) NOT NULL,
    "new_valid_to" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ExtensionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_permit_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_permits_permit_number_key" ON "work_permits"("permit_number");

-- CreateIndex
CREATE INDEX "idx_permit_org_created" ON "work_permits"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_permit_org_status" ON "work_permits"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_permit_org_type" ON "work_permits"("organization_id", "permit_type");

-- CreateIndex
CREATE INDEX "idx_permit_org_valid_to" ON "work_permits"("organization_id", "valid_to");

-- CreateIndex
CREATE INDEX "idx_permit_project" ON "work_permits"("project_id");

-- CreateIndex
CREATE INDEX "idx_permit_checklist_order" ON "work_permit_checklists"("permit_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_permit_extension_permit" ON "work_permit_extensions"("permit_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_permit_extension_status" ON "work_permit_extensions"("status");

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_checklists" ADD CONSTRAINT "work_permit_checklists_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "work_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_checklists" ADD CONSTRAINT "work_permit_checklists_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_extensions" ADD CONSTRAINT "work_permit_extensions_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "work_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_extensions" ADD CONSTRAINT "work_permit_extensions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permit_extensions" ADD CONSTRAINT "work_permit_extensions_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

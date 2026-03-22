-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_REPAIR', 'DECOMMISSIONED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "CalibrationResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'COMPLETE', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepairPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CALIBRATION_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'CALIBRATION_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'EQUIPMENT_QUARANTINED';

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "asset_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "swl" TEXT,
    "ce_marking" BOOLEAN NOT NULL DEFAULT false,
    "purchase_date" TIMESTAMP(3),
    "commission_date" TIMESTAMP(3),
    "decommission_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "specifications" JSONB,
    "notes" TEXT,
    "next_calibration_due" TIMESTAMP(3),
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "calibration_date" TIMESTAMP(3) NOT NULL,
    "next_due_date" TIMESTAMP(3) NOT NULL,
    "certificate_number" TEXT,
    "certificate_file_key" TEXT,
    "certificate_file_name" TEXT,
    "calibrated_by" TEXT NOT NULL,
    "result" "CalibrationResult" NOT NULL,
    "deviation" TEXT,
    "notes" TEXT,
    "organization_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calibration_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performed_by" TEXT,
    "cost" DECIMAL(12,2),
    "notes" TEXT,
    "organization_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "repair_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_reference" TEXT,
    "priority" "RepairPriority" NOT NULL DEFAULT 'MEDIUM',
    "cost" DECIMAL(12,2),
    "parts_used" JSONB,
    "verification_date" TIMESTAMP(3),
    "verified_by" TEXT,
    "verification_notes" TEXT,
    "return_to_service_date" TIMESTAMP(3),
    "capa_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_equipment_org_status" ON "equipment"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_equipment_org_category" ON "equipment"("organization_id", "category");

-- CreateIndex
CREATE INDEX "idx_equipment_org_calibration_due" ON "equipment"("organization_id", "next_calibration_due");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_organization_id_asset_number_key" ON "equipment"("organization_id", "asset_number");

-- CreateIndex
CREATE INDEX "idx_calibration_equipment_due" ON "calibration_records"("equipment_id", "next_due_date");

-- CreateIndex
CREATE INDEX "idx_calibration_org_due" ON "calibration_records"("organization_id", "next_due_date");

-- CreateIndex
CREATE INDEX "idx_maintenance_equipment_date" ON "maintenance_records"("equipment_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_maintenance_org_status_date" ON "maintenance_records"("organization_id", "status", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_repair_equipment_date" ON "repair_records"("equipment_id", "repair_date");

-- CreateIndex
CREATE INDEX "idx_repair_org_created" ON "repair_records"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_records" ADD CONSTRAINT "calibration_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration_records" ADD CONSTRAINT "calibration_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_records" ADD CONSTRAINT "repair_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_records" ADD CONSTRAINT "repair_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_records" ADD CONSTRAINT "repair_records_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

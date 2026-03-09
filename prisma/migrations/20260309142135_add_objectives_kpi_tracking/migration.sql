-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MeasurementFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'OBJECTIVE_DUE';

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "target_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "measurement_frequency" "MeasurementFrequency" NOT NULL,
    "due_date" TIMESTAMP(3),
    "organization_id" TEXT NOT NULL,
    "standard_id" TEXT,
    "standard_clause_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective_measurements" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "objective_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "objective_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_objective_org_created" ON "objectives"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_objective_org_status" ON "objectives"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_objective_clause" ON "objectives"("standard_clause_id");

-- CreateIndex
CREATE INDEX "idx_measurement_obj_date" ON "objective_measurements"("objective_id", "measured_at" DESC);

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_standard_clause_id_fkey" FOREIGN KEY ("standard_clause_id") REFERENCES "standard_clauses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_measurements" ADD CONSTRAINT "objective_measurements_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_measurements" ADD CONSTRAINT "objective_measurements_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

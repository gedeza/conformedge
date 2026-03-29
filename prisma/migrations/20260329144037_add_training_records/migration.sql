-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PLANNED', 'COMPLETED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('INDUCTION', 'FIRST_AID', 'FIRE_FIGHTING', 'WORKING_AT_HEIGHTS', 'SCAFFOLDING', 'CRANE_OPERATOR', 'FORKLIFT_OPERATOR', 'CONFINED_SPACE', 'HAZARDOUS_CHEMICALS', 'ELECTRICAL', 'EXCAVATION', 'H_AND_S_REPRESENTATIVE', 'TOOLBOX_TALK', 'COMPETENCY', 'REFRESHER', 'OTHER');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TRAINING_EXPIRING';

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TrainingCategory" NOT NULL,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PLANNED',
    "description" TEXT,
    "training_date" TIMESTAMP(3) NOT NULL,
    "duration" TEXT,
    "location" TEXT,
    "trainer_name" TEXT,
    "trainer_accreditation" TEXT,
    "training_provider" TEXT,
    "provider_accreditation_no" TEXT,
    "certificate_number" TEXT,
    "certificate_file_key" TEXT,
    "certificate_file_name" TEXT,
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "assessment_result" TEXT,
    "saqa_unit_standard" TEXT,
    "nqf_level" INTEGER,
    "notes" TEXT,
    "trainee_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "site_id" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_training_org_trainee" ON "training_records"("organization_id", "trainee_id");

-- CreateIndex
CREATE INDEX "idx_training_org_category" ON "training_records"("organization_id", "category");

-- CreateIndex
CREATE INDEX "idx_training_org_expiry" ON "training_records"("organization_id", "expiry_date");

-- CreateIndex
CREATE INDEX "idx_training_org_status" ON "training_records"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

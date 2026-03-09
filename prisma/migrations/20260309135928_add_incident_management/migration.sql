-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'CORRECTIVE_ACTION', 'CLOSED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('NEAR_MISS', 'FIRST_AID', 'MEDICAL', 'LOST_TIME', 'FATALITY', 'ENVIRONMENTAL', 'PROPERTY_DAMAGE');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'INCIDENT_REPORTED';

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "incident_type" "IncidentType" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "severity" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "incident_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "injured_party" TEXT,
    "witnesses" TEXT,
    "immediate_action" TEXT,
    "root_cause" TEXT,
    "root_cause_data" JSONB,
    "investigation_due" TIMESTAMP(3),
    "closed_date" TIMESTAMP(3),
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "reported_by_id" TEXT NOT NULL,
    "investigator_id" TEXT,
    "capa_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_incident_org_created" ON "incidents"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_incident_org_status" ON "incidents"("organization_id", "status");

-- CreateIndex
CREATE INDEX "idx_incident_org_type" ON "incidents"("organization_id", "incident_type");

-- CreateIndex
CREATE INDEX "idx_incident_org_date" ON "incidents"("organization_id", "incident_date" DESC);

-- CreateIndex
CREATE INDEX "idx_incident_project" ON "incidents"("project_id");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_investigator_id_fkey" FOREIGN KEY ("investigator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "body_part_injured" TEXT,
ADD COLUMN     "contributing_factors" JSONB,
ADD COLUMN     "incident_time" TEXT,
ADD COLUMN     "is_reportable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lost_days" INTEGER,
ADD COLUMN     "mhsa_section" TEXT,
ADD COLUMN     "nature_of_injury" TEXT,
ADD COLUMN     "reporting_deadline" TIMESTAMP(3),
ADD COLUMN     "statutory_ref_number" TEXT,
ADD COLUMN     "statutory_reported_at" TIMESTAMP(3),
ADD COLUMN     "treatment_type" TEXT;

-- CreateTable
CREATE TABLE "incident_evidence" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "caption" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_witnesses" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_number" TEXT,
    "email" TEXT,
    "statement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_witnesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_incident_evidence_incident" ON "incident_evidence"("incident_id");

-- CreateIndex
CREATE INDEX "idx_incident_witness_incident" ON "incident_witnesses"("incident_id");

-- AddForeignKey
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_witnesses" ADD CONSTRAINT "incident_witnesses_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

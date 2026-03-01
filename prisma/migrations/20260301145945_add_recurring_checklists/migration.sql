-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'CUSTOM');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CHECKLIST_DUE';

-- AlterTable
ALTER TABLE "checklist_templates" ADD COLUMN     "custom_interval_days" INTEGER,
ADD COLUMN     "default_assignee_id" TEXT,
ADD COLUMN     "default_project_id" TEXT,
ADD COLUMN     "is_paused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_generated_at" TIMESTAMP(3),
ADD COLUMN     "next_due_date" TIMESTAMP(3),
ADD COLUMN     "recurrence_frequency" "RecurrenceFrequency";

-- AlterTable
ALTER TABLE "compliance_checklists" ADD COLUMN     "template_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_template_recurring" ON "checklist_templates"("is_recurring", "is_paused", "next_due_date");

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "checklist_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_default_assignee_id_fkey" FOREIGN KEY ("default_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_default_project_id_fkey" FOREIGN KEY ("default_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

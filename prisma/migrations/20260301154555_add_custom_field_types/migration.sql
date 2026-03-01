-- AlterTable
ALTER TABLE "checklist_items" ADD COLUMN     "field_config" JSONB,
ADD COLUMN     "field_type" TEXT,
ADD COLUMN     "response" JSONB;

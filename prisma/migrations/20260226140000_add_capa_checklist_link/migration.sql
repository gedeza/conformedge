-- AlterTable
ALTER TABLE "checklist_items" ADD COLUMN "capa_id" TEXT;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

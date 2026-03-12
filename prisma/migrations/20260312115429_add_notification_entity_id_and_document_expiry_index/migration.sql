-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "entity_id" TEXT;

-- CreateIndex
CREATE INDEX "idx_document_expires_at" ON "documents"("expires_at");

-- CreateIndex
CREATE INDEX "idx_notification_dedup" ON "notifications"("user_id", "type", "entity_id", "created_at");

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "investigation_sign_off_notes" TEXT,
ADD COLUMN     "investigation_signed_off_at" TIMESTAMP(3),
ADD COLUMN     "investigation_signed_off_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_investigation_signed_off_by_id_fkey" FOREIGN KEY ("investigation_signed_off_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

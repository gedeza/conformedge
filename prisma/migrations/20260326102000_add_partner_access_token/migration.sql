-- AlterTable
ALTER TABLE "partners" ADD COLUMN "access_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "partners_access_token_key" ON "partners"("access_token");

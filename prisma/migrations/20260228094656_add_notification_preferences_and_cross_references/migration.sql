-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "CrossReferenceType" AS ENUM ('EQUIVALENT', 'RELATED', 'SUPPORTING');

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clause_cross_references" (
    "id" TEXT NOT NULL,
    "source_clause_id" TEXT NOT NULL,
    "target_clause_id" TEXT NOT NULL,
    "mapping_type" "CrossReferenceType" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clause_cross_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_type_channel_key" ON "notification_preferences"("user_id", "type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "clause_cross_references_source_clause_id_target_clause_id_key" ON "clause_cross_references"("source_clause_id", "target_clause_id");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_cross_references" ADD CONSTRAINT "clause_cross_references_source_clause_id_fkey" FOREIGN KEY ("source_clause_id") REFERENCES "standard_clauses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_cross_references" ADD CONSTRAINT "clause_cross_references_target_clause_id_fkey" FOREIGN KEY ("target_clause_id") REFERENCES "standard_clauses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

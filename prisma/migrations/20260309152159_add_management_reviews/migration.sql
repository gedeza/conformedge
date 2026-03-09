-- CreateEnum
CREATE TYPE "ManagementReviewStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgendaItemType" AS ENUM ('AUDIT_RESULTS', 'CUSTOMER_FEEDBACK', 'PROCESS_PERFORMANCE', 'CAPA_STATUS', 'PREVIOUS_ACTIONS', 'CHANGES_CONTEXT', 'IMPROVEMENT_OPPORTUNITIES', 'RESOURCE_NEEDS', 'RISK_OPPORTUNITIES', 'OBJECTIVES_PERFORMANCE', 'INCIDENT_TRENDS', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MANAGEMENT_REVIEW_DUE';

-- CreateTable
CREATE TABLE "management_reviews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" "ManagementReviewStatus" NOT NULL DEFAULT 'PLANNED',
    "meeting_minutes" TEXT,
    "next_review_date" TIMESTAMP(3),
    "organization_id" TEXT NOT NULL,
    "facilitator_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_review_standards" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_review_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_review_attendees" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_review_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_review_agenda_items" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "type" "AgendaItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_review_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_review_actions" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReviewActionStatus" NOT NULL DEFAULT 'OPEN',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "assignee_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_review_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_mgmt_review_org_date" ON "management_reviews"("organization_id", "review_date" DESC);

-- CreateIndex
CREATE INDEX "idx_mgmt_review_org_status" ON "management_reviews"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "management_review_standards_review_id_standard_id_key" ON "management_review_standards"("review_id", "standard_id");

-- CreateIndex
CREATE UNIQUE INDEX "management_review_attendees_review_id_user_id_key" ON "management_review_attendees"("review_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_review_action_status" ON "management_review_actions"("review_id", "status");

-- AddForeignKey
ALTER TABLE "management_reviews" ADD CONSTRAINT "management_reviews_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_reviews" ADD CONSTRAINT "management_reviews_facilitator_id_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_reviews" ADD CONSTRAINT "management_reviews_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_standards" ADD CONSTRAINT "management_review_standards_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "management_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_standards" ADD CONSTRAINT "management_review_standards_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_attendees" ADD CONSTRAINT "management_review_attendees_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "management_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_attendees" ADD CONSTRAINT "management_review_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_agenda_items" ADD CONSTRAINT "management_review_agenda_items_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "management_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_actions" ADD CONSTRAINT "management_review_actions_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "management_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_review_actions" ADD CONSTRAINT "management_review_actions_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

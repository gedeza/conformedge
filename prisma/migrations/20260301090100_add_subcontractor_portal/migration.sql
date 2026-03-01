-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CERT_UPLOAD';

-- AlterEnum
ALTER TYPE "ShareLinkType" ADD VALUE 'SUBCONTRACTOR';

-- AlterTable
ALTER TABLE "subcontractor_certifications" ADD COLUMN "status" "CertificationStatus",
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "review_notes" TEXT;

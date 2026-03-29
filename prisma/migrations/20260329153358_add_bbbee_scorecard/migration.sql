-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "bee_black_ownership" DOUBLE PRECISION,
ADD COLUMN     "bee_cert_expiry" TIMESTAMP(3),
ADD COLUMN     "bee_entity_type" TEXT,
ADD COLUMN     "bee_score" DOUBLE PRECISION,
ADD COLUMN     "bee_scorecard" JSONB,
ADD COLUMN     "bee_verifier" TEXT;

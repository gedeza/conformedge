-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'CLICKED', 'SIGNED_UP', 'CONVERTED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "partners" ADD COLUMN     "accent_color" TEXT,
ADD COLUMN     "brand_name" TEXT,
ADD COLUMN     "logo_key" TEXT,
ADD COLUMN     "primary_color" TEXT;

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referred_org_id" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "referred_email" TEXT,
    "referred_company" TEXT,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "signed_up_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "commission_percent" DOUBLE PRECISION NOT NULL,
    "commission_cents" INTEGER,
    "commission_paid_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE INDEX "idx_referral_partner_status" ON "referrals"("partner_id", "status");

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_org_id_fkey" FOREIGN KEY ("referred_org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

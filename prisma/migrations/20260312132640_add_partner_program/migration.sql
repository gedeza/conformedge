-- CreateEnum
CREATE TYPE "PartnerTier" AS ENUM ('CONSULTING', 'WHITE_LABEL', 'REFERRAL');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('APPLIED', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PartnerRole" AS ENUM ('PARTNER_ADMIN', 'PARTNER_MANAGER', 'PARTNER_VIEWER');

-- CreateEnum
CREATE TYPE "PartnerClientSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" "PartnerTier" NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'APPLIED',
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "website" TEXT,
    "registration_number" TEXT,
    "description" TEXT,
    "base_platform_fee_cents" INTEGER NOT NULL,
    "default_small_fee_cents" INTEGER NOT NULL DEFAULT 129900,
    "default_medium_fee_cents" INTEGER NOT NULL DEFAULT 189900,
    "default_large_fee_cents" INTEGER NOT NULL DEFAULT 249900,
    "volume_discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission_percent" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "max_client_orgs" INTEGER,
    "approved_at" TIMESTAMP(3),
    "terminated_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_users" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "PartnerRole" NOT NULL DEFAULT 'PARTNER_MANAGER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_organizations" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_size" "PartnerClientSize" NOT NULL DEFAULT 'SMALL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "custom_fee_cents" INTEGER,
    "onboarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnected_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

-- CreateIndex
CREATE INDEX "idx_partner_status" ON "partners"("status");

-- CreateIndex
CREATE INDEX "idx_partner_tier" ON "partners"("tier");

-- CreateIndex
CREATE INDEX "idx_partner_user_user" ON "partner_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_users_partner_id_user_id_key" ON "partner_users"("partner_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_partner_org_org" ON "partner_organizations"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_organizations_partner_id_organization_id_key" ON "partner_organizations"("partner_id", "organization_id");

-- AddForeignKey
ALTER TABLE "partner_users" ADD CONSTRAINT "partner_users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_users" ADD CONSTRAINT "partner_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_organizations" ADD CONSTRAINT "partner_organizations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_organizations" ADD CONSTRAINT "partner_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

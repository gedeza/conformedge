-- CreateEnum
CREATE TYPE "ShareLinkType" AS ENUM ('DOCUMENT', 'AUDIT_PACK', 'PORTAL');

-- CreateEnum
CREATE TYPE "ShareLinkStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "type" "ShareLinkType" NOT NULL,
    "status" "ShareLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "label" TEXT NOT NULL,
    "recipient_email" TEXT,
    "recipient_name" TEXT,
    "entity_id" TEXT,
    "portal_config" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "max_views" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "allow_download" BOOLEAN NOT NULL DEFAULT true,
    "last_accessed_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "organization_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_link_access_logs" (
    "id" TEXT NOT NULL,
    "share_link_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_link_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_hash_key" ON "share_links"("token_hash");

-- CreateIndex
CREATE INDEX "idx_share_link_token" ON "share_links"("token_hash");

-- CreateIndex
CREATE INDEX "idx_share_link_org_created" ON "share_links"("organization_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_share_link_expires" ON "share_links"("expires_at");

-- CreateIndex
CREATE INDEX "idx_share_link_access_link_created" ON "share_link_access_logs"("share_link_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_link_access_logs" ADD CONSTRAINT "share_link_access_logs_share_link_id_fkey" FOREIGN KEY ("share_link_id") REFERENCES "share_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

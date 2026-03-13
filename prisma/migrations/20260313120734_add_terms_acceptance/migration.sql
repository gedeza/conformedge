-- CreateEnum
CREATE TYPE "TermsVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "terms_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "status" "TermsVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "effective_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_acceptances" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "terms_versions_version_key" ON "terms_versions"("version");

-- CreateIndex
CREATE INDEX "idx_terms_version_status" ON "terms_versions"("status");

-- CreateIndex
CREATE INDEX "idx_terms_acceptance_user" ON "terms_acceptances"("user_id", "accepted_at" DESC);

-- CreateIndex
CREATE INDEX "idx_terms_acceptance_version" ON "terms_acceptances"("version_id");

-- CreateIndex
CREATE UNIQUE INDEX "terms_acceptances_user_id_version_id_key" ON "terms_acceptances"("user_id", "version_id");

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "terms_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

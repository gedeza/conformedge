-- CreateTable
CREATE TABLE "organization_standards" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_standards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_standards_organization_id_standard_id_key" ON "organization_standards"("organization_id", "standard_id");

-- AddForeignKey
ALTER TABLE "organization_standards" ADD CONSTRAINT "organization_standards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_standards" ADD CONSTRAINT "organization_standards_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

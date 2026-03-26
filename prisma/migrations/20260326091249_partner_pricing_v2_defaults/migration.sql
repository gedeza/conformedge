-- AlterTable
ALTER TABLE "partners" ALTER COLUMN "default_small_fee_cents" SET DEFAULT 149900,
ALTER COLUMN "default_medium_fee_cents" SET DEFAULT 199900,
ALTER COLUMN "default_large_fee_cents" SET DEFAULT 299900,
ALTER COLUMN "commission_percent" SET DEFAULT 10;

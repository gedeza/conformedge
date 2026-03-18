-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "discount_cents" INTEGER,
ADD COLUMN     "discount_label" TEXT,
ADD COLUMN     "discount_percent" INTEGER;

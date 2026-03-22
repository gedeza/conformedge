-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "hospital_clinic" TEXT,
ADD COLUMN     "treating_doctor" TEXT,
ADD COLUMN     "victim_date_of_birth" TIMESTAMP(3);

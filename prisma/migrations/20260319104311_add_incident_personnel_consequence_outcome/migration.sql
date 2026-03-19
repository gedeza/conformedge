-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "estimated_cost" DECIMAL(12,2),
ADD COLUMN     "immediate_supervisor" TEXT,
ADD COLUMN     "impact_areas" JSONB,
ADD COLUMN     "non_injurious_type" TEXT,
ADD COLUMN     "returned_to_work" BOOLEAN,
ADD COLUMN     "returned_to_work_date" TIMESTAMP(3),
ADD COLUMN     "spill_volume" DECIMAL(10,2),
ADD COLUMN     "victim_contractor" TEXT,
ADD COLUMN     "victim_department" TEXT,
ADD COLUMN     "victim_id_number" TEXT,
ADD COLUMN     "victim_nationality" TEXT,
ADD COLUMN     "victim_occupation" TEXT,
ADD COLUMN     "victim_staff_no" TEXT;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "kdv_rate" DECIMAL(5,2) NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "public"."quotation_items" ADD COLUMN     "kdv_rate" DECIMAL(5,2) NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "public"."quotations" ADD COLUMN     "call_status" TEXT DEFAULT 'takip et',
ADD COLUMN     "total_discount" DECIMAL(5,2) DEFAULT 0;

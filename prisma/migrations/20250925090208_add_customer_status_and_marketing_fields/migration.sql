-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('YENI_POTANSIYEL', 'ARANDI', 'DEMO_BEKLIYOR', 'DEMO_VERILDI', 'TEKLIF_BEKLIYOR', 'TEKLIF_VERILDI', 'ZIYARET_BEKLIYOR', 'MUSTERI_OLDU', 'KAYIP', 'PASIF');

-- AlterTable
ALTER TABLE "public"."customers" ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "last_contact" TIMESTAMP(3),
ADD COLUMN     "next_contact" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" "public"."CustomerStatus" NOT NULL DEFAULT 'YENI_POTANSIYEL';

-- CreateTable
CREATE TABLE "public"."customer_activities" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "result" TEXT,
    "next_action" TEXT,
    "customer_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."customer_activities" ADD CONSTRAINT "customer_activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

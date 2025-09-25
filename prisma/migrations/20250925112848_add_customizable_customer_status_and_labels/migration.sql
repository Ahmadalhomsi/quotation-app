/*
  Warnings:

  - You are about to drop the column `assigned_to` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."customers" DROP COLUMN "assigned_to",
DROP COLUMN "status",
ADD COLUMN     "status_id" TEXT;

-- DropEnum
DROP TYPE "public"."CustomerStatus";

-- CreateTable
CREATE TABLE "public"."customer_status_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_status_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_label_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_label_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_labels" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_status_types_name_key" ON "public"."customer_status_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_label_types_name_key" ON "public"."customer_label_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_labels_customer_id_label_id_key" ON "public"."customer_labels"("customer_id", "label_id");

-- AddForeignKey
ALTER TABLE "public"."customer_labels" ADD CONSTRAINT "customer_labels_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_labels" ADD CONSTRAINT "customer_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "public"."customer_label_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."customer_status_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

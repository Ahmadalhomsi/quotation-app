/*
  Warnings:

  - You are about to drop the column `status_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the `customer_label_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_labels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_status_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."customer_labels" DROP CONSTRAINT "customer_labels_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."customer_labels" DROP CONSTRAINT "customer_labels_label_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."customers" DROP CONSTRAINT "customers_status_id_fkey";

-- AlterTable
ALTER TABLE "public"."customers" DROP COLUMN "status_id";

-- DropTable
DROP TABLE "public"."customer_label_types";

-- DropTable
DROP TABLE "public"."customer_labels";

-- DropTable
DROP TABLE "public"."customer_status_types";

-- CreateTable
CREATE TABLE "public"."customer_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_customer_types" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_customer_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_types_name_key" ON "public"."customer_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_customer_types_customer_id_type_id_key" ON "public"."customer_customer_types"("customer_id", "type_id");

-- AddForeignKey
ALTER TABLE "public"."customer_customer_types" ADD CONSTRAINT "customer_customer_types_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_customer_types" ADD CONSTRAINT "customer_customer_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."customer_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

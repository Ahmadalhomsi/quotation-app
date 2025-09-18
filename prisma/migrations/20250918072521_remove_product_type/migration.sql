/*
  Warnings:

  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `product_type` on the `quotation_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "public"."quotation_items" DROP COLUMN "product_type";

-- DropEnum
DROP TYPE "public"."ProductType";

-- AlterTable
-- Ürün ödeme tipi: tek seferlik (varsayılan) veya yıllık ödeme
ALTER TABLE "public"."products" ADD COLUMN     "is_yearly_payment" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
-- Teklif kalemi snapshot'ı: kalem eklendiği andaki ürünün ödeme tipi
ALTER TABLE "public"."quotation_items" ADD COLUMN     "is_yearly_payment" BOOLEAN NOT NULL DEFAULT false;

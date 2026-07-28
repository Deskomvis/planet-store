-- AlterTable
ALTER TABLE "StoreSettings" DROP COLUMN "whatsappNumber";
ALTER TABLE "StoreSettings" DROP COLUMN "whatsappMessageTemplate";
ALTER TABLE "StoreSettings" ADD COLUMN "googleMapsEmbed" TEXT;

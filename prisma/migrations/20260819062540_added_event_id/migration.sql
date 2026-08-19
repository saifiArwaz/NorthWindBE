-- DropForeignKey
ALTER TABLE "EventGalleries" DROP CONSTRAINT "EventGalleries_categoryId_fkey";

-- AlterTable
ALTER TABLE "EventGalleries" ADD COLUMN     "eventId" TEXT,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventGalleries" ADD CONSTRAINT "EventGalleries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGalleries" ADD CONSTRAINT "EventGalleries_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

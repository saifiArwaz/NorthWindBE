/*
  Warnings:

  - Made the column `eventId` on table `EventCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryId` on table `EventGalleries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `EventGalleries` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "EventGalleries" DROP CONSTRAINT "EventGalleries_categoryId_fkey";

-- AlterTable
ALTER TABLE "EventCategory" ALTER COLUMN "eventId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventGalleries" ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "EventGalleries" ADD CONSTRAINT "EventGalleries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

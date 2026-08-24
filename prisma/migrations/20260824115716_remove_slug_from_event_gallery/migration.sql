/*
  Warnings:

  - You are about to drop the column `slug` on the `EventGalleries` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EventGalleries_slug_key";

-- AlterTable
ALTER TABLE "EventGalleries" DROP COLUMN "slug";

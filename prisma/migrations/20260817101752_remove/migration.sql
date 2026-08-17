/*
  Warnings:

  - You are about to drop the column `isFeature` on the `EventGalleries` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `EventGalleries` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `EventGalleries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventGalleries" DROP COLUMN "isFeature",
DROP COLUMN "link",
DROP COLUMN "title";

/*
  Warnings:

  - You are about to drop the column `isFeature` on the `ConstructionGalleries` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `ConstructionGalleries` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `ConstructionUpdate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConstructionGalleries" DROP COLUMN "isFeature",
DROP COLUMN "subtitle";

-- AlterTable
ALTER TABLE "ConstructionUpdate" DROP COLUMN "coverImage",
ADD COLUMN     "files" JSONB;

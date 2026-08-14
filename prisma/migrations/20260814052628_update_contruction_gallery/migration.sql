/*
  Warnings:

  - You are about to drop the column `constructionUpdateId` on the `ConstructionGalleries` table. All the data in the column will be lost.
  - You are about to drop the `ConstructionUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConstructionGalleries" DROP CONSTRAINT "ConstructionGalleries_constructionUpdateId_fkey";

-- DropForeignKey
ALTER TABLE "ConstructionUpdate" DROP CONSTRAINT "ConstructionUpdate_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ConstructionUpdate" DROP CONSTRAINT "ConstructionUpdate_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ConstructionUpdate" DROP CONSTRAINT "ConstructionUpdate_towerId_fkey";

-- DropForeignKey
ALTER TABLE "ConstructionUpdate" DROP CONSTRAINT "ConstructionUpdate_updatedBy_fkey";

-- AlterTable
ALTER TABLE "ConstructionGalleries" DROP COLUMN "constructionUpdateId",
ADD COLUMN     "dateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFeature" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProjectFloorPlan" ADD COLUMN     "towerId" TEXT;

-- AlterTable
ALTER TABLE "ProjectTower" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "files" JSONB,
ADD COLUMN     "list" JSONB,
ADD COLUMN     "watermark" TEXT;

-- DropTable
DROP TABLE "ConstructionUpdate";

-- AddForeignKey
ALTER TABLE "ProjectFloorPlan" ADD CONSTRAINT "ProjectFloorPlan_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "ProjectTower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

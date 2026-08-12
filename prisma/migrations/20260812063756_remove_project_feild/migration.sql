/*
  Warnings:

  - You are about to drop the column `countryId` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `isLuxuryLocation` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `isNewLaunch` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `localityId` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectRera" DROP CONSTRAINT "ProjectRera_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_localityId_fkey";

-- DropForeignKey
ALTER TABLE "projectEnquiry" DROP CONSTRAINT "projectEnquiry_projectId_fkey";

-- DropIndex
DROP INDEX "Projects_projectName_slug_cityId_typologyId_price_idx";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "countryId",
DROP COLUMN "isLuxuryLocation",
DROP COLUMN "isNewLaunch",
DROP COLUMN "localityId",
DROP COLUMN "price",
DROP COLUMN "tags",
ADD COLUMN     "isHome" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Projects_projectName_slug_cityId_typologyId_idx" ON "Projects"("projectName", "slug", "cityId", "typologyId");

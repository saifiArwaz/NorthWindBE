/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ProjectTower` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `ProjectTower` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `ProjectTower` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProjectTower" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTower_slug_key" ON "ProjectTower"("slug");

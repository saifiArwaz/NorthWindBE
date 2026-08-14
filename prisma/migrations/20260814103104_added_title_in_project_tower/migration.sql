/*
  Warnings:

  - You are about to drop the column `name` on the `ProjectTower` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectTower" DROP COLUMN "name",
ADD COLUMN     "description" JSONB,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "title" JSONB;

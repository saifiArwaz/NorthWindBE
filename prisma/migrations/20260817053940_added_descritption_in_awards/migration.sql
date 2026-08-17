/*
  Warnings:

  - You are about to drop the column `organization` on the `Awards` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Awards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Awards" DROP COLUMN "organization",
DROP COLUMN "shortDescription",
ADD COLUMN     "description" TEXT;

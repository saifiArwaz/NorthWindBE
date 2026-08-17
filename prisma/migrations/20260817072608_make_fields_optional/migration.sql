/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the `PartnerCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Partner" DROP CONSTRAINT "Partner_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerCategories" DROP CONSTRAINT "PartnerCategories_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PartnerCategories" DROP CONSTRAINT "PartnerCategories_updatedBy_fkey";

-- AlterTable
ALTER TABLE "HomeLoan" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "categoryId",
ALTER COLUMN "title" DROP NOT NULL;

-- DropTable
DROP TABLE "PartnerCategories";

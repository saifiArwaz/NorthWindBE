/*
  Warnings:

  - You are about to drop the column `inverstorTabId` on the `InvestorDocuments` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `InvestorDocuments` table. All the data in the column will be lost.
  - You are about to drop the column `list` on the `InvestorDocuments` table. All the data in the column will be lost.
  - You are about to drop the column `sub_title` on the `InvestorDocuments` table. All the data in the column will be lost.
  - The `type` column on the `InvestorDocuments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InvestorDocumentType" AS ENUM ('new_release', 'annual', 'quarterly');

-- DropForeignKey
ALTER TABLE "InvestorDocuments" DROP CONSTRAINT "InvestorDocuments_inverstorTabId_fkey";

-- AlterTable
ALTER TABLE "InvestorDocuments" DROP COLUMN "inverstorTabId",
DROP COLUMN "label",
DROP COLUMN "list",
DROP COLUMN "sub_title",
ADD COLUMN     "dateAt" TIMESTAMP(3),
DROP COLUMN "type",
ADD COLUMN     "type" "InvestorDocumentType";

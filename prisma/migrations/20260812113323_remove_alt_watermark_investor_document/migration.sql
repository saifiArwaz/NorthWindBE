/*
  Warnings:

  - You are about to drop the column `alt` on the `InvestorDocuments` table. All the data in the column will be lost.
  - You are about to drop the column `watermark` on the `InvestorDocuments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InvestorDocuments" DROP COLUMN "alt",
DROP COLUMN "watermark";

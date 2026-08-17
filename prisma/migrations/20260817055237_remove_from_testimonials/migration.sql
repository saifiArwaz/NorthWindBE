/*
  Warnings:

  - You are about to drop the column `companyName` on the `Testimonials` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `Testimonials` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Testimonials` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Testimonials` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Testimonials" DROP COLUMN "companyName",
DROP COLUMN "designation",
DROP COLUMN "location",
DROP COLUMN "type";

/*
  Warnings:

  - You are about to drop the column `designation` on the `Jobs` table. All the data in the column will be lost.
  - You are about to drop the column `qualifications` on the `Jobs` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Jobs" DROP COLUMN "designation",
DROP COLUMN "qualifications",
DROP COLUMN "skills";

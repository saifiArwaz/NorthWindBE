/*
  Warnings:

  - You are about to drop the column `message` on the `jobApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobApplication" DROP COLUMN "message",
ADD COLUMN     "location" TEXT;

/*
  Warnings:

  - You are about to drop the column `coverImage` on the `EventCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventCategory" DROP COLUMN "coverImage",
ADD COLUMN     "files" JSONB;

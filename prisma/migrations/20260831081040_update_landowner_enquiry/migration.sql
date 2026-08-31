/*
  Warnings:

  - You are about to drop the column `createdAt` on the `LandOwnerConnect` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `LandOwnerConnect` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `LandOwnerConnect` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LandOwnerConnect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LandOwnerConnect" DROP COLUMN "createdAt",
DROP COLUMN "isDeleted",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "dateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

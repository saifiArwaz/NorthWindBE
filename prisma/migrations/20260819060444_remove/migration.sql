/*
  Warnings:

  - You are about to drop the column `parentGalleryId` on the `EventGalleries` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('album', 'gallery');

-- DropForeignKey
ALTER TABLE "EventGalleries" DROP CONSTRAINT "EventGalleries_parentGalleryId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'gallery';

-- AlterTable
ALTER TABLE "EventGalleries" DROP COLUMN "parentGalleryId";

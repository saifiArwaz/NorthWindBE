/*
  Warnings:

  - You are about to drop the column `alt` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `isSection` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `City` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_countryId_fkey";

-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "CitySections" DROP CONSTRAINT "CitySections_cityId_fkey";

-- DropForeignKey
ALTER TABLE "Locality" DROP CONSTRAINT "Locality_cityId_fkey";

-- AlterTable
ALTER TABLE "City" DROP COLUMN "alt",
DROP COLUMN "countryId",
DROP COLUMN "files",
DROP COLUMN "isSection",
DROP COLUMN "shortDescription",
DROP COLUMN "stateId",
DROP COLUMN "title",
DROP COLUMN "type";

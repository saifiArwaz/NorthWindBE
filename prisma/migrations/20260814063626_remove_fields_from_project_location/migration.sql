/*
  Warnings:

  - You are about to drop the column `alt` on the `ProjectLocationAdvantage` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `ProjectLocationAdvantage` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `ProjectLocationAdvantage` table. All the data in the column will be lost.
  - You are about to drop the column `watermark` on the `ProjectLocationAdvantage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectLocationAdvantage" DROP COLUMN "alt",
DROP COLUMN "destination",
DROP COLUMN "files",
DROP COLUMN "watermark",
ADD COLUMN     "durationUnit" TEXT NOT NULL DEFAULT 'min';

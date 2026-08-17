/*
  Warnings:

  - The values [press_release,announcements] on the enum `PressType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dateAt` on the `MediaCoverage` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PressType_new" AS ENUM ('online', 'offline');
ALTER TABLE "public"."MediaCoverage" ALTER COLUMN "mediaType" DROP DEFAULT;
ALTER TABLE "MediaCoverage" ALTER COLUMN "mediaType" TYPE "PressType_new" USING ("mediaType"::text::"PressType_new");
ALTER TYPE "PressType" RENAME TO "PressType_old";
ALTER TYPE "PressType_new" RENAME TO "PressType";
DROP TYPE "public"."PressType_old";
ALTER TABLE "MediaCoverage" ALTER COLUMN "mediaType" SET DEFAULT 'offline';
COMMIT;

-- AlterTable
ALTER TABLE "MediaCoverage" DROP COLUMN "dateAt";

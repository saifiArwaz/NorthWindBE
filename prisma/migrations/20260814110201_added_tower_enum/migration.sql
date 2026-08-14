/*
  Warnings:

  - The values [comingSoon] on the enum `ProjectSectionTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectSectionTypes_new" AS ENUM ('overview', 'gallery', 'highlights', 'amenities', 'construction', 'floorPlan', 'locationadvantage', 'tower');
ALTER TABLE "ProjectSection" ALTER COLUMN "type" TYPE "ProjectSectionTypes_new" USING ("type"::text::"ProjectSectionTypes_new");
ALTER TYPE "ProjectSectionTypes" RENAME TO "ProjectSectionTypes_old";
ALTER TYPE "ProjectSectionTypes_new" RENAME TO "ProjectSectionTypes";
DROP TYPE "public"."ProjectSectionTypes_old";
COMMIT;

/*
  Warnings:

  - The values [unitplan] on the enum `ProjectFloorPlanTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectFloorPlanTypes_new" AS ENUM ('floorplan', 'masterplan');
ALTER TABLE "ProjectFloorPlan" ALTER COLUMN "type" TYPE "ProjectFloorPlanTypes_new" USING ("type"::text::"ProjectFloorPlanTypes_new");
ALTER TYPE "ProjectFloorPlanTypes" RENAME TO "ProjectFloorPlanTypes_old";
ALTER TYPE "ProjectFloorPlanTypes_new" RENAME TO "ProjectFloorPlanTypes";
DROP TYPE "public"."ProjectFloorPlanTypes_old";
COMMIT;

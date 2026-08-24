/*
  Warnings:

  - You are about to drop the column `AgencyName` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `campaignCode` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `utmcampaign` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `utmcontent` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `utmmedium` on the `projectEnquiry` table. All the data in the column will be lost.
  - You are about to drop the column `utmsource` on the `projectEnquiry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projectEnquiry" DROP COLUMN "AgencyName",
DROP COLUMN "campaignCode",
DROP COLUMN "remarks",
DROP COLUMN "utmcampaign",
DROP COLUMN "utmcontent",
DROP COLUMN "utmmedium",
DROP COLUMN "utmsource";

-- AddForeignKey
ALTER TABLE "projectEnquiry" ADD CONSTRAINT "projectEnquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

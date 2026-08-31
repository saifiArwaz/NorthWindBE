/*
  Warnings:

  - You are about to drop the `LandOwnerConnect` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LandOwnerConnect";

-- CreateTable
CREATE TABLE "landOwnerConnect" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "landLocation" TEXT NOT NULL,
    "landArea" TEXT NOT NULL,
    "landType" TEXT NOT NULL,
    "ownershipStatus" TEXT NOT NULL,
    "additionalDetails" TEXT,
    "pageUrl" TEXT,
    "dateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landOwnerConnect_pkey" PRIMARY KEY ("id")
);

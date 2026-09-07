-- CreateTable
CREATE TABLE "LandOwnerConnect" (
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
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandOwnerConnect_pkey" PRIMARY KEY ("id")
);

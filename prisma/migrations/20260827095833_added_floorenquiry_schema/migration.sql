-- CreateTable
CREATE TABLE "floorplanTowerEnquiry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "fullName" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL,
    "message" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "dateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floorplanTowerEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "floorplanTowerEnquiry" ADD CONSTRAINT "floorplanTowerEnquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "mobileNo" TEXT,
ALTER COLUMN "emailAddress" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "MediaKitType" AS ENUM ('light', 'dark');

-- AlterTable
ALTER TABLE "MediaKit" ADD COLUMN     "type" "MediaKitType" NOT NULL DEFAULT 'light';

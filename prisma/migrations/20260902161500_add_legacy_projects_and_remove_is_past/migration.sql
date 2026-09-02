-- CreateEnum
CREATE TYPE "LegacyProjectCategory" AS ENUM ('legacyProject', 'ongoingProject', 'oldProject');

-- CreateTable
CREATE TABLE "LegacyProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "LegacyProjectCategory" NOT NULL DEFAULT 'legacyProject',
    "location" TEXT,
    "description" JSONB,
    "files" JSONB,
    "alt" TEXT,
    "watermark" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LegacyProject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LegacyProject" ADD CONSTRAINT "LegacyProject_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegacyProject" ADD CONSTRAINT "LegacyProject_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

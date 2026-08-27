-- AlterEnum
ALTER TYPE "ProjectSectionTypes" ADD VALUE 'faq';

-- AlterTable
ALTER TABLE "ProjectStatus" ADD COLUMN     "seq" INTEGER NOT NULL DEFAULT 0;

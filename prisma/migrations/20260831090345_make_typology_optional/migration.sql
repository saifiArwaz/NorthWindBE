-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_typologyId_fkey";

-- AlterTable
ALTER TABLE "Projects" ALTER COLUMN "typologyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_typologyId_fkey" FOREIGN KEY ("typologyId") REFERENCES "Typology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "HomeLoanAssistance" (
    "id" TEXT NOT NULL,
    "files" JSONB,
    "title" TEXT NOT NULL,
    "alt" TEXT,
    "watermark" TEXT,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HomeLoanAssistance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HomeLoanAssistance" ADD CONSTRAINT "HomeLoanAssistance_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeLoanAssistance" ADD CONSTRAINT "HomeLoanAssistance_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

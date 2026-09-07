-- CreateTable
CREATE TABLE "ProjectFaq" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "link" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectFaq_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectFaq" ADD CONSTRAINT "ProjectFaq_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFaq" ADD CONSTRAINT "ProjectFaq_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFaq" ADD CONSTRAINT "ProjectFaq_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

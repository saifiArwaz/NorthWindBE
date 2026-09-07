-- CreateTable
CREATE TABLE "CsrCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CsrCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsrGallery" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "categoryId" TEXT,
    "files" JSONB,
    "link" TEXT,
    "alt" TEXT,
    "watermark" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "seq" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CsrGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CsrCategory_slug_key" ON "CsrCategory"("slug");

-- AddForeignKey
ALTER TABLE "CsrCategory" ADD CONSTRAINT "CsrCategory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsrCategory" ADD CONSTRAINT "CsrCategory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsrGallery" ADD CONSTRAINT "CsrGallery_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CsrCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsrGallery" ADD CONSTRAINT "CsrGallery_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsrGallery" ADD CONSTRAINT "CsrGallery_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

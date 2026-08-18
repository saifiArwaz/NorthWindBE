ALTER TABLE "EventCategory" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "EventCategory_slug_key" ON "EventCategory"("slug");

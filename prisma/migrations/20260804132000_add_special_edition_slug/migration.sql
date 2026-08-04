ALTER TABLE "SpecialEditionPage" ADD COLUMN "slug" TEXT;
UPDATE "SpecialEditionPage" SET "slug" = 'original' WHERE "slug" IS NULL;
CREATE UNIQUE INDEX "SpecialEditionPage_slug_key" ON "SpecialEditionPage"("slug");

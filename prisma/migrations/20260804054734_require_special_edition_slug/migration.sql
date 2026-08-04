/*
  Warnings:

  - Made the column `slug` on table `SpecialEditionPage` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecialEditionPage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'special-edition',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "description" TEXT,
    "heroImageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "contentJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SpecialEditionPage" ("contentJson", "description", "eyebrow", "heroImageUrl", "id", "published", "slug", "title", "updatedAt") SELECT "contentJson", "description", "eyebrow", "heroImageUrl", "id", "published", "slug", "title", "updatedAt" FROM "SpecialEditionPage";
DROP TABLE "SpecialEditionPage";
ALTER TABLE "new_SpecialEditionPage" RENAME TO "SpecialEditionPage";
CREATE UNIQUE INDEX "SpecialEditionPage_slug_key" ON "SpecialEditionPage"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

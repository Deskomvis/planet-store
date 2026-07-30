-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AdminUser" ("createdAt", "email", "id", "name", "passwordHash") SELECT "createdAt", "email", "id", "name", "passwordHash" FROM "AdminUser";
DROP TABLE "AdminUser";
ALTER TABLE "new_AdminUser" RENAME TO "AdminUser";
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

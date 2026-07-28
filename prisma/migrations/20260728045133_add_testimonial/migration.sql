-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "description" TEXT,
    "format" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Testimonial_format_idx" ON "Testimonial"("format");

-- CreateIndex
CREATE INDEX "Testimonial_sortOrder_idx" ON "Testimonial"("sortOrder");

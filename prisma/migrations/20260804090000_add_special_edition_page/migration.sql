CREATE TABLE "SpecialEditionPage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'special-edition',
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "description" TEXT,
    "heroImageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "contentJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "SpecialEditionPage" ("id", "title", "eyebrow", "description", "published", "contentJson", "updatedAt")
VALUES (
  'special-edition',
  'Special Edition',
  'LIMITED RELEASE / 2026',
  'Koleksi pilihan untuk mereka yang mencari sesuatu yang tidak biasa.',
  true,
  '[{"id":"story","type":"editorial","enabled":true,"eyebrow":"THE STORY","title":"Dibuat berbeda. Dirilis terbatas.","body":"Sebuah koleksi yang merayakan material, karakter, dan detail yang tidak ditemukan pada rilisan reguler.","imageUrl":"","linkLabel":"","linkUrl":"","items":[],"align":"left"},{"id":"details","type":"features","enabled":true,"eyebrow":"SIGNATURE DETAILS","title":"Lebih dari sekadar edisi baru","body":"Setiap elemen dipilih untuk memberi pengalaman yang lebih personal.","imageUrl":"","linkLabel":"","linkUrl":"","items":["Material pilihan","Produksi dalam jumlah terbatas","Detail eksklusif"],"align":"left"},{"id":"closing","type":"cta","enabled":true,"eyebrow":"AVAILABLE NOW","title":"Miliki sebelum koleksi berakhir.","body":"Ketersediaan dapat berubah tanpa pemberitahuan.","imageUrl":"","linkLabel":"Jelajahi koleksi","linkUrl":"/","items":[],"align":"left"}]',
  CURRENT_TIMESTAMP
);

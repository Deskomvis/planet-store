import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_NAMES = [
  "POLYESTER 24s ( PE )",
  "KOKO DEWASA",
  "MUKENA ANAK",
  "GAMIS ANAK",
  "STELAN KOKO ANAK",
  "HOODIE APL ANAK",
  "Ori Kombinasi ( special 28s )",
  "HOODIE DWS DTF BASIC",
  "HOODIE APL DEWASA",
  "DASTER",
  "CELANA BROADSHORT & CARGO",
  "ATASAN CEWE Rajut full jarum & Rajut jarum 2 x 1",
  "PIAMA ANAK",
  "Kaos Pocket Anak 24s",
  "Kaos Anak Kemerdekaan ( DTF )",
  "Kaos Dewasa Kemerdekaan ( DTF )",
  "TAS RAJUT & SELEMPANG RAJUT",
  "POLOSHIRT PENDEK BASIC",
  "ATASAN RAJUT SPESIAL",
  "KAOS DISTRO ORIGINAL 28S",
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@planetstore.id";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin Planet Store",
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: "settings" },
    update: {},
    create: { id: "settings", whatsappNumber: "6281234567890" },
  });

  // Reset to the requested initial category collection (also removes demo products).
  await prisma.category.deleteMany({
    where: { slug: { notIn: CATEGORY_NAMES.map(slugify) } },
  });

  for (const [index, name] of CATEGORY_NAMES.entries()) {
    const slug = slugify(name);
    const sortOrder = index * 10;

    await prisma.category.upsert({
      where: { slug },
      update: { name, sortOrder },
      create: { name, slug, sortOrder },
    });
  }

  console.log(`Seed selesai. Login admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.error("Usage: npm run db:reset-admin-password -- <email> <new-password>");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("Password minimal 6 karakter");
    process.exit(1);
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    console.error(`Admin dengan email ${email} tidak ditemukan`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({ where: { email }, data: { passwordHash } });

  console.log(`Password untuk ${email} berhasil direset.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

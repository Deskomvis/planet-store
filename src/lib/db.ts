import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// TURSO_DATABASE_URL is used in production; local dev falls back to the
// sqlite file directly (cwd-relative), independent of Prisma CLI's
// schema-relative DATABASE_URL used for `prisma migrate`/`studio`.
const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

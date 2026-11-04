import "dotenv/config";
import { createClient } from "@libsql/client";

// Use the same database as the application, including Turso on Vercel.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  const transaction = await client.transaction("write");
  try {
    const { rows } = await transaction.execute('PRAGMA table_info("Product")');
    if (rows.length === 0) throw new Error("Product table is missing; initialize the database before building.");
    const columns = new Set(rows.map((row) => row.name));
    for (const name of ["price", "originalPrice"]) {
      if (!columns.has(name)) {
        await transaction.execute(`ALTER TABLE "Product" ADD COLUMN "${name}" INTEGER`);
        console.log(`Added Product.${name}`);
      }
    }
    await transaction.commit();
  } finally {
    transaction.close();
  }
} finally {
  client.close();
}

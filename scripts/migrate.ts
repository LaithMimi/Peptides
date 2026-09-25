// Applies drizzle/ migrations to the database in DATABASE_URL (Neon).
// Local development does not need this: the embedded database migrates itself.
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set; nothing to migrate.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });
  await migrate(drizzle(pool), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

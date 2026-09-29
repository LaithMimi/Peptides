// Seeds the launch data (idempotent) into the database in DATABASE_URL.
// Not for production catalogs: real brands, products and prices are managed
// in the admin dashboard. See lib/db/seed.ts.
import { getDb } from "../lib/db/client";
import { seedDatabase } from "../lib/db/seed";

async function main() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PRODUCTION_SEED) {
    console.error("Refusing to seed in production. Set ALLOW_PRODUCTION_SEED=1 to override.");
    process.exit(1);
  }
  await seedDatabase(await getDb());
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

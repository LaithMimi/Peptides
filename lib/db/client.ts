import path from "node:path";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Database access. `DATABASE_URL` set -> Neon Postgres (production, previews).
 * Unset and not production -> an embedded PGlite database is created, migrated
 * and seeded on first use so local dev and tests need no external service.
 * Production without `DATABASE_URL` fails closed.
 */
export type Db = NeonDatabase<typeof schema>;
export { schema };

const globalForDb = globalThis as unknown as { __pepDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  globalForDb.__pepDb ??= createDb().catch((error) => {
    // Do not cache a failed connection; the next call retries.
    globalForDb.__pepDb = undefined;
    throw error;
  });
  return globalForDb.__pepDb;
}

/** Test hook: replace the process-wide database (see tests/unit/helpers/test-db.ts). */
export function __setDbForTests(db: Db | undefined): void {
  globalForDb.__pepDb = db ? Promise.resolve(db) : undefined;
}

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Node 22+ provides the global WebSocket the pooled driver needs.
    const { Pool } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");
    return drizzle(new Pool({ connectionString: url }), { schema });
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production");
  }
  return createEmbeddedDb();
}

/** Embedded Postgres for development and tests. Never used in production. */
export async function createEmbeddedDb(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(dataDir ?? process.env.PGLITE_DIR ?? ".pglite");
  const db = drizzle(client, { schema });
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  const typed = db as unknown as Db;
  const { seedDatabase } = await import("./seed");
  await seedDatabase(typed);
  if (process.env.E2E_SEED_ADMIN === "1") {
    const { seedE2eAdmin } = await import("./e2e-seed");
    await seedE2eAdmin(typed);
  }
  return typed;
}

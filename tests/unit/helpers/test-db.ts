import { __setDbForTests, createEmbeddedDb, type Db } from "@/lib/db/client";

/**
 * A fresh in-memory Postgres (PGlite) with migrations and the launch seed,
 * installed as the process-wide database for the calling test file.
 * Usage: `beforeAll(async () => { db = await useTestDb(); })`.
 */
export async function useTestDb(): Promise<Db> {
  const db = await createEmbeddedDb("memory://");
  __setDbForTests(db);
  return db;
}

export function resetTestDb(): void {
  __setDbForTests(undefined);
}

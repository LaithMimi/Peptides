import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { storeSettings, type StoreSettings } from "../schema";

/** The single settings row; created with defaults if it does not exist yet. */
export async function getSettings(): Promise<StoreSettings> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, 1));
  if (row) return row;
  await db.insert(storeSettings).values({ id: 1 }).onConflictDoNothing();
  const [created] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, 1));
  return created;
}

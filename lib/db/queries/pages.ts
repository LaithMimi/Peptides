import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { pages, type Page } from "../schema";

export async function getPage(slug: string): Promise<Page | null> {
  const db = await getDb();
  const [row] = await db.select().from(pages).where(eq(pages.slug, slug));
  return row ?? null;
}

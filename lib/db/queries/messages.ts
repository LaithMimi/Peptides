import { desc } from "drizzle-orm";
import { getDb } from "../client";
import { inboundMessages, type InboundMessage } from "../schema";

type NewMessage = typeof inboundMessages.$inferInsert;

/** Stores a customer message so it shows up in the admin Messages inbox. */
export async function saveInboundMessage(message: NewMessage): Promise<void> {
  const db = await getDb();
  await db.insert(inboundMessages).values(message);
}

export async function listInboundMessages(): Promise<InboundMessage[]> {
  const db = await getDb();
  return db.select().from(inboundMessages).orderBy(desc(inboundMessages.createdAt)).limit(200);
}

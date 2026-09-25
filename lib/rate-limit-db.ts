import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { rateLimits } from "@/lib/db/schema";

// Database-backed fixed-window counter. Unlike an in-memory map it holds across
// serverless instances (Constitution VI).

export interface LimitOptions {
  max: number;
  windowMs: number;
}

function envInt(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const limits = {
  orderPerIp: (): LimitOptions => ({
    max: envInt("ORDER_LIMIT_PER_IP", 5),
    windowMs: 10 * 60 * 1000,
  }),
  loginPerIp: (): LimitOptions => ({
    max: envInt("LOGIN_LIMIT_PER_IP", 10),
    windowMs: 15 * 60 * 1000,
  }),
};

/**
 * Records one hit for `key` and returns true if the request is allowed, false
 * once the key is over its limit in the current window. Old windows are
 * removed opportunistically.
 */
export async function checkLimit(
  key: string,
  { max, windowMs }: LimitOptions,
  now: number = Date.now()
): Promise<boolean> {
  const db = await getDb();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  // Cleanup roughly 1 in 20 calls; keeps the table small without a cron job.
  if (Math.random() < 0.05) {
    await db
      .delete(rateLimits)
      .where(
        and(
          eq(rateLimits.key, key),
          lt(rateLimits.windowStart, new Date(now - windowMs * 2))
        )
      );
  }

  return row.count <= max;
}

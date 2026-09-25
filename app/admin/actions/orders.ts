"use server";

import { eq } from "drizzle-orm";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { orderItems, orders, storeSettings } from "@/lib/db/schema";
import { canTransition, isOrderStatus, type OrderStatus } from "@/lib/order-status";
import { sendOrderEmail } from "@/lib/order-email";
import { isUuid, type ActionState } from "./shared";

/** Moves an order to a later status or cancels it (see lib/order-status.ts). */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id) || !isOrderStatus(status)) return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id));
    if (!order) return { ok: false, code: "NOT_FOUND" };
    if (!canTransition(order.status, status)) return { ok: false, code: "INVALID_TRANSITION" };
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return { ok: true, id };
  });
}

/** Sends the new-order email again (for orders whose notification failed). */
export async function resendOrderEmail(id: string): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id)) return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return { ok: false, code: "NOT_FOUND" };
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.id, 1));

    const result = await sendOrderEmail(order, items, settings?.email ?? null);
    await db
      .update(orders)
      .set(
        result.ok
          ? { notificationStatus: "sent", notificationError: null }
          : { notificationStatus: "failed", notificationError: result.error }
      )
      .where(eq(orders.id, id));
    return result.ok ? { ok: true, id } : { ok: false, code: "EMAIL_FAILED" };
  });
}

import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { orderItems, orders, type Order, type OrderItem } from "../schema";
import type { OrderStatus } from "@/lib/order-status";

// Admin-only order queries. Call behind an admin check.

export const ORDERS_PAGE_SIZE = 50;

export async function listOrders(
  status: OrderStatus | undefined,
  page = 1
): Promise<{ orders: Order[]; total: number; page: number; pageSize: number }> {
  const db = await getDb();
  const where = status ? eq(orders.status, status) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
  const safePage = Math.max(1, Math.floor(page));
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(ORDERS_PAGE_SIZE)
    .offset((safePage - 1) * ORDERS_PAGE_SIZE);
  return { orders: rows, total, page: safePage, pageSize: ORDERS_PAGE_SIZE };
}

export async function getOrderDetail(
  id: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(and(eq(orders.id, id)));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { order, items };
}

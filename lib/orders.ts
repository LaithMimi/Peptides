import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, type Db } from "@/lib/db/client";
import {
  orderItems,
  orders,
  storeSettings,
  type Order,
  type OrderItem,
} from "@/lib/db/schema";
import { checkLimit, limits } from "@/lib/rate-limit-db";
import {
  computeTotals,
  deliveryFeeIfAny,
  resolveCart,
  type PricedCart,
} from "@/lib/pricing";
import { sendOrderEmail } from "@/lib/order-email";
import {
  fieldErrorsFrom,
  placeOrderSchema,
  type PlaceOrderInput,
} from "@/lib/schemas/order";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; accessToken: string }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "EMPTY_CART"
        | "ITEM_UNPRICED"
        | "ITEM_UNAVAILABLE"
        | "PRICE_CHANGED"
        | "RATE_LIMITED"
        | "SERVER_ERROR";
      fieldErrors?: Record<string, string>;
      /** Product ids behind ITEM_UNPRICED / ITEM_UNAVAILABLE. */
      productIds?: string[];
      /** Fresh server pricing, returned with PRICE_CHANGED so the client can show it. */
      cart?: PricedCart;
    };

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } } | null)?.code
    ?? (error as { cause?: { code?: string } } | null)?.cause?.code;
  return code === "23505";
}

async function findByIdempotencyKey(db: Db, key: string) {
  const [existing] = await db.select().from(orders).where(eq(orders.idempotencyKey, key));
  return existing;
}

/**
 * Creates an order. Prices, subtotal, delivery fee and total are all computed
 * here from the database and settings; nothing price-related from the browser
 * is trusted (`expectedTotalMinor` only detects a price change). The order and
 * its snapshot items are written in one transaction; the notification email is
 * sent afterwards and its outcome recorded, so a failed email never loses the
 * order.
 */
export async function placeOrder(
  rawInput: PlaceOrderInput,
  context: { ip: string }
): Promise<PlaceOrderResult> {
  try {
    const db = await getDb();

    if (!(await checkLimit(`order:ip:${hashIp(context.ip)}`, limits.orderPerIp()))) {
      return { ok: false, code: "RATE_LIMITED" };
    }

    const parsed = placeOrderSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors = fieldErrorsFrom(parsed.error);
      return {
        ok: false,
        code: fieldErrors.items === "emptyCart" ? "EMPTY_CART" : "VALIDATION",
        fieldErrors,
      };
    }
    const input = parsed.data;

    // Same key as an earlier submission: return that order, never a second one.
    const existing = await findByIdempotencyKey(db, input.idempotencyKey);
    if (existing) {
      return { ok: true, orderNumber: existing.orderNumber, accessToken: existing.accessToken };
    }

    let created: { order: Order; items: OrderItem[]; storeEmail: string | null };
    try {
      created = await db.transaction(async (tx) => {
        const txDb = tx as unknown as Db;
        const [settings] = await txDb.select().from(storeSettings).where(eq(storeSettings.id, 1));
        if (!settings) throw new Error("settings missing");

        if (input.items.some((i) => i.quantity > settings.maxLineQuantity)) {
          throw new OrderRejected({
            ok: false,
            code: "VALIDATION",
            fieldErrors: { items: "quantityTooHigh" },
          });
        }

        const lines = await resolveCart(txDb, input.items, settings, input.locale);
        const unavailable = lines.filter((l) => l.status === "unavailable").map((l) => l.productId);
        if (unavailable.length > 0) {
          throw new OrderRejected({ ok: false, code: "ITEM_UNAVAILABLE", productIds: unavailable });
        }
        const unpriced = lines.filter((l) => l.status === "unpriced").map((l) => l.productId);
        if (unpriced.length > 0) {
          throw new OrderRejected({ ok: false, code: "ITEM_UNPRICED", productIds: unpriced });
        }

        const totals = computeTotals(lines, settings);
        if (
          input.expectedTotalMinor !== undefined &&
          input.expectedTotalMinor !== totals.totalMinor
        ) {
          throw new OrderRejected({
            ok: false,
            code: "PRICE_CHANGED",
            cart: {
              lines,
              ...totals,
              canCheckout: true,
              maxLineQuantity: settings.maxLineQuantity,
              deliveryFeeIfAny: deliveryFeeIfAny(settings),
            },
          });
        }

        const [order] = await txDb
          .insert(orders)
          .values({
            idempotencyKey: input.idempotencyKey,
            accessToken: randomBytes(24).toString("base64url"),
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            deliveryAddress: input.deliveryAddress,
            notes: input.notes,
            subtotalMinor: totals.subtotalMinor,
            deliveryFeeMinor: totals.deliveryFeeMinor,
            totalMinor: totals.totalMinor,
            paymentMethod: "cod",
            status: "new",
            acknowledgedAt: new Date(),
            locale: input.locale,
          })
          .returning();

        const items = await txDb
          .insert(orderItems)
          .values(
            lines.map((l) => ({
              orderId: order.id,
              productId: l.productId,
              productNameSnapshot: l.name,
              brandNameSnapshot: l.brand,
              vialSizeSnapshot: l.vialSize,
              unitPriceMinor: l.unitPriceMinor as number,
              quantity: l.quantity,
              lineTotalMinor: l.lineTotalMinor as number,
            }))
          )
          .returning();

        return { order, items, storeEmail: settings.email };
      });
    } catch (error) {
      if (error instanceof OrderRejected) return error.result;
      if (isUniqueViolation(error)) {
        // Lost a race with a concurrent submit of the same key.
        const raced = await findByIdempotencyKey(db, input.idempotencyKey);
        if (raced) {
          return { ok: true, orderNumber: raced.orderNumber, accessToken: raced.accessToken };
        }
      }
      throw error;
    }

    // Email after commit; record the outcome, never fail the order because of it.
    const email = await sendOrderEmail(created.order, created.items, created.storeEmail);
    await db
      .update(orders)
      .set(
        email.ok
          ? { notificationStatus: "sent", notificationError: null }
          : { notificationStatus: "failed", notificationError: email.error }
      )
      .where(eq(orders.id, created.order.id));

    return {
      ok: true,
      orderNumber: created.order.orderNumber,
      accessToken: created.order.accessToken,
    };
  } catch (error) {
    console.error("placeOrder failed", error);
    return { ok: false, code: "SERVER_ERROR" };
  }
}

class OrderRejected extends Error {
  constructor(readonly result: Extract<PlaceOrderResult, { ok: false }>) {
    super(result.code);
  }
}

export interface ConfirmationData {
  order: Order;
  items: OrderItem[];
}

/** The order for the confirmation page, only when the secret token matches. */
export async function getOrderForConfirmation(
  orderNumber: string,
  token: string | undefined
): Promise<ConfirmationData | null> {
  if (!token) return null;
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!order) return null;

  const a = Buffer.from(order.accessToken);
  const b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

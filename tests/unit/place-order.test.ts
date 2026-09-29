// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { orderItems, orders, products, storeSettings } from "@/lib/db/schema";

const sendOrderEmail = vi.fn();
vi.mock("@/lib/order-email", () => ({
  sendOrderEmail: (...args: unknown[]) => sendOrderEmail(...args),
}));

import { getOrderForConfirmation, placeOrder } from "@/lib/orders";

let db: Db;
let ids: Record<string, string>;
let ipCounter = 0;
const ctx = () => ({ ip: `10.0.0.${++ipCounter}` });

function input(overrides: Record<string, unknown> = {}) {
  return {
    idempotencyKey: crypto.randomUUID(),
    customerName: "Sara Khalil",
    customerPhone: "050-123-4567",
    deliveryAddress: "12 Main Street, Jerusalem",
    notes: null,
    acknowledged: true as const,
    locale: "en" as const,
    items: [{ productId: ids["tb-500"], quantity: 2 }],
    ...overrides,
  };
}

beforeEach(async () => {
  sendOrderEmail.mockReset();
  sendOrderEmail.mockResolvedValue({ ok: true });
  db = await useTestDb();
  const rows = await db.select().from(products);
  ids = Object.fromEntries(rows.map((r) => [r.slug, r.id]));
  await db.update(products).set({ priceMinor: 10000 }).where(eq(products.slug, "tb-500"));
  await db.update(products).set({ priceMinor: 25050 }).where(eq(products.slug, "bpc-157"));
});
afterEach(() => resetTestDb());

describe("placeOrder", () => {
  it("creates an order with server-computed totals and snapshot items", async () => {
    const result = await placeOrder(
      input({ items: [{ productId: ids["tb-500"], quantity: 2 }, { productId: ids["bpc-157"], quantity: 1 }] }),
      ctx()
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.orderNumber).toMatch(/^PC-\d+$/);

    const [order] = await db.select().from(orders);
    expect(order.status).toBe("new");
    expect(order.paymentMethod).toBe("cod");
    expect(order.subtotalMinor).toBe(45050);
    expect(order.deliveryFeeMinor).toBe(0);
    expect(order.totalMinor).toBe(45050);
    expect(order.customerPhone).toBe("+972501234567");
    expect(order.acknowledgedAt).toBeInstanceOf(Date);

    const items = await db.select().from(orderItems);
    expect(items).toHaveLength(2);
    const tb = items.find((i) => i.productNameSnapshot === "TB-500")!;
    expect(tb.unitPriceMinor).toBe(10000);
    expect(tb.lineTotalMinor).toBe(20000);
    expect(tb.brandNameSnapshot).toBe("PEP Lab");
  });

  it("ignores any client-supplied prices or totals", async () => {
    const result = await placeOrder(
      input({
        items: [{ productId: ids["tb-500"], quantity: 1, unitPriceMinor: 1, priceMinor: 1 }],
        totalMinor: 1,
        subtotalMinor: 1,
      }),
      ctx()
    );
    expect(result.ok).toBe(true);
    const [order] = await db.select().from(orders);
    expect(order.totalMinor).toBe(10000);
  });

  it("uses the delivery fee from settings", async () => {
    await db.update(storeSettings).set({ deliveryFeeMinor: 3000 }).where(eq(storeSettings.id, 1));
    await placeOrder(input(), ctx());
    const [order] = await db.select().from(orders);
    expect(order.deliveryFeeMinor).toBe(3000);
    expect(order.totalMinor).toBe(23000);
  });

  it("requires the 18+/research-use acknowledgment", async () => {
    const result = await placeOrder(input({ acknowledged: false }), ctx());
    expect(result).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { acknowledged: "ackRequired" } });
    expect(await db.select().from(orders)).toHaveLength(0);
  });

  it("reports field errors for invalid details", async () => {
    const result = await placeOrder(input({ customerName: "", customerPhone: "123", deliveryAddress: "x" }), ctx());
    expect(result).toMatchObject({
      ok: false,
      code: "VALIDATION",
      fieldErrors: { customerName: "required", customerPhone: "invalidPhone", deliveryAddress: "tooShort" },
    });
  });

  it("rejects an empty cart", async () => {
    const result = await placeOrder(input({ items: [] }), ctx());
    expect(result).toMatchObject({ ok: false, code: "EMPTY_CART" });
  });

  it("blocks unpriced products", async () => {
    const result = await placeOrder(
      input({ items: [{ productId: ids["tb-500"], quantity: 1 }, { productId: ids["semax"], quantity: 1 }] }),
      ctx()
    );
    expect(result).toMatchObject({ ok: false, code: "ITEM_UNPRICED", productIds: [ids["semax"]] });
    expect(await db.select().from(orders)).toHaveLength(0);
  });

  it("blocks unpublished products", async () => {
    await db.update(products).set({ status: "unpublished" }).where(eq(products.slug, "tb-500"));
    const result = await placeOrder(input(), ctx());
    expect(result).toMatchObject({ ok: false, code: "ITEM_UNAVAILABLE", productIds: [ids["tb-500"]] });
  });

  it("rejects quantities above the store maximum", async () => {
    const result = await placeOrder(input({ items: [{ productId: ids["tb-500"], quantity: 11 }] }), ctx());
    expect(result).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { items: "quantityTooHigh" } });
  });

  it("returns PRICE_CHANGED with fresh pricing when the expected total is stale", async () => {
    const result = await placeOrder(input({ expectedTotalMinor: 15000 }), ctx());
    expect(result.ok).toBe(false);
    if (result.ok || result.code !== "PRICE_CHANGED") throw new Error("expected PRICE_CHANGED");
    expect(result.cart?.totalMinor).toBe(20000);
    expect(await db.select().from(orders)).toHaveLength(0);

    const again = await placeOrder(input({ expectedTotalMinor: 20000 }), ctx());
    expect(again.ok).toBe(true);
  });

  it("is idempotent: the same key returns the same order and creates no duplicate", async () => {
    const key = crypto.randomUUID();
    const first = await placeOrder(input({ idempotencyKey: key }), ctx());
    const second = await placeOrder(input({ idempotencyKey: key }), ctx());
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.orderNumber).toBe(first.orderNumber);
      expect(second.accessToken).toBe(first.accessToken);
    }
    expect(await db.select().from(orders)).toHaveLength(1);
    expect(sendOrderEmail).toHaveBeenCalledTimes(1);
  });

  it("rate limits repeated submissions from one IP", async () => {
    const fixed = { ip: "203.0.113.9" };
    let last;
    for (let i = 0; i < 6; i++) last = await placeOrder(input(), fixed);
    expect(last).toMatchObject({ ok: false, code: "RATE_LIMITED" });
    expect((await db.select().from(orders)).length).toBe(5);
  });

  it("keeps the order and records the failure when the email fails", async () => {
    sendOrderEmail.mockResolvedValue({ ok: false, error: "provider_error" });
    const result = await placeOrder(input(), ctx());
    expect(result.ok).toBe(true);
    const [order] = await db.select().from(orders);
    expect(order.notificationStatus).toBe("failed");
    expect(order.notificationError).toBe("provider_error");
  });

  it("records a sent notification", async () => {
    await placeOrder(input(), ctx());
    const [order] = await db.select().from(orders);
    expect(order.notificationStatus).toBe("sent");
  });
});

describe("getOrderForConfirmation", () => {
  it("returns the order only with the matching secret token", async () => {
    const result = await placeOrder(input(), ctx());
    if (!result.ok) throw new Error("order failed");
    expect(await getOrderForConfirmation(result.orderNumber, undefined)).toBeNull();
    expect(await getOrderForConfirmation(result.orderNumber, "wrong-token")).toBeNull();
    const found = await getOrderForConfirmation(result.orderNumber, result.accessToken);
    expect(found?.order.orderNumber).toBe(result.orderNumber);
    expect(found?.items).toHaveLength(1);
    expect(await getOrderForConfirmation("PC-000000", result.accessToken)).toBeNull();
  });
});

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { brands, products, storeSettings } from "@/lib/db/schema";
import { clampQuantity, computeTotals, priceCart } from "@/lib/pricing";

let db: Db;
let ids: Record<string, string>;

beforeEach(async () => {
  db = await useTestDb();
  const rows = await db.select().from(products);
  ids = Object.fromEntries(rows.map((r) => [r.slug, r.id]));
  await db.update(products).set({ priceMinor: 10000 }).where(eq(products.slug, "tb-500"));
  await db.update(products).set({ priceMinor: 25050 }).where(eq(products.slug, "bpc-157"));
});
afterEach(() => resetTestDb());

describe("priceCart", () => {
  it("prices lines and totals from the database only", async () => {
    const cart = await priceCart(
      [
        { productId: ids["tb-500"], quantity: 2 },
        { productId: ids["bpc-157"], quantity: 1 },
      ],
      "en"
    );
    expect(cart.lines.map((l) => l.lineTotalMinor)).toEqual([20000, 25050]);
    expect(cart.subtotalMinor).toBe(45050);
    expect(cart.deliveryFeeMinor).toBe(0);
    expect(cart.totalMinor).toBe(45050);
    expect(cart.canCheckout).toBe(true);
  });

  it("flags unpriced lines, excludes them from totals and blocks checkout", async () => {
    const cart = await priceCart(
      [
        { productId: ids["tb-500"], quantity: 1 },
        { productId: ids["semax"], quantity: 3 },
      ],
      "en"
    );
    expect(cart.lines[1].status).toBe("unpriced");
    expect(cart.subtotalMinor).toBe(10000);
    expect(cart.canCheckout).toBe(false);
  });

  it("flags unpublished products and inactive brands as unavailable", async () => {
    await db.update(products).set({ status: "unpublished" }).where(eq(products.slug, "tb-500"));
    let cart = await priceCart([{ productId: ids["tb-500"], quantity: 1 }], "en");
    expect(cart.lines[0].status).toBe("unavailable");
    expect(cart.canCheckout).toBe(false);

    await db.update(products).set({ status: "published" }).where(eq(products.slug, "tb-500"));
    await db.update(brands).set({ isActive: false }).where(eq(brands.slug, "pep-lab"));
    cart = await priceCart([{ productId: ids["tb-500"], quantity: 1 }], "en");
    expect(cart.lines[0].status).toBe("unavailable");

    cart = await priceCart([{ productId: "00000000-0000-4000-8000-000000000000", quantity: 1 }], "en");
    expect(cart.lines[0].status).toBe("unavailable");
  });

  it("clamps quantity to the store maximum", async () => {
    const cart = await priceCart([{ productId: ids["tb-500"], quantity: 999 }], "en");
    expect(cart.lines[0].quantity).toBe(10);
    expect(cart.subtotalMinor).toBe(100000);
  });

  it("applies the delivery fee from settings and ignores it when delivery is disabled", async () => {
    await db.update(storeSettings).set({ deliveryFeeMinor: 2500 }).where(eq(storeSettings.id, 1));
    let cart = await priceCart([{ productId: ids["tb-500"], quantity: 1 }], "en");
    expect(cart.deliveryFeeMinor).toBe(2500);
    expect(cart.totalMinor).toBe(12500);

    await db.update(storeSettings).set({ deliveryEnabled: false }).where(eq(storeSettings.id, 1));
    cart = await priceCart([{ productId: ids["tb-500"], quantity: 1 }], "en");
    expect(cart.deliveryFeeMinor).toBe(0);
    expect(cart.totalMinor).toBe(10000);
  });

  it("returns names in the requested language with fallback", async () => {
    const cart = await priceCart([{ productId: ids["tb-500"], quantity: 1 }], "ar");
    expect(cart.lines[0].name).toBe("TB-500");
    expect(cart.lines[0].href).toBe("/products/pep-lab/tb-500");
  });

  it("an empty cart cannot check out and has no fee", async () => {
    const cart = await priceCart([], "en");
    expect(cart.canCheckout).toBe(false);
    expect(cart.totalMinor).toBe(0);
  });
});

describe("computeTotals / clampQuantity", () => {
  it("charges no fee on an empty subtotal", () => {
    expect(
      computeTotals([], { deliveryEnabled: true, deliveryFeeMinor: 3000 }).totalMinor
    ).toBe(0);
  });

  it("clamps to 1..max and tolerates junk", () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(5.9, 10)).toBe(5);
    expect(clampQuantity(50, 10)).toBe(10);
    expect(clampQuantity(Number.NaN, 10)).toBe(1);
  });
});

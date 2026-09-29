// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
  headers: async () => new Headers(),
}));
const sendOrderEmail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/order-email", () => ({ sendOrderEmail }));

import { eq } from "drizzle-orm";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { adminUsers, orders, pages, storeSettings } from "@/lib/db/schema";
import { hashPassword, startAdminSession } from "@/lib/admin-auth";
import {
  ORDER_STATUSES,
  allowedNextStatuses,
  canTransition,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { resendOrderEmail, updateOrderStatus } from "@/app/admin/actions/orders";
import { saveSettings } from "@/app/admin/actions/settings";
import { savePage } from "@/app/admin/actions/pages";
import { dashboardCounts } from "@/lib/db/queries/admin";
import { listOrders } from "@/lib/db/queries/orders";
import { getSettings } from "@/lib/db/queries/settings";
import { computeTotals } from "@/lib/pricing";

describe("order status transitions", () => {
  it("moves forward or cancels, and terminal states are final", () => {
    expect(allowedNextStatuses("new")).toEqual(["processing", "out_for_delivery", "completed", "cancelled"]);
    expect(allowedNextStatuses("processing")).toEqual(["out_for_delivery", "completed", "cancelled"]);
    expect(allowedNextStatuses("out_for_delivery")).toEqual(["completed", "cancelled"]);
    expect(allowedNextStatuses("completed")).toEqual([]);
    expect(allowedNextStatuses("cancelled")).toEqual([]);
  });

  it("never moves backwards", () => {
    expect(canTransition("processing", "new")).toBe(false);
    expect(canTransition("out_for_delivery", "processing")).toBe(false);
    expect(canTransition("completed", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "new")).toBe(false);
    expect(canTransition("new", "new")).toBe(false);
  });

  it("recognizes only the five structured statuses", () => {
    expect(ORDER_STATUSES).toHaveLength(5);
    expect(isOrderStatus("processing")).toBe(true);
    expect(isOrderStatus("shipped")).toBe(false);
    expect(isOrderStatus(undefined)).toBe(false);
  });
});

let db: Db;
let orderId: string;

async function makeOrder(overrides: Partial<typeof orders.$inferInsert> = {}) {
  const [row] = await db
    .insert(orders)
    .values({
      idempotencyKey: crypto.randomUUID(),
      accessToken: crypto.randomUUID(),
      customerName: "A B",
      customerPhone: "+972501234567",
      deliveryAddress: "somewhere 1",
      subtotalMinor: 10000,
      deliveryFeeMinor: 0,
      totalMinor: 10000,
      acknowledgedAt: new Date(),
      locale: "en",
      ...overrides,
    })
    .returning();
  return row.id;
}

describe("admin order, settings and page actions", () => {
  beforeEach(async () => {
    jar.clear();
    sendOrderEmail.mockReset();
    db = await useTestDb();
    const [user] = await db
      .insert(adminUsers)
      .values({ email: "owner@example.com", passwordHash: await hashPassword("a long enough password") })
      .returning();
    await startAdminSession(user.id);
    orderId = await makeOrder();
  });
  afterEach(() => resetTestDb());

  it("refuses without a session", async () => {
    jar.clear();
    const denied = { ok: false, code: "UNAUTHORIZED" };
    expect(await updateOrderStatus(orderId, "processing")).toEqual(denied);
    expect(await resendOrderEmail(orderId)).toEqual(denied);
    expect(await saveSettings({ ok: false }, new FormData())).toEqual(denied);
    expect(await savePage({ ok: false }, new FormData())).toEqual(denied);
    const [order] = await db.select().from(orders);
    expect(order.status).toBe("new");
  });

  it("changes status along the lifecycle and rejects invalid moves", async () => {
    expect((await updateOrderStatus(orderId, "processing")).ok).toBe(true);
    expect((await updateOrderStatus(orderId, "new" as OrderStatus))).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
    expect((await updateOrderStatus(orderId, "out_for_delivery")).ok).toBe(true);
    expect((await updateOrderStatus(orderId, "completed")).ok).toBe(true);
    expect(await updateOrderStatus(orderId, "cancelled")).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
    expect(await updateOrderStatus(orderId, "shipped" as OrderStatus)).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(await updateOrderStatus("nope", "processing")).toMatchObject({ ok: false, code: "VALIDATION" });
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    expect(order.status).toBe("completed");
  });

  it("dashboard counts new and processing orders, products and brands", async () => {
    await makeOrder();
    await makeOrder({ status: "processing" });
    expect(await dashboardCounts()).toEqual({ newOrders: 2, processingOrders: 1, products: 10, brands: 1 });
    const filtered = await listOrders("processing");
    expect(filtered.total).toBe(1);
    expect((await listOrders(undefined)).total).toBe(3);
  });

  it("resends a failed notification and records the result", async () => {
    await db.update(orders).set({ notificationStatus: "failed", notificationError: "provider_error" }).where(eq(orders.id, orderId));
    sendOrderEmail.mockResolvedValueOnce({ ok: false, error: "provider_error" });
    expect(await resendOrderEmail(orderId)).toMatchObject({ ok: false, code: "EMAIL_FAILED" });
    sendOrderEmail.mockResolvedValueOnce({ ok: true });
    expect((await resendOrderEmail(orderId)).ok).toBe(true);
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    expect(order.notificationStatus).toBe("sent");
    expect(order.notificationError).toBeNull();
  });

  it("saves settings and applies the new delivery fee to totals, leaving old orders alone", async () => {
    const fd = new FormData();
    fd.set("storeName", "Pep Club");
    fd.set("deliveryEnabled", "on");
    fd.set("deliveryFee", "25");
    fd.set("unpricedBehavior", "hide_price");
    fd.set("defaultLocale", "ar");
    fd.append("supportedLocales", "en");
    fd.append("supportedLocales", "ar");
    fd.set("maxLineQuantity", "5");
    fd.set("whatsappNumber", "+972 50 123 4567");
    expect((await saveSettings({ ok: false }, fd)).ok).toBe(true);

    const settings = await getSettings();
    expect(settings).toMatchObject({
      deliveryFeeMinor: 2500,
      unpricedBehavior: "hide_price",
      defaultLocale: "ar",
      maxLineQuantity: 5,
      whatsappNumber: "972501234567",
    });
    expect(computeTotals([{ status: "ok", lineTotalMinor: 10000 }], settings).totalMinor).toBe(12500);
    const [old] = await db.select().from(orders).where(eq(orders.id, orderId));
    expect(old.deliveryFeeMinor).toBe(0);
    expect(old.totalMinor).toBe(10000);
  });

  it("rejects invalid settings without saving", async () => {
    const fd = new FormData();
    fd.set("storeName", "Pep Club");
    fd.set("deliveryFee", "-3");
    fd.set("unpricedBehavior", "ask_price");
    fd.set("defaultLocale", "en");
    fd.append("supportedLocales", "ar");
    fd.set("maxLineQuantity", "10");
    expect(await saveSettings({ ok: false }, fd)).toMatchObject({
      ok: false,
      code: "VALIDATION",
      fieldErrors: { deliveryFee: "invalidPrice" },
    });

    // With a valid fee, a default language that is not supported is rejected too.
    fd.set("deliveryFee", "5");
    expect(await saveSettings({ ok: false }, fd)).toMatchObject({
      ok: false,
      fieldErrors: { defaultLocale: "defaultNotSupported" },
    });
    const [row] = await db.select().from(storeSettings);
    expect(row.deliveryFeeMinor).toBe(0);
  });

  it("saves page text per language and can mark it approved", async () => {
    const fd = new FormData();
    fd.set("slug", "terms");
    fd.set("titleEn", "Terms & Conditions");
    fd.set("titleAr", "الشروط");
    fd.set("bodyEn", "## Use\n\nApproved terms.");
    fd.set("bodyAr", "## الاستخدام");
    expect((await savePage({ ok: false }, fd)).ok).toBe(true);
    const [page] = await db.select().from(pages).where(eq(pages.slug, "terms"));
    expect(page.bodyEn).toContain("Approved terms.");
    expect(page.bodyAr).toBe("## الاستخدام");
    expect(page.isPlaceholder).toBe(false);

    const bad = new FormData();
    bad.set("slug", "not-a-page");
    bad.set("titleEn", "x");
    expect(await savePage({ ok: false }, bad)).toMatchObject({ ok: false, code: "VALIDATION" });
  });
});

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
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { redirectTo: url });
  },
}));
vi.mock("@vercel/blob", () => ({ del: vi.fn() }));

import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import {
  adminUsers,
  brands,
  categories,
  orderItems,
  orders,
  productImages,
  products,
} from "@/lib/db/schema";
import { hashPassword, startAdminSession } from "@/lib/admin-auth";
import { getProduct, listShop } from "@/lib/db/queries/catalog";
import { eq } from "drizzle-orm";
import { saveBrand, setBrandActive } from "@/app/admin/actions/brands";
import { saveCategory, setCategoryActive } from "@/app/admin/actions/categories";
import {
  addProductImage,
  deleteProduct,
  removeProductImage,
  reorderProductImages,
  saveProduct,
  setProductStatus,
} from "@/app/admin/actions/products";

const NONE = { ok: false };
const ID = "3f0c3a3e-9a53-4c5b-9a3e-2c1f2b6d7a10";

function form(values: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
  }
  return fd;
}

let db: Db;
let brandId: string;

beforeEach(async () => {
  jar.clear();
  db = await useTestDb();
  const [user] = await db
    .insert(adminUsers)
    .values({ email: "owner@example.com", passwordHash: await hashPassword("a long enough password") })
    .returning();
  await startAdminSession(user.id);
  const [brand] = await db.select().from(brands);
  brandId = brand.id;
});
afterEach(() => resetTestDb());

describe("authorization", () => {
  it("every admin action refuses to run without a session", async () => {
    jar.clear();
    const denied = { ok: false, code: "UNAUTHORIZED" };
    expect(await saveBrand(NONE, form({ nameEn: "X", slug: "xx" }))).toEqual(denied);
    expect(await setBrandActive(ID, false)).toEqual(denied);
    expect(await saveCategory(NONE, form({ nameEn: "X", slug: "xx" }))).toEqual(denied);
    expect(await setCategoryActive(ID, false)).toEqual(denied);
    expect(await saveProduct(NONE, form({ brandId, nameEn: "X", slug: "xx", status: "published" }))).toEqual(denied);
    expect(await setProductStatus(ID, "published")).toEqual(denied);
    expect(await deleteProduct(ID)).toEqual(denied);
    expect(await addProductImage(ID, "/products/a.jpeg")).toEqual(denied);
    expect(await reorderProductImages(ID, [])).toEqual(denied);
    expect(await removeProductImage(ID)).toEqual(denied);

    // And nothing was written.
    expect(await db.select().from(brands)).toHaveLength(1);
    expect(await db.select().from(products)).toHaveLength(10);
  });
});

describe("brands and categories", () => {
  it("creates and updates a brand, and rejects duplicates and bad input", async () => {
    const created = await saveBrand(NONE, form({ nameEn: "Acme Peptides", slug: "acme", isActive: "on" }));
    expect(created.ok).toBe(true);
    const updated = await saveBrand(
      NONE,
      form({ id: created.id!, nameEn: "Acme Peptides Ltd", slug: "acme", isActive: "on" })
    );
    expect(updated).toMatchObject({ ok: true, id: created.id });

    const dupe = await saveBrand(NONE, form({ nameEn: "Other", slug: "acme" }));
    expect(dupe).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { slug: "taken" } });
    const dupeName = await saveBrand(NONE, form({ nameEn: "acme peptides ltd", slug: "other" }));
    expect(dupeName).toMatchObject({ ok: false, fieldErrors: { nameEn: "taken" } });

    const bad = await saveBrand(NONE, form({ nameEn: "", slug: "BAD SLUG" }));
    expect(bad).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { nameEn: "required", slug: "invalidSlug" } });
  });

  it("deactivating a brand hides it and its products but deletes nothing", async () => {
    expect((await listShop()).total).toBe(10);
    expect((await setBrandActive(brandId, false)).ok).toBe(true);
    expect((await listShop()).total).toBe(0);
    expect(await db.select().from(products)).toHaveLength(10);
    await setBrandActive(brandId, true);
    expect((await listShop()).total).toBe(10);
  });

  it("creates a research area with a description", async () => {
    const created = await saveCategory(
      NONE,
      form({ nameEn: "Sleep research", slug: "sleep", descriptionEn: "Laboratory research on sleep pathways.", isActive: "on", sortOrder: "9" })
    );
    expect(created.ok).toBe(true);
    const [row] = await db.select().from(categories).where(eq(categories.slug, "sleep"));
    expect(row.descriptionEn).toBe("Laboratory research on sleep pathways.");
    expect(row.sortOrder).toBe(9);
    expect((await setCategoryActive(row.id, false)).ok).toBe(true);
    expect(await setCategoryActive("not-a-uuid", false)).toMatchObject({ ok: false, code: "VALIDATION" });
  });
});

describe("saveProduct", () => {
  const valid = () => ({
    brandId,
    nameEn: "New Peptide",
    slug: "new-peptide",
    status: "published",
    price: "",
  });

  async function create(overrides: Record<string, string | string[]> = {}) {
    try {
      return await saveProduct(NONE, form({ ...valid(), ...overrides }));
    } catch (error) {
      // Creating redirects to the edit page.
      const redirectTo = (error as { redirectTo?: string }).redirectTo;
      if (!redirectTo) throw error;
      return { ok: true, id: redirectTo.split("/").pop() };
    }
  }

  it("creates an unpriced product, assigns categories, and shows it on the storefront", async () => {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, "cognitive"));
    const result = await create({ categoryIds: [cat.id] });
    expect(result.ok).toBe(true);

    const detail = await getProduct("pep-lab", "new-peptide");
    expect(detail?.product.priceMinor).toBeNull();
    expect(detail?.categories.map((c) => c.slug)).toEqual(["cognitive"]);
    expect((await listShop({ categorySlugs: ["cognitive"] })).total).toBe(3);
  });

  it("stores a price in agorot and can clear it again", async () => {
    const created = await create({ price: "125.50" });
    expect((await getProduct("pep-lab", "new-peptide"))?.product.priceMinor).toBe(12550);
    const cleared = await saveProduct(NONE, form({ ...valid(), id: created.id!, price: "" }));
    expect(cleared.ok).toBe(true);
    expect((await getProduct("pep-lab", "new-peptide"))?.product.priceMinor).toBeNull();
  });

  it("rejects invalid prices without saving anything", async () => {
    for (const price of ["-1", "abc", "0", "100000.01"]) {
      const result = await saveProduct(NONE, form({ ...valid(), price }));
      expect(result).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { price: "invalidPrice" } });
    }
    expect(await db.select().from(products)).toHaveLength(10);
  });

  it("rejects a duplicate slug within the same brand and an unknown brand", async () => {
    await create();
    const dupe = await saveProduct(NONE, form({ ...valid() }));
    expect(dupe).toMatchObject({ ok: false, fieldErrors: { slug: "taken" } });
    const unknownBrand = await saveProduct(NONE, form({ ...valid(), brandId: ID, slug: "another" }));
    expect(unknownBrand).toMatchObject({ ok: false, fieldErrors: { brandId: "required" } });
  });

  it("publishing and unpublishing controls public visibility", async () => {
    const created = await create({ status: "draft" });
    expect(await getProduct("pep-lab", "new-peptide")).toBeNull();
    expect((await setProductStatus(created.id!, "published")).ok).toBe(true);
    expect(await getProduct("pep-lab", "new-peptide")).not.toBeNull();
    expect((await setProductStatus(created.id!, "unpublished")).ok).toBe(true);
    expect(await getProduct("pep-lab", "new-peptide")).toBeNull();
    expect(await setProductStatus(created.id!, "live" as never)).toMatchObject({ code: "VALIDATION" });
  });

  it("editing a product does not change existing order snapshots", async () => {
    const created = await create({ price: "100" });
    const [order] = await db
      .insert(orders)
      .values({
        idempotencyKey: crypto.randomUUID(),
        accessToken: "tok",
        customerName: "A B",
        customerPhone: "+972501234567",
        deliveryAddress: "somewhere",
        subtotalMinor: 10000,
        deliveryFeeMinor: 0,
        totalMinor: 10000,
        acknowledgedAt: new Date(),
        locale: "en",
      })
      .returning();
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: created.id!,
      productNameSnapshot: "New Peptide",
      brandNameSnapshot: "PEP Lab",
      unitPriceMinor: 10000,
      quantity: 1,
      lineTotalMinor: 10000,
    });

    await saveProduct(NONE, form({ ...valid(), id: created.id!, nameEn: "Renamed", price: "999" }));
    const [item] = await db.select().from(orderItems);
    expect(item.productNameSnapshot).toBe("New Peptide");
    expect(item.unitPriceMinor).toBe(10000);

    // A product that was ordered can be unpublished but not deleted.
    expect(await deleteProduct(created.id!)).toMatchObject({ ok: false, code: "HAS_ORDERS" });
  });

  it("deletes a product that was never ordered", async () => {
    const created = await create();
    expect((await deleteProduct(created.id!)).ok).toBe(true);
    expect(await db.select().from(products).where(eq(products.slug, "new-peptide"))).toHaveLength(0);
  });
});

describe("product images", () => {
  async function newProduct() {
    const [row] = await db.select().from(products).where(eq(products.slug, "tb-500"));
    await db.delete(productImages).where(eq(productImages.productId, row.id));
    return row.id;
  }

  it("adds, reorders and removes images; the first image is the card image", async () => {
    const id = await newProduct();
    const a = await addProductImage(id, "/products/a.jpeg");
    const b = await addProductImage(id, "https://abc.public.blob.vercel-storage.com/b.png");
    expect(a.ok && b.ok).toBe(true);

    let images = await db.select().from(productImages).where(eq(productImages.productId, id));
    expect(images.sort((x, y) => x.sortOrder - y.sortOrder).map((i) => i.url)[0]).toBe("/products/a.jpeg");

    expect((await reorderProductImages(id, [b.id!, a.id!])).ok).toBe(true);
    const detail = await getProduct("pep-lab", "tb-500");
    expect(detail?.images[0].id).toBe(b.id);

    // The order must be exactly the product's images.
    expect(await reorderProductImages(id, [b.id!])).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(await reorderProductImages(id, [b.id!, b.id!])).toMatchObject({ ok: false, code: "VALIDATION" });

    expect((await removeProductImage(a.id!)).ok).toBe(true);
    images = await db.select().from(productImages).where(eq(productImages.productId, id));
    expect(images).toHaveLength(1);
  });

  it("rejects image URLs from other hosts and more than 10 images", async () => {
    const id = await newProduct();
    expect(await addProductImage(id, "https://evil.example.com/x.png")).toMatchObject({
      ok: false,
      fieldErrors: { url: "invalidImageUrl" },
    });
    for (let i = 0; i < 10; i++) expect((await addProductImage(id, `/products/img-${i}.jpeg`)).ok).toBe(true);
    expect(await addProductImage(id, "/products/one-too-many.jpeg")).toMatchObject({
      ok: false,
      fieldErrors: { url: "tooManyImages" },
    });
  });
});

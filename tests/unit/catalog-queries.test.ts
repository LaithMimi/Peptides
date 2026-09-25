// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { brands, categories, products } from "@/lib/db/schema";
import {
  getProduct,
  listActiveBrands,
  listCategories,
  listFeatured,
  listShop,
} from "@/lib/db/queries/catalog";

let db: Db;
beforeEach(async () => {
  db = await useTestDb();
});
afterEach(() => resetTestDb());

describe("catalog visibility", () => {
  it("lists the 10 seeded products grouped under one brand", async () => {
    const result = await listShop();
    expect(result.total).toBe(10);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].brand.slug).toBe("pep-lab");
    expect(result.groups[0].products).toHaveLength(10);
  });

  it("hides draft and unpublished products, and their direct lookup", async () => {
    await db.update(products).set({ status: "draft" }).where(eq(products.slug, "kpv"));
    await db
      .update(products)
      .set({ status: "unpublished" })
      .where(eq(products.slug, "semax"));
    const result = await listShop();
    expect(result.total).toBe(8);
    expect(await getProduct("pep-lab", "kpv")).toBeNull();
    expect(await getProduct("pep-lab", "semax")).toBeNull();
    expect(await getProduct("pep-lab", "tb-500")).not.toBeNull();
  });

  it("hides every product of an inactive brand without deleting data", async () => {
    await db.update(brands).set({ isActive: false }).where(eq(brands.slug, "pep-lab"));
    expect((await listShop()).total).toBe(0);
    expect(await listActiveBrands()).toHaveLength(0);
    expect(await getProduct("pep-lab", "tb-500")).toBeNull();
    await db.update(brands).set({ isActive: true }).where(eq(brands.slug, "pep-lab"));
    expect((await listShop()).total).toBe(10);
  });
});

describe("filters", () => {
  it("filters by research area, showing only assigned products", async () => {
    const result = await listShop({ categorySlugs: ["cognitive"] });
    const names = result.groups.flatMap((g) => g.products.map((p) => p.nameEn)).sort();
    expect(names).toEqual(["Selank", "Semax"]);
  });

  it("returns the union of several areas once per product", async () => {
    const result = await listShop({
      categorySlugs: ["recovery-tissue", "growth-hormone"],
    });
    const names = result.groups.flatMap((g) => g.products.map((p) => p.nameEn));
    expect(new Set(names).size).toBe(names.length);
    expect(names.sort()).toEqual(["BPC-157", "CJC-1295", "Ipamorelin", "TB-500"]);
  });

  it("ignores inactive research areas", async () => {
    await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.slug, "cognitive"));
    expect((await listShop({ categorySlugs: ["cognitive"] })).total).toBe(0);
    expect((await listCategories()).map((c) => c.slug)).not.toContain("cognitive");
  });

  it("price-listed filter excludes unpriced products", async () => {
    expect((await listShop({ listedOnly: true })).total).toBe(0);
    await db.update(products).set({ priceMinor: 12000 }).where(eq(products.slug, "tb-500"));
    const listed = await listShop({ listedOnly: true });
    expect(listed.total).toBe(1);
    expect(listed.groups[0].products[0].priceMinor).toBe(12000);
  });

  it("only offers research areas that have visible products", async () => {
    const before = (await listCategories()).map((c) => c.slug);
    expect(before).toContain("skin-tissue");
    await db.update(products).set({ status: "draft" }).where(eq(products.slug, "ghk-cu"));
    const after = (await listCategories()).map((c) => c.slug);
    expect(after).not.toContain("skin-tissue");
  });

  it("filters by brand slug and paginates at 24", async () => {
    expect((await listShop({ brandSlug: "nope" })).total).toBe(0);
    const [brand] = await db.select().from(brands).where(eq(brands.slug, "pep-lab"));
    for (let i = 0; i < 20; i++) {
      await db.insert(products).values({
        brandId: brand.id,
        nameEn: `Extra ${i}`,
        slug: `extra-${i}`,
        status: "published",
      });
    }
    const page1 = await listShop({ page: 1 });
    const page2 = await listShop({ page: 2 });
    expect(page1.total).toBe(30);
    expect(page1.groups[0].products).toHaveLength(24);
    expect(page1.hasMore).toBe(true);
    expect(page2.groups[0].products).toHaveLength(6);
    expect(page2.hasMore).toBe(false);
  });

  it("lists featured products", async () => {
    expect((await listFeatured(10)).length).toBe(4);
  });
});

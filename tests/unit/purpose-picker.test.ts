// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { resetTestDb, useTestDb } from "./helpers/test-db";
import type { Db } from "@/lib/db/client";
import { brands, categories, products } from "@/lib/db/schema";
import { listProductsByPurposes, listPurposeTiles } from "@/lib/db/queries/catalog";

let db: Db;
beforeEach(async () => {
  db = await useTestDb();
});
afterEach(() => resetTestDb());

const names = (r: Awaited<ReturnType<typeof listProductsByPurposes>>) =>
  r.groups.flatMap((g) => g.products.map((p) => p.nameEn)).sort();

describe("listPurposeTiles", () => {
  it("offers only active research areas that have visible products, with counts", async () => {
    const tiles = await listPurposeTiles();
    expect(tiles.map((t) => t.slug)).toEqual([
      "recovery-tissue",
      "growth-hormone",
      "metabolic",
      "gut",
      "skin-tissue",
      "cognitive",
    ]);
    expect(tiles.find((t) => t.slug === "cognitive")?.productCount).toBe(2);
    expect(tiles.find((t) => t.slug === "recovery-tissue")?.productCount).toBe(3);
    expect(tiles.every((t) => t.descriptionEn)).toBe(true);
  });

  it("drops an area when it becomes inactive or its products are hidden", async () => {
    await db.update(categories).set({ isActive: false }).where(eq(categories.slug, "metabolic"));
    await db.update(products).set({ status: "draft" }).where(eq(products.slug, "ghk-cu"));
    const slugs = (await listPurposeTiles()).map((t) => t.slug);
    expect(slugs).not.toContain("metabolic");
    expect(slugs).not.toContain("skin-tissue");
    expect(slugs).toContain("gut");
  });

  it("offers nothing when the brand is inactive", async () => {
    await db.update(brands).set({ isActive: false }).where(eq(brands.slug, "pep-lab"));
    expect(await listPurposeTiles()).toEqual([]);
  });
});

describe("listProductsByPurposes", () => {
  it("returns only the products of one chosen area, grouped by brand", async () => {
    const result = await listProductsByPurposes(["gut"]);
    expect(names(result)).toEqual(["BPC-157", "KPV"]);
    expect(result.groups).toHaveLength(1);
  });

  it("returns the union of several areas with no duplicates", async () => {
    // BPC-157 is in both recovery-tissue and gut; Ipamorelin in recovery-tissue and growth-hormone.
    const result = await listProductsByPurposes(["recovery-tissue", "gut", "growth-hormone"]);
    expect(names(result)).toEqual(["BPC-157", "CJC-1295", "Ipamorelin", "KPV", "TB-500"]);
    expect(result.total).toBe(5);
  });

  it("excludes draft, unpublished and inactive-brand products", async () => {
    await db.update(products).set({ status: "unpublished" }).where(eq(products.slug, "kpv"));
    expect(names(await listProductsByPurposes(["gut"]))).toEqual(["BPC-157"]);
    await db.update(brands).set({ isActive: false }).where(eq(brands.slug, "pep-lab"));
    expect((await listProductsByPurposes(["gut"])).total).toBe(0);
  });

  it("ignores unknown or inactive areas and returns nothing for them", async () => {
    expect((await listProductsByPurposes(["does-not-exist"])).total).toBe(0);
    await db.update(categories).set({ isActive: false }).where(eq(categories.slug, "cognitive"));
    expect((await listProductsByPurposes(["cognitive"])).total).toBe(0);
  });

  it("carries the research focus line and paginates", async () => {
    const result = await listProductsByPurposes(["cognitive"]);
    const semax = result.groups[0].products.find((p) => p.nameEn === "Semax");
    expect(semax?.researchFocusEn).toBe("Focus & cognitive research");
    expect(semax?.researchFocusAr).toBeTruthy();
    expect((await listProductsByPurposes(["cognitive"], 2)).groups).toHaveLength(0);
  });
});

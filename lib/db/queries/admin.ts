import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../client";
import {
  brands,
  categories,
  orders,
  productCategories,
  productImages,
  products,
  type Brand,
  type Category,
  type Product,
  type ProductImage,
} from "../schema";

// Admin listings include inactive, draft and unpublished rows (unlike the
// public queries in catalog.ts). Only call these behind an admin check.

export async function dashboardCounts() {
  const db = await getDb();
  const [[newOrders], [processing], [productCount], [brandCount]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(eq(orders.status, "new")),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "processing")),
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(brands),
  ]);
  return {
    newOrders: newOrders.n,
    processingOrders: processing.n,
    products: productCount.n,
    brands: brandCount.n,
  };
}

export async function listBrandsAdmin(): Promise<(Brand & { productCount: number })[]> {
  const db = await getDb();
  const rows = await db
    .select({ brand: brands, productCount: count(products.id) })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .groupBy(brands.id)
    .orderBy(asc(sql`lower(${brands.nameEn})`));
  return rows.map((r) => ({ ...r.brand, productCount: r.productCount }));
}

export async function getBrandAdmin(id: string): Promise<Brand | null> {
  const db = await getDb();
  const [row] = await db.select().from(brands).where(eq(brands.id, id));
  return row ?? null;
}

export async function listCategoriesAdmin(): Promise<(Category & { productCount: number })[]> {
  const db = await getDb();
  const rows = await db
    .select({ category: categories, productCount: count(productCategories.productId) })
    .from(categories)
    .leftJoin(productCategories, eq(productCategories.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.nameEn));
  return rows.map((r) => ({ ...r.category, productCount: r.productCount }));
}

export async function getCategoryAdmin(id: string): Promise<Category | null> {
  const db = await getDb();
  const [row] = await db.select().from(categories).where(eq(categories.id, id));
  return row ?? null;
}

export async function listProductsAdmin(): Promise<
  { product: Product; brandName: string }[]
> {
  const db = await getDb();
  return db
    .select({ product: products, brandName: brands.nameEn })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .orderBy(asc(sql`lower(${brands.nameEn})`), asc(products.sortOrder), desc(products.createdAt));
}

export interface ProductAdminDetail {
  product: Product;
  images: ProductImage[];
  categoryIds: string[];
}

export async function getProductAdmin(id: string): Promise<ProductAdminDetail | null> {
  const db = await getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return null;
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));
  const cats = await db
    .select({ id: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, id));
  return { product, images, categoryIds: cats.map((c) => c.id) };
}

/** Category ids that exist, for validating form input. */
export async function existingCategoryIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const rows = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, ids));
  return rows.map((r) => r.id);
}

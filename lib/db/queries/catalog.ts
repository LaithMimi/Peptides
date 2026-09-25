import { and, asc, eq, exists, inArray, sql, type SQL } from "drizzle-orm";
import { getDb } from "../client";
import {
  brands,
  categories,
  productCategories,
  productImages,
  products,
  type Brand,
  type Category,
  type Product,
  type ProductImage,
} from "../schema";

export const PAGE_SIZE = 24;

/**
 * Public visibility rule (FR-007): a product is visible only when it is
 * published AND its brand is active. Every public query goes through this.
 */
const visibleProduct = and(
  eq(products.status, "published"),
  eq(brands.isActive, true)
) as SQL;

export interface ProductCardData {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
  researchFocusEn: string | null;
  researchFocusAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  vialSize: string | null;
  priceMinor: number | null;
  brand: { slug: string; nameEn: string; nameAr: string | null };
  image: { url: string; altEn: string | null; altAr: string | null } | null;
}

export interface BrandGroup {
  brand: { slug: string; nameEn: string; nameAr: string | null };
  products: ProductCardData[];
}

export interface ShopFilters {
  brandSlug?: string;
  /** One or several research-area slugs; a product matches if it is in any. */
  categorySlugs?: string[];
  listedOnly?: boolean;
  page?: number;
}

export interface ShopResult {
  groups: BrandGroup[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function filterConditions(filters: ShopFilters, db: Awaited<ReturnType<typeof getDb>>) {
  const conditions: SQL[] = [visibleProduct];
  if (filters.brandSlug) conditions.push(eq(brands.slug, filters.brandSlug));
  if (filters.listedOnly) conditions.push(sql`${products.priceMinor} IS NOT NULL`);
  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(productCategories)
          .innerJoin(categories, eq(categories.id, productCategories.categoryId))
          .where(
            and(
              eq(productCategories.productId, products.id),
              eq(categories.isActive, true),
              inArray(categories.slug, filters.categorySlugs)
            )
          )
      )
    );
  }
  return and(...conditions) as SQL;
}

async function attachImages(
  db: Awaited<ReturnType<typeof getDb>>,
  ids: string[]
): Promise<Map<string, ProductCardData["image"]>> {
  const map = new Map<string, ProductCardData["image"]>();
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.sortOrder));
  for (const row of rows) {
    if (!map.has(row.productId)) {
      map.set(row.productId, { url: row.url, altEn: row.altEn, altAr: row.altAr });
    }
  }
  return map;
}

/** Products grouped by brand, paginated (24 per page), with combinable filters. */
export async function listShop(filters: ShopFilters = {}): Promise<ShopResult> {
  const db = await getDb();
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const where = filterConditions(filters, db);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(where);

  const rows = await db
    .select({ product: products, brand: brands })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(where)
    .orderBy(
      asc(sql`lower(${brands.nameEn})`),
      asc(products.sortOrder),
      asc(products.nameEn)
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const images = await attachImages(
    db,
    rows.map((r) => r.product.id)
  );

  const groups: BrandGroup[] = [];
  for (const { product, brand } of rows) {
    const card = toCard(product, brand, images.get(product.id) ?? null);
    const last = groups[groups.length - 1];
    if (last && last.brand.slug === brand.slug) last.products.push(card);
    else groups.push({ brand: card.brand, products: [card] });
  }

  return {
    groups,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: page * PAGE_SIZE < total,
  };
}

function toCard(
  product: Product,
  brand: Brand,
  image: ProductCardData["image"]
): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    researchFocusEn: product.researchFocusEn,
    researchFocusAr: product.researchFocusAr,
    descriptionEn: product.descriptionEn,
    descriptionAr: product.descriptionAr,
    vialSize: product.vialSize,
    priceMinor: product.priceMinor,
    brand: { slug: brand.slug, nameEn: brand.nameEn, nameAr: brand.nameAr },
    image,
  };
}

export interface ProductDetail {
  product: Product;
  brand: Brand;
  images: ProductImage[];
  categories: Category[];
}

/** A visible product by brand and product slug, or null (draft, unpublished, inactive brand). */
export async function getProduct(
  brandSlug: string,
  productSlug: string
): Promise<ProductDetail | null> {
  const db = await getDb();
  const [row] = await db
    .select({ product: products, brand: brands })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(
      and(visibleProduct, eq(brands.slug, brandSlug), eq(products.slug, productSlug))
    );
  if (!row) return null;

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, row.product.id))
    .orderBy(asc(productImages.sortOrder));
  const cats = await db
    .select({ category: categories })
    .from(productCategories)
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(
      and(
        eq(productCategories.productId, row.product.id),
        eq(categories.isActive, true)
      )
    )
    .orderBy(asc(categories.sortOrder), asc(categories.nameEn));

  return {
    product: row.product,
    brand: row.brand,
    images,
    categories: cats.map((c) => c.category),
  };
}

export type CategoryWithCount = Category & { productCount: number };

/** Active research areas that have at least one visible product. */
export async function listCategories(): Promise<CategoryWithCount[]> {
  const db = await getDb();
  const rows = await db
    .select({
      category: categories,
      productCount: sql<number>`count(distinct ${products.id})::int`,
    })
    .from(categories)
    .innerJoin(productCategories, eq(productCategories.categoryId, categories.id))
    .innerJoin(products, eq(products.id, productCategories.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(categories.isActive, true), visibleProduct))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.nameEn));
  return rows.map((r) => ({ ...r.category, productCount: r.productCount }));
}

export async function getCategory(slug: string): Promise<Category | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
  return row ?? null;
}

export type BrandWithCount = Brand & { productCount: number };

/** Active brands that have at least one visible product. */
export async function listActiveBrands(): Promise<BrandWithCount[]> {
  const db = await getDb();
  const rows = await db
    .select({
      brand: brands,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(brands)
    .innerJoin(products, eq(products.brandId, brands.id))
    .where(and(eq(brands.isActive, true), eq(products.status, "published")))
    .groupBy(brands.id)
    .orderBy(asc(sql`lower(${brands.nameEn})`));
  return rows.map((r) => ({ ...r.brand, productCount: r.productCount }));
}

export async function getBrand(slug: string): Promise<Brand | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.slug, slug), eq(brands.isActive, true)));
  return row ?? null;
}

/** Featured visible products for the home page. */
export async function listFeatured(limit = 4): Promise<ProductCardData[]> {
  const db = await getDb();
  const rows = await db
    .select({ product: products, brand: brands })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(visibleProduct, eq(products.isFeatured, true)))
    .orderBy(asc(products.sortOrder), asc(products.nameEn))
    .limit(limit);
  const images = await attachImages(
    db,
    rows.map((r) => r.product.id)
  );
  return rows.map((r) => toCard(r.product, r.brand, images.get(r.product.id) ?? null));
}

export interface SitemapEntries {
  products: { brandSlug: string; slug: string; updatedAt: Date }[];
  brands: { slug: string; updatedAt: Date }[];
  categories: { slug: string; updatedAt: Date }[];
}

export async function listSitemapEntries(): Promise<SitemapEntries> {
  const db = await getDb();
  const productRows = await db
    .select({
      brandSlug: brands.slug,
      slug: products.slug,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(visibleProduct);
  const brandRows = await listActiveBrands();
  const categoryRows = await listCategories();
  return {
    products: productRows,
    brands: brandRows.map((b) => ({ slug: b.slug, updatedAt: b.updatedAt })),
    categories: categoryRows.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt })),
  };
}

/** Research-purpose tiles for the picker: active areas that have at least one visible product. */
export const listPurposeTiles = listCategories;

/**
 * Products related to one or more chosen research purposes: the union of the
 * areas, each product once, grouped by brand and paginated like the shop.
 */
export function listProductsByPurposes(slugs: string[], page = 1): Promise<ShopResult> {
  return listShop({ categorySlugs: slugs, page });
}

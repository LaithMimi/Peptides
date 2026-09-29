import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";
import { brands, productImages, products, type StoreSettings } from "@/lib/db/schema";
import { pick } from "@/lib/i18n-fields";
import { getSettings } from "@/lib/db/queries/settings";
import {
  clampQuantity,
  isUuid,
  totalsFrom,
  type LineStatus,
  type Totals,
} from "@/lib/cart-math";
import { MAX_ORDER_LINES } from "@/lib/schemas/order";

export { clampQuantity, type LineStatus, type Totals };

export interface CartInputLine {
  productId: string;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  name: string;
  brand: string;
  vialSize: string | null;
  imageUrl: string | null;
  /** Path (without locale) of the product page; null when unavailable. */
  href: string | null;
  unitPriceMinor: number | null;
  quantity: number;
  lineTotalMinor: number | null;
  status: LineStatus;
}

export interface PricedCart extends Totals {
  lines: PricedLine[];
  canCheckout: boolean;
  maxLineQuantity: number;
  /** Fee that applies to any non-empty order (0 when delivery is disabled or free). */
  deliveryFeeIfAny: number;
}

type DeliverySettings = Pick<StoreSettings, "deliveryEnabled" | "deliveryFeeMinor">;

export const deliveryFeeIfAny = (settings: DeliverySettings): number =>
  settings.deliveryEnabled ? settings.deliveryFeeMinor : 0;

/** Server-side totals from resolved lines and store settings. */
export function computeTotals(
  lines: Pick<PricedLine, "status" | "lineTotalMinor">[],
  settings: DeliverySettings
): Totals {
  return totalsFrom(lines, deliveryFeeIfAny(settings));
}

/**
 * Resolves cart lines against the database. A line is `unavailable` when the
 * product is missing, not published, or its brand is inactive, and `unpriced`
 * when it has no price. Works with a transaction handle or the shared client.
 */
export async function resolveCart(
  db: Db,
  items: CartInputLine[],
  settings: StoreSettings,
  locale: string
): Promise<PricedLine[]> {
  // Ids that are not UUIDs (a tampered or stale cart) are unavailable, and are
  // never sent to the database.
  const ids = [...new Set(items.map((i) => i.productId).filter(isUuid))];
  const rows =
    ids.length === 0
      ? []
      : await db
          .select({ product: products, brand: brands })
          .from(products)
          .innerJoin(brands, eq(brands.id, products.brandId))
          .where(
            and(
              inArray(products.id, ids),
              eq(products.status, "published"),
              eq(brands.isActive, true)
            )
          );
  const byId = new Map(rows.map((r) => [r.product.id, r]));

  const images =
    rows.length === 0
      ? []
      : await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, rows.map((r) => r.product.id)))
          .orderBy(asc(productImages.sortOrder));
  const imageById = new Map<string, string>();
  for (const image of images) {
    if (!imageById.has(image.productId)) imageById.set(image.productId, image.url);
  }

  return items.map((item): PricedLine => {
    const quantity = clampQuantity(item.quantity, settings.maxLineQuantity);
    const row = byId.get(item.productId);
    if (!row) {
      return {
        productId: item.productId,
        name: "",
        brand: "",
        vialSize: null,
        imageUrl: null,
        href: null,
        unitPriceMinor: null,
        quantity,
        lineTotalMinor: null,
        status: "unavailable",
      };
    }
    const { product, brand } = row;
    const unit = product.priceMinor;
    return {
      productId: product.id,
      name: pick(product, "name", locale) ?? product.nameEn,
      brand: pick(brand, "name", locale) ?? brand.nameEn,
      vialSize: product.vialSize,
      imageUrl: imageById.get(product.id) ?? null,
      href: `/products/${brand.slug}/${product.slug}`,
      unitPriceMinor: unit,
      quantity,
      lineTotalMinor: unit === null ? null : unit * quantity,
      status: unit === null ? "unpriced" : "ok",
    };
  });
}

/** Read-only priced view of a cart, for the cart and checkout pages (server data only). */
export async function priceCart(
  items: CartInputLine[],
  locale: string
): Promise<PricedCart> {
  const db = await getDb();
  const settings = await getSettings();
  const lines = await resolveCart(db, items.slice(0, MAX_ORDER_LINES), settings, locale);
  const totals = computeTotals(lines, settings);
  return {
    lines,
    ...totals,
    canCheckout: lines.length > 0 && lines.every((l) => l.status === "ok"),
    maxLineQuantity: settings.maxLineQuantity,
    deliveryFeeIfAny: deliveryFeeIfAny(settings),
  };
}

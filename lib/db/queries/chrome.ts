import { unstable_cache } from "next/cache";
import { listCategories } from "./catalog";
import { getSettings } from "./settings";

/**
 * Site-chrome data (header, footer, goal picker) is read on every page render,
 * so it is cached across requests instead of hitting the database on each
 * navigation. Admin saves invalidate it via `STOREFRONT_TAG` (see `withAdmin`);
 * the 60s window is only a backstop. Checkout/pricing must keep using the
 * uncached `getSettings` — a delivery fee is never read from this cache.
 * Cached values round-trip through JSON, so date columns come back as strings;
 * the chrome only reads text fields.
 */
export const STOREFRONT_TAG = "storefront";

export const getChromeSettings = unstable_cache(() => getSettings(), ["chrome-settings"], {
  tags: [STOREFRONT_TAG],
  revalidate: 60,
});

export const getChromeCategories = unstable_cache(() => listCategories(), ["chrome-categories"], {
  tags: [STOREFRONT_TAG],
  revalidate: 60,
});

# Contract: Routes and Access Rules

Storefront routes exist for each supported locale (`/en/...`, `/ar/...`). `/` redirects to the
default locale. Admin routes are English-only and not locale-prefixed.

## Storefront (public, no sign-in)

| Route | Purpose | Notes |
|---|---|---|
| `/[locale]` | Home: hero, research areas, featured products, brands | Data from DB |
| `/[locale]/shop` | All products grouped by brand | Query: `brand`, `category`, `price=listed`, `page`; filters combine |
| `/[locale]/start` | Research purpose picker: tiles, multi-select via `?purpose=a,b`, related products grouped by brand | Only active areas with visible products are offered |
| `/[locale]/categories/[slug]` | Products in one research area, grouped by brand | 404-style unavailable page if inactive |
| `/[locale]/brands` , `/[locale]/brands/[slug]` | Brand list; brand's products | Inactive brand → unavailable page |
| `/[locale]/products/[brand]/[slug]` | Product detail | Draft/unpublished/inactive brand → friendly unavailable page (HTTP 404) |
| `/[locale]/cart` | Cart review | Prices fetched from server; blocks on unpriced/unavailable lines |
| `/[locale]/checkout` | Customer details, COD notice, 18+/research-use checkbox, review, confirm | |
| `/[locale]/order/[orderNumber]?t=<accessToken>` | Confirmation | Requires matching token, otherwise unavailable page; not indexed |
| `/[locale]/about`, `/contact` | Informational | About from `pages`; contact uses store settings |
| `/[locale]/legal/[slug]` | `terms`, `privacy`, `shipping-returns`, `product-disclaimer` | From `pages` |
| `/sitemap.xml`, `/robots.txt` | SEO | Sitemap from DB; robots disallows `/admin` |

All catalog pages set title, description, Open Graph and language alternates.

## Admin (authentication required)

| Route | Purpose |
|---|---|
| `/admin/login` | Email + password sign-in (only unauthenticated admin page) |
| `/admin` | Dashboard: new orders, processing orders, product count, brand count |
| `/admin/orders`, `/admin/orders/[id]` | Order list (filter by status) and detail with status change and "Resend email" |
| `/admin/products`, `/new`, `/[id]` | Product CRUD, images, categories, status, price |
| `/admin/brands`, `/admin/categories` | Brand and category CRUD, activate/deactivate |
| `/admin/pages` | Edit About and legal page text per language |
| `/admin/settings` | Store info, delivery, unpriced behavior, languages |

**Access rules**
- The admin layout redirects to `/admin/login` without a valid session.
- Every admin Server Action and the upload route independently call `requireAdmin()`; failure
  returns `UNAUTHORIZED` and performs no work.
- Admin responses set `Cache-Control: no-store` and `X-Robots-Tag: noindex`.

## HTTP endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/blob-upload` | POST | Admin session | Returns a client-upload token for Vercel Blob; allowed types `image/jpeg`, `image/png`, `image/webp`; max 5 MB |

No other public REST endpoints exist; storefront mutations are Server Actions.

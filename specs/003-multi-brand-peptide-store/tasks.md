---

description: "Task list for the Multi-Brand Peptide Store"
---

# Tasks: Multi-Brand Peptide Store

**Input**: Design documents from `/specs/003-multi-brand-peptide-store/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. The plan's Testing section and the brief's QA phase require Vitest unit tests and Playwright e2e tests, using an embedded Postgres (PGlite) so no external service is needed.

**Organization**: Grouped by user story so each story can be implemented and tested independently. Stories map to spec.md: US1 Browse (P1), US2 COD order (P1), US3 Admin catalog (P1), US4 Unpriced + WhatsApp (P2), US5 Orders + settings (P2), US6 Bilingual/mobile (P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to
- Paths are relative to the repository root and follow plan.md's structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, tooling and configuration

- [X] T001 Install dependencies in `package.json`: `drizzle-orm`, `@neondatabase/serverless`, `@vercel/blob`, `react-markdown`; dev: `drizzle-kit`, `@electric-sql/pglite`
- [X] T002 Create `drizzle.config.ts` (schema `lib/db/schema.ts`, output `drizzle/`) and add npm scripts `db:generate`, `db:migrate`, `db:seed` (runs `scripts/seed.ts` via tsx), `admin:create` (runs `scripts/create-admin.ts`) in `package.json`
- [X] T003 [P] Update `.env.local.example`: add `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_SESSION_SECRET`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`; keep `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`, `ALLOWED_ORIGINS`; remove `TWILIO_*`, `PHONE_TOKEN_SECRET`, `OTP_*`; document rate-limit overrides (`ORDER_LIMIT_PER_IP`, `LOGIN_LIMIT`)
- [X] T004 [P] Update `next.config.ts`: add `images.remotePatterns` for the Vercel Blob host and `headers()` giving `/admin/:path*` `Cache-Control: no-store` and `X-Robots-Tag: noindex`; keep existing `serverActions.allowedOrigins` and `agentRules: false`
- [X] T005 [P] Update `proxy.ts` matcher to also exclude `admin` so next-intl does not redirect `/admin` (matcher: `/((?!api|trpc|admin|_next|_vercel|.*\\..*).*)`)
- [X] T006 [P] Create `app/robots.ts` disallowing `/admin` and pointing to the sitemap

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, seed data and shared server helpers that every story needs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Define the full schema in `lib/db/schema.ts` with Drizzle: `brands`, `categories`, `products`, `product_images`, `product_categories`, `orders`, `order_items`, `store_settings`, `pages`, `admin_users`, `rate_limits`, exactly as in `data-model.md` (uuid `id`, `created_at`, `updated_at`; money as integer agorot; `_en` required and `_ar` nullable for localized text). Enforce verbatim: products `price_minor` "integer null; if set, must be >= 1 and <= 10,000,000"; `status` enum `draft｜published｜unpublished` default `draft`; unique `(brand_id, slug)`; indexes `(status, brand_id)` and `(status, price_minor IS NULL)`; orders `payment_method` enum `cod`, `status` enum `new｜processing｜out_for_delivery｜completed｜cancelled` default `new`, `notification_status` enum `pending｜sent｜failed` default `pending`, unique `order_number`, `idempotency_key`, `access_token`, index `(status, created_at desc)`; `order_items.product_id` nullable FK set null on delete with `product_name_snapshot`, `brand_name_snapshot`, `vial_size_snapshot`, `unit_price_minor`, `quantity`, `line_total_minor`; `store_settings` single row (`id = 1` check) with `delivery_enabled` default true, `delivery_fee_minor` default 0, `unpriced_behavior` enum `ask_price｜hide_price` default `ask_price`, `max_line_quantity` default 10; `pages.slug` fixed set `about`, `terms`, `privacy`, `shipping-returns`, `product-disclaimer`; also `categories.description_en` (text null, max 500), `description_ar`, `image_url` (text null) and `products.research_focus_en` (text null, max 300), `research_focus_ar` for the purpose picker (US7)
- [X] T008 Create `lib/db/client.ts`: Neon serverless driver when `DATABASE_URL` is set; embedded PGlite (auto-migrate and auto-seed) when unset and `NODE_ENV !== "production"`; throw in production when `DATABASE_URL` is missing (fail closed); export a single `db` and a transaction helper
- [X] T009 Generate the initial migration into `drizzle/` with `npm run db:generate`, then add custom SQL to it for the `order_number_seq` sequence (start 100000), the `store_settings` single-row check, and a check that at least one localized name exists; verify `npm run db:migrate` applies cleanly on PGlite
- [X] T010 [P] Create `lib/money.ts`: `formatMoney(minor, locale)` using `Intl.NumberFormat` with currency ILS (₪), plus `toMinor`/`fromMinor` helpers
- [X] T011 [P] Create `lib/i18n-fields.ts`: `pick(row, field, locale)` returning the `_<locale>` value or falling back to the other language when empty (FR-040)
- [X] T012 [P] Create `lib/db/queries/settings.ts`: `getSettings()` returning the single row with defaults if missing
- [X] T013 [P] Create `lib/db/queries/catalog.ts`: public queries `listBrandsWithProducts({categorySlug?, brandSlug?, listedOnly?, page})` (24 per page), `getProduct(brandSlug, slug)`, `listCategories()`, `listActiveBrands()`, `listFeatured()`; visibility rule everywhere: product `status = 'published'` AND brand `is_active` AND category `is_active` for category filters (FR-007)
- [X] T014 Create `scripts/seed.ts` (idempotent): brand "PEP Lab" as an ordinary row, placeholder research-area categories with neutral placeholder descriptions and `research_focus` lines (client to replace; no health or human-use wording), 10 products taken from the current static `lib/products.ts` content with `price_minor` null, default `store_settings`, and `pages` rows seeded from `lib/legal-content.ts` with `is_placeholder = true`; no brand-specific logic
- [X] T015 [P] Create `lib/rate-limit-db.ts`: fixed-window counter on `rate_limits` (`checkLimit(key, {max, windowMs})`, opportunistic cleanup of old windows), keys such as `order:ip:<hash>`
- [X] T016 [P] Create test helper `tests/unit/helpers/test-db.ts` that creates a fresh PGlite database with migrations and seed for each test file
- [X] T017 [P] Unit tests in `tests/unit/money.test.ts`, `tests/unit/i18n-fields.test.ts`, `tests/unit/catalog-queries.test.ts` (draft/unpublished/inactive-brand/inactive-category hidden; category filter groups by brand; `listedOnly` excludes null prices; pagination) and `tests/unit/rate-limit-db.test.ts`

**Checkpoint**: Migrations apply, seed loads, foundation tests pass; stories can start

---

## Phase 3: User Story 1 - Browse and find peptide products (Priority: P1) 🎯 MVP

**Goal**: A read-only bilingual storefront: home, shop grouped by brand with filters, category and brand pages, product detail pages, all from the database.

**Independent Test**: With seeded data, open `/en/shop`, confirm products are grouped under PEP Lab, filter by a research area and by "price listed", open a product page, and confirm a draft product's URL shows the unavailable page.

### Tests for User Story 1

- [X] T018 [P] [US1] Playwright test `tests/e2e/browse.spec.ts`: shop grouping without clicking a brand, category filter shows only matching products and brands, price-listed filter, product page content, unavailable page for unpublished product, placeholder image when no image
- [X] T019 [P] [US1] Unit test `tests/unit/product-metadata.test.ts` for `generateMetadata` helpers (title, description, Open Graph, language alternates)

### Implementation for User Story 1

- [X] T020 [P] [US1] Adapt `components/product-card.tsx` to take a DB product (image or `components/vial-glyph.tsx` placeholder, name, brand, price if listed, availability status, CTA) using `lib/i18n-fields.ts` and `lib/money.ts`
- [X] T021 [P] [US1] Create `components/store/brand-group.tsx` (brand heading + responsive product grid) and `components/store/filters.tsx` (brand, research area, price-listed; combinable via query string; touch-sized controls)
- [X] T022 [P] [US1] Create `components/store/category-chips.tsx` for research-area navigation
- [X] T023 [P] [US1] Create `components/store/unavailable.tsx` friendly unavailable state used for unpublished/inactive/missing catalog items (FR-007, FR-045)
- [X] T024 [US1] Implement `app/[locale]/shop/page.tsx`: grouped-by-brand list from `lib/db/queries/catalog.ts` with filters, pagination (24 per page), empty state, and clear indication of which brands have products in a selected category
- [X] T025 [US1] Implement `app/[locale]/categories/[slug]/page.tsx` and `app/[locale]/brands/page.tsx`, `app/[locale]/brands/[slug]/page.tsx` with `generateMetadata`
- [X] T026 [US1] Implement `app/[locale]/products/[brand]/[slug]/page.tsx`: name, brand, image gallery via `next/image` (lazy below fold), price when available, description, research areas, usage/handling info and warnings when present, vial size via `components/ltr-value.tsx`, purity/COA only when present, research-use disclaimer via `components/disclaimer-banner.tsx`; HTTP 404 with `components/store/unavailable.tsx` when not visible; `generateMetadata` and JSON-LD without price when unpriced
- [X] T027 [US1] Rewrite `app/[locale]/page.tsx` home: hero with Shop CTA, research areas, featured products, active brands, all from the database
- [X] T028 [US1] Update `components/site-header.tsx` and `components/site-footer.tsx` navigation to Home, Shop, Research Areas, Brands, Contact (keep language switcher; cart badge added in US2)
- [X] T029 [US1] Create `app/sitemap.ts` from the database (published products, active brands and categories, both locales, with alternates)
- [X] T030 [P] [US1] Add storefront browse strings to `messages/en.json` and `messages/ar.json` (nav, shop, filters, empty/unavailable states, product labels) keeping key parity

**Checkpoint**: US1 is independently demoable as a read-only store

---

## Phase 4: User Story 2 - Order with cash on delivery (Priority: P1)

**Goal**: Cart, checkout with 18+/research-use acknowledgment, server-priced order creation, confirmation and store email; no accounts.

**Independent Test**: Add two priced products (set prices in seed/test data), change a quantity, remove one, complete checkout, see the confirmation with order number, the order row in the database, and the logged notification email.

### Tests for User Story 2

- [X] T031 [P] [US2] Unit tests `tests/unit/price-cart.test.ts`: totals from DB only, unpriced/unavailable lines flagged and excluded, quantity clamped to `max_line_quantity`, delivery fee from settings (0 default, ignored when `delivery_enabled` false)
- [X] T032 [P] [US2] Unit tests `tests/unit/place-order.test.ts`: totals ignore any client prices, `acknowledged` false → `ACK_REQUIRED`, unpriced line → `ITEM_UNPRICED`, unpublished → `ITEM_UNAVAILABLE`, snapshots stored, same `idempotencyKey` returns same order (no duplicate), rate limit → `RATE_LIMITED`, email failure still returns success with `notification_status = failed`
- [X] T033 [P] [US2] Unit tests `tests/unit/order-schema.test.ts` (phone normalization E.164, name 2-120, address 5-500, notes max 1000, max 30 lines, error codes) and rewrite `tests/unit/cart-store.test.tsx` for the `{productId, quantity}` cart (still calling `__resetCartStoreForTests()` in `beforeEach`)
- [X] T034 [P] [US2] Playwright test `tests/e2e/checkout.spec.ts`: full mobile journey, ack unticked blocked, tampered cart storage still yields server prices, double-click confirm creates one order, confirmation blocked without token

### Implementation for User Story 2

- [X] T035 [US2] Rewrite `lib/cart-store.tsx`: module singleton with `useSyncExternalStore`, `localStorage` key `peptides:cart`, stores only `{productId, quantity}`, cached empty server snapshot, `CartProvider`/`useCart()`, export `__resetCartStoreForTests()`
- [X] T036 [P] [US2] Create `lib/schemas/order.ts` (Zod) with short error codes `required`, `invalidPhone`, `ackRequired`, etc.: name 2-120, phone valid E.164 via `libphonenumber-js` (accept Arabic-Indic digits), address 5-500, notes max 1000, quantity 1..max, at most 30 lines, `acknowledged` must be true, `idempotencyKey` uuid
- [X] T037 [US2] Create `lib/pricing.ts` `priceCart(items)` per `contracts/server-actions.md` (reads DB and `store_settings` only; returns lines with `status: ok｜unpriced｜unavailable`, `subtotalMinor`, `deliveryFeeMinor`, `totalMinor`, `canCheckout`)
- [X] T038 [US2] Create `lib/orders.ts` `placeOrder`: rate limit via `lib/rate-limit-db.ts` (default 5 per IP per 10 minutes), validate, single transaction (reload products, reject unpriced/unavailable/`PRICE_CHANGED`, compute totals, order number from `order_number_seq` formatted `PC-<n>`, insert order with `acknowledged_at`, `locale`, `access_token`, snapshot items), idempotency by `idempotency_key`; after commit call the notification and store `notification_status`/`notification_error`
- [X] T039 [P] [US2] Create `lib/order-email.ts` adapting `lib/email.ts` (Resend; dev console fallback when `RESEND_API_KEY` unset): recipient `store_settings.email` falling back to `ORDER_NOTIFICATION_EMAIL`; subject `New order <orderNumber>`; body per `contracts/server-actions.md`
- [X] T040 [US2] Create server actions in `app/[locale]/checkout/actions.ts` (`"use server"`): `priceCartAction`, `placeOrderAction`, `getOrderForConfirmation` returning code-based errors only (no internals)
- [X] T041 [P] [US2] Create `components/store/quantity-stepper.tsx` (touch-sized, min 1, max from settings) and `components/store/add-to-cart.tsx` (shown only for priced products); wire into `app/[locale]/products/[brand]/[slug]/page.tsx` and `components/product-card.tsx`
- [X] T042 [P] [US2] Create `components/store/order-summary.tsx` (subtotal, delivery fee or "Free delivery", total) and blocked-item messaging with links to contact the store
- [X] T043 [US2] Implement `app/[locale]/cart/page.tsx`: lines (image, name, brand, unit price, quantity, line total, remove), summary, empty state, unavailable/unpriced line handling, price-changed notice
- [X] T044 [US2] Implement `components/store/checkout-form.tsx` and `app/[locale]/checkout/page.tsx`: name, phone, address, notes, cash-on-delivery statement, research-use disclaimer, required 18+/research-use checkbox, review step, confirm; `react-hook-form` + Zod resolver with `translateFieldError`-style code mapping (never render raw codes); disable button while submitting; network error retry message
- [X] T045 [US2] Implement `app/[locale]/order/[orderNumber]/page.tsx` confirmation (requires `t` access token, `noindex`, shows order number, items, totals, COD, research-use disclaimer)
- [X] T046 [US2] Add cart icon with item count to `components/site-header.tsx` and mount `CartProvider` in `app/[locale]/layout.tsx`
- [X] T047 [P] [US2] Add cart/checkout/confirmation/error strings to `messages/en.json` and `messages/ar.json` (including `errors.*` codes) keeping parity

**Checkpoint**: US1 + US2 give a working COD store with seeded prices

---

## Phase 5: User Story 3 - Admin manages the catalog (Priority: P1)

**Goal**: Authenticated admin can manage brands, research areas, products, prices, images and publish status without code changes.

**Independent Test**: Sign in, create a brand, a category, and an unpriced two-image product, publish it and see it on `/en/shop`; unpublish it and confirm the direct URL shows the unavailable page; unauthenticated access to any admin route is denied.

### Tests for User Story 3

- [X] T048 [P] [US3] Unit tests `tests/unit/admin-auth.test.ts`: scrypt hash/verify, signed cookie forge/expiry rejection, lockout after 5 failures for 15 minutes, `requireAdmin()` denies without session
- [X] T049 [P] [US3] Unit tests `tests/unit/product-schema.test.ts` (price null valid; price must be >= 1 and <= 10,000,000; slug `a-z0-9-` 2-60 chars; at least one language name; image count ≤ 10) and `tests/unit/admin-actions.test.ts` (every action returns `UNAUTHORIZED` without a session; `deleteProduct` → `HAS_ORDERS` when ordered)
- [X] T050 [P] [US3] Playwright test `tests/e2e/admin-catalog.spec.ts`: redirect to login, login, create brand/category/product with no price, publish, appears on storefront, unpublish hides, deactivate brand hides products and reactivation restores, price edit does not change an existing order snapshot

### Implementation for User Story 3

- [X] T051 [US3] Create `lib/admin-auth.ts`: scrypt password hashing (per-user salt, params embedded), HMAC-signed session cookie (HttpOnly, Secure in production, SameSite=Lax, 12 h, secret `ADMIN_SESSION_SECRET` required in production), DB-backed failed-attempt lockout (5 failures → 15 minutes) per email and IP, `requireAdmin()`
- [X] T052 [P] [US3] Create `scripts/create-admin.ts` (email/password from prompt or `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`, refuses weak passwords under 12 characters)
- [X] T053 [P] [US3] Create Zod schemas in `lib/schemas/brand.ts`, `lib/schemas/category.ts`, `lib/schemas/product.ts` following `data-model.md` limits verbatim (brand description max 2000; product name max 160, description max 4000; slug unique per brand; price integer range or null; status enum)
- [X] T054 [US3] Create `app/admin/actions/auth.ts` (`adminLogin`, `adminLogout`, generic `INVALID_CREDENTIALS`) and `app/admin/login/page.tsx`
- [X] T055 [US3] Create `app/admin/layout.tsx` (auth gate redirecting to `/admin/login`, navigation for Dashboard, Orders, Products, Brands, Categories, Pages, Settings, logout) and shared `components/admin/data-table.tsx`
- [X] T056 [P] [US3] Create `app/admin/actions/brands.ts` (`saveBrand`, `setBrandActive`) and pages `app/admin/brands/page.tsx`, `app/admin/brands/[id]/page.tsx`; each action calls `requireAdmin()` first and revalidates storefront paths
- [X] T057 [P] [US3] Create `app/admin/actions/categories.ts` (`saveCategory`, `setCategoryActive`) and `app/admin/categories/page.tsx`, `app/admin/categories/[id]/page.tsx`
- [X] T058 [US3] Create `app/api/admin/blob-upload/route.ts`: `requireAdmin()`, Vercel Blob client-upload token, allow `image/jpeg`, `image/png`, `image/webp`, max 5 MB
- [X] T059 [US3] Create `app/admin/actions/products.ts` (`saveProduct`, `setProductStatus`, `deleteProduct` blocked with `HAS_ORDERS`, `addProductImage`, `reorderProductImages`, `removeProductImage` also deleting the blob; image URL must be on the configured Blob host)
- [X] T060 [US3] Create `components/admin/product-form.tsx` and `components/admin/image-manager.tsx` (upload, reorder, remove, alt text) with editor hint that copy must be research-use only with no dosage or therapeutic claims, and pages `app/admin/products/page.tsx`, `app/admin/products/new/page.tsx`, `app/admin/products/[id]/page.tsx`
- [X] T061 [US3] Create `lib/db/queries/admin.ts` admin listing/detail queries (including inactive/draft items)

**Checkpoint**: The owner can run the catalog independently

---

## Phase 6: User Story 4 - Unpriced products and WhatsApp contact (Priority: P2)

**Goal**: Unpriced products follow the store-wide setting; WhatsApp buttons use the configured number.

**Independent Test**: With an unpriced product, toggle the setting between `ask_price` and `hide_price`; verify card and page change, Add to Cart is absent, and the WhatsApp link has the configured number and product name; clearing the number hides all WhatsApp controls.

### Tests for User Story 4

- [X] T062 [P] [US4] Unit tests `tests/unit/whatsapp.test.ts`: digits-only number, URL-encoded localized message with product name (EN/AR), empty number returns null
- [X] T063 [P] [US4] Playwright test `tests/e2e/unpriced.spec.ts` covering both behaviors, no Add to Cart, WhatsApp href, hidden when number empty, cart with an injected unpriced item blocks checkout

### Implementation for User Story 4

- [X] T064 [P] [US4] Create `lib/whatsapp.ts` (`whatsappLink(settings, {product?, locale})`, format from `contracts/server-actions.md`)
- [X] T065 [P] [US4] Create `components/store/whatsapp-button.tsx` (renders nothing when no number) and `components/store/price-display.tsx` (price, or "Price unavailable" for `ask_price`, or nothing for `hide_price`)
- [X] T066 [US4] Create `components/store/product-actions.tsx` choosing Add to Cart (priced) vs Ask About Price / contact button (unpriced) from `store_settings.unpriced_behavior`; use it in `components/product-card.tsx` and the product page
- [X] T067 [US4] Add a site-wide WhatsApp contact button in `components/site-footer.tsx` and on `app/[locale]/contact/page.tsx` using store settings
- [X] T068 [P] [US4] Add WhatsApp/unpriced strings (message templates in EN and AR) to `messages/en.json` and `messages/ar.json`

**Checkpoint**: Unpriced products are usable and configurable

---

## Phase 7: User Story 5 - Admin processes orders and settings (Priority: P2)

**Goal**: Dashboard, order management with status changes, store settings, and editable legal pages.

**Independent Test**: Place an order, open it in admin, move it through statuses, set a delivery fee and confirm only new orders include it, edit a legal page in both languages and see it on the storefront.

### Tests for User Story 5

- [X] T069 [P] [US5] Unit tests `tests/unit/order-status.test.ts`: allowed transitions (`new → processing → out_for_delivery → completed`; `cancelled` from non-terminal states; terminal states immutable) and `tests/unit/settings-schema.test.ts` (fee >= 0, locales subset of `en`,`ar` including default, WhatsApp digits)
- [X] T070 [P] [US5] Playwright test `tests/e2e/admin-orders.spec.ts`: dashboard counts, open order details, status change, failed-email badge and resend, delivery fee applies to new orders only, legal page edit visible in EN and AR

### Implementation for User Story 5

- [X] T071 [P] [US5] Create `lib/schemas/settings.ts` and `lib/schemas/page.ts` (Markdown text, raw HTML never rendered) and `lib/db/queries/orders.ts` (list by status, detail, dashboard counts)
- [X] T072 [US5] Create `app/admin/page.tsx` dashboard (new orders, processing orders, product count, brand count; no analytics)
- [X] T073 [US5] Create `app/admin/actions/orders.ts` (`updateOrderStatus` enforcing transitions, `resendOrderEmail` updating `notification_status`) and pages `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx` with `components/admin/status-select.tsx`
- [X] T074 [US5] Create `app/admin/actions/settings.ts` (`saveSettings`) and `app/admin/settings/page.tsx` with `components/admin/settings-form.tsx` (store name, logo upload, phone, WhatsApp, email, address, delivery enabled and fee, unpriced behavior, default and supported languages)
- [X] T075 [US5] Create `app/admin/actions/pages.ts` (`savePage`) and `app/admin/pages/page.tsx` (per-language editor with preview and `is_placeholder` toggle)
- [X] T076 [US5] Replace static legal pages with DB-backed `app/[locale]/legal/[slug]/page.tsx` (terms, privacy, shipping-returns, product-disclaimer) and add `app/[locale]/about/page.tsx`, rendering Markdown with `react-markdown`; update footer links

**Checkpoint**: The owner can fulfil orders and configure the store

---

## Phase 8: User Story 6 - Bilingual, mobile-first experience (Priority: P2)

**Goal**: Full Arabic RTL and English LTR parity on mobile, language switching without data loss.

**Independent Test**: Complete the purchase journey at 375 px in Arabic, switch to English mid-checkout with nothing lost, and confirm no horizontal overflow on every journey page.

### Tests for User Story 6

- [ ] T077 [P] [US6] Update `tests/unit/messages-parity.test.ts` for the new namespaces and add a test that no `errors.*` code used by schemas is missing in either language
- [ ] T078 [P] [US6] Playwright test `tests/e2e/responsive-store.spec.ts`: 375 px viewport in `/en` and `/ar` across home, shop, product, cart, checkout, confirmation: no horizontal overflow, tap targets at least 44 px, `dir="rtl"` in Arabic; and `tests/e2e/language-switch.spec.ts`: switching language keeps cart and typed checkout fields

### Implementation for User Story 6

- [ ] T079 [US6] Create `lib/checkout-draft.ts` persisting typed checkout fields (never the acknowledgment or notes per project convention) in `sessionStorage` (try/catch guarded) and restore them in `components/store/checkout-form.tsx`
- [ ] T080 [US6] Update `components/locale-switcher.tsx` to keep the equivalent page (including query string) and product/brand/category slugs when switching
- [ ] T081 [P] [US6] Complete Arabic translations and RTL review of all storefront components in `messages/ar.json` and `components/store/*` (logical CSS properties, `components/ltr-value.tsx` around vial sizes, prices, phone numbers, order numbers)
- [ ] T082 [P] [US6] Fix any overflow or tap-target issues found by T078 across `app/globals.css` and storefront components; follow `DESIGN.md` and load the `/impeccable` craft floor before UI changes

**Checkpoint**: All six stories work in both languages on mobile

---

## Phase 9: User Story 7 - Find products by research purpose (Priority: P2)

**Goal**: A guided picker where the visitor chooses a research purpose (research area), sees what each area and each peptide is studied for, and is shown the related products. Framed strictly as laboratory research focus (Constitution I): no human-use goals, no dosage, no therapeutic claims; all wording client-approved.

**Independent Test**: Open `/en/start`, see each research purpose as a tile with its description, select one (or several), and see only related products grouped by brand, each card showing its research focus line; an area with no visible products is not offered.

### Tests for User Story 7

- [X] T083 [P] [US7] Unit tests `tests/unit/purpose-picker.test.ts`: `listPurposeTiles()` returns only active categories that have at least one visible product; selecting several purposes returns the union of products without duplicates, grouped by brand; inactive/draft/inactive-brand products excluded
- [X] T084 [P] [US7] Playwright test `tests/e2e/purpose-picker.spec.ts`: picker in `/en` and `/ar` at 375 px, select one and several tiles, results match, empty state, no consumer-health wording (fails if seed copy contains banned terms such as "dosage", "treat", "cure", "weight loss")

### Implementation for User Story 7

- [X] T085 [US7] Extend `lib/db/queries/catalog.ts` with `listPurposeTiles()` (name, slug, description, image, visible product count) and `listProductsByPurposes(slugs[], page)` reusing the visibility rule; extend `lib/schemas/category.ts` with `description_en` (max 500), `description_ar`, `image_url`
- [X] T086 [P] [US7] Create `components/store/purpose-picker.tsx` (large touch-sized tiles, multi-select, selection kept in the URL query `?purpose=a,b` so results are shareable and survive language switching) with the research-use framing note above the tiles
- [X] T087 [US7] Implement `app/[locale]/start/page.tsx`: picker + results grouped by brand using `components/store/brand-group.tsx`; each product card shows its `research_focus` line (fallback to first sentence of description if empty; nothing if both empty); empty and "no matching products" states; `generateMetadata`
- [X] T088 [US7] Link the picker from the home hero secondary CTA and the "Research Areas" nav item (`app/[locale]/page.tsx`, `components/site-header.tsx`), and add picker strings to `messages/en.json` and `messages/ar.json` (labels only; area names and descriptions come from the database)
- [X] T089 [US7] Extend admin: `description`/`image` fields on the category form (`app/admin/categories/[id]/page.tsx`, `app/admin/actions/categories.ts`) and `research_focus` (short, max 300, per language) on `components/admin/product-form.tsx` with a compliance hint (research focus only; no human-use, dosage or therapeutic claims)

**Checkpoint**: A visitor can start from a research purpose and land on related products

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Retire the old flow, security, docs, performance, final validation

- [ ] T090 Remove the retired quote/OTP flow: `app/[locale]/quote/`, `app/[locale]/signin/`, `components/quote-form.tsx`, `components/quote-summary.tsx`, `components/signin-form.tsx`, `components/phone-verification.tsx`, `components/vial-selector.tsx` (if unused), `lib/otp.ts`, `lib/session.ts` phone session usage, `lib/quote-schema.ts`, `lib/quote-storage.ts`, `lib/rate-limit.ts` (if no remaining users), static `lib/products.ts`, and their tests in `tests/unit/` and `tests/e2e/` (`quote-flow`, `signin-prefill`, `responsive-quote`); keep `data-request`, `feedback`, `contact`, cookie consent, and disclaimer components
- [ ] T091 Update `CLAUDE.md`, `PRODUCT.md` and `README.md` to the new product (multi-brand COD store, database, admin, retired quote flow, new commands and env vars) and refresh `.env.local.example`
- [ ] T092 [P] Security review of the diff: every admin action and the upload route call `requireAdmin()`, no `NEXT_PUBLIC_` secrets, generic user-facing errors, cookie flags, Server Action origin check still effective, rate limits on checkout and login (run `/security-review`)
- [ ] T093 [P] Accessibility pass on storefront and checkout in both languages (semantic headings, focus order, labels, contrast, alt text) and fix findings
- [ ] T094 [P] Performance check against SC-005: measure shop and category pages with 10 and 500 seeded products, confirm indexes are used and images lazy-load; add caching only if the target is missed
- [ ] T095 [P] Verify SEO output on product, category and brand pages (title, description, Open Graph, hreflang alternates, sitemap entries) for both locales
- [ ] T096 Document Vercel setup in `README.md`: provision Neon and Blob through the Marketplace, set env vars, run `db:migrate` and `admin:create` for production
- [ ] T097 Run `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npm run test`, `npm run test:e2e`, then execute every scenario in `quickstart.md` and record results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none
- **Foundational (Phase 2)**: needs Setup; blocks all stories
- **US1 (Phase 3)**: needs Foundational only (uses seed data)
- **US2 (Phase 4)**: needs Foundational; extends US1's product page and card (T041), so start after T026 and T020
- **US3 (Phase 5)**: needs Foundational; independent of US1/US2 for its own pages (its e2e uses the storefront from US1)
- **US4 (Phase 6)**: needs US1 (card/page) and Foundational settings; integrates with US2's add-to-cart (T041) and US3's settings editing lives in US5 (T074)
- **US5 (Phase 7)**: needs US2 (orders exist) and US3 (`requireAdmin`, admin layout)
- **US6 (Phase 8)**: needs US1 and US2 UI in place
- **US7 (Phase 9)**: needs US1 (brand groups, cards), the seeded categories, and US3's category and product forms for T089
- **Polish (Phase 10)**: needs all desired stories; T090 only after US2 is verified

### Within Each Story

Tests first (they should fail), then schemas/queries, then actions, then pages/components, then messages.

### Parallel Opportunities

- Setup: T003, T004, T005, T006
- Foundational: T010, T011, T012, T013, T015, T016, T017 after T007-T009
- US1: T020-T023 and T030 together; T018/T019 together
- US2: T031-T034 together; T036, T039, T041, T042, T047 together
- US3: T048-T050 together; T052, T053, T056, T057 together
- After Foundational, a second developer can start US3 while the first does US1 then US2

---

## Parallel Example: User Story 2

```bash
# Tests together
Task: "Unit tests tests/unit/price-cart.test.ts"
Task: "Unit tests tests/unit/place-order.test.ts"
Task: "Unit tests tests/unit/order-schema.test.ts"
Task: "Playwright tests/e2e/checkout.spec.ts"

# Independent files together
Task: "lib/schemas/order.ts"
Task: "lib/order-email.ts"
Task: "components/store/quantity-stepper.tsx and add-to-cart.tsx"
Task: "components/store/order-summary.tsx"
```

---

## Implementation Strategy

### MVP First

1. Setup + Foundational (T001-T017)
2. US1 browse (T018-T030): demoable read-only store
3. US2 COD orders (T031-T047)
4. US3 admin catalog (T048-T061): with US1-US3 the owner can run the catalog and take orders. **STOP and validate** with quickstart scenarios 1-3 and 5.

### Incremental Delivery

Then US4 (unpriced + WhatsApp), US5 (orders admin + settings + legal pages), US6 (bilingual/mobile hardening), then Polish including retiring the old quote flow. Launch requires all six stories, the client-supplied content, and a passing T097.

### Notes

- [P] tasks touch different files; commit after each task or logical group
- Retire old flows only in T090, after the new order flow works, so the site is never without an ordering path
- Client decisions still required before launch (from the brief): store name and logo, WhatsApp number, store email, final product data/images/prices, research-area list, unpriced behavior, delivery coverage, legal text, marketing copy

# Research: Multi-Brand Peptide Store

All Technical Context unknowns are resolved below. No `NEEDS CLARIFICATION` items remain.

## 1. Database

- **Decision**: Neon Postgres, provisioned through the Vercel Marketplace, accessed with the
  `@neondatabase/serverless` driver.
- **Rationale**: Constitution IV prefers Marketplace integrations. Relational data (orders,
  items, many-to-many categories, unique order numbers, transactions) fits Postgres. Neon works
  with Vercel Functions and gives branch databases for previews.
- **Alternatives**: SQLite/Turso (weaker transactions story on serverless, less standard);
  MongoDB (poor fit for relational orders); Vercel Postgres/KV (no longer offered).

## 2. Data access and migrations

- **Decision**: Drizzle ORM with `drizzle-kit` generating committed SQL migrations in
  `drizzle/`; `drizzle-kit migrate` runs at deploy/setup. Seed via `scripts/seed.ts`.
- **Rationale**: Small runtime, TypeScript-typed schema, plain SQL migrations that are
  reviewable, works with Neon and PGlite. The repo has no existing DB, so there is no
  migration strategy to preserve.
- **Alternatives**: Prisma (heavier engine, slower cold starts, more config); raw SQL with
  hand-written types (more error-prone for 10+ tables).

## 3. Local development and tests without external services

- **Decision**: When `DATABASE_URL` is unset and `NODE_ENV !== "production"`, use embedded
  PGlite (dev dependency) with migrations and seed applied automatically; tests always use
  PGlite. In production a missing `DATABASE_URL` fails closed.
- **Rationale**: Keeps the repo's current "run locally with no accounts" experience (like the
  existing email and OTP dev fallbacks) and makes Playwright hermetic.
- **Alternatives**: Docker Postgres (extra tool requirement on Windows); requiring a Neon dev
  branch for every contributor and CI run (network dependency, secrets in CI).
- **Risk**: two drivers could diverge. Mitigation: both speak Postgres through Drizzle; avoid
  driver-specific features; a CI job may run the same suite against a Neon branch.

## 4. Admin authentication

- **Decision**: Email + password stored as scrypt hashes (`node:crypto`) in an `admin_users`
  table; on success set an HttpOnly, Secure, SameSite=Lax signed cookie (HMAC, same pattern as
  the existing `lib/session.ts`, new secret `ADMIN_SESSION_SECRET`, 12-hour expiry). Failed
  attempts are counted per email and per IP in the database, locking further attempts for 15
  minutes after 5 failures. First admin created with `scripts/create-admin.ts` from env or
  prompt; no public sign-up.
- **Rationale**: One to three admins, no social login need. Reusing the signed-cookie pattern
  adds zero dependencies. Authorization is checked in the admin layout and again inside every
  Server Action via `requireAdmin()`, following the Next.js data-security guidance
  (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`), because layouts do not
  re-run on every action call.
- **Alternatives**: Auth.js (more surface and config for one role); Clerk/Descope (external
  vendor and cost for a handful of users); HTTP basic auth (poor UX, no lockout).

## 4b. Admin route placement and proxy

- **Decision**: Admin lives at `/admin` outside `[locale]`, English only. Update
  `proxy.ts` matcher to also exclude `admin` so `next-intl` does not redirect it. Add
  `X-Robots-Tag: noindex` and `robots.txt` disallow for `/admin`.
- **Rationale**: Spec requires bilingual storefront only; keeps admin strings out of message
  parity requirements.
- **Alternatives**: Localized admin (double the copy work with no requirement behind it).

## 5. Image storage

- **Decision**: Vercel Blob public store. Browser uploads directly to Blob using client-upload
  tokens minted by an authenticated route (`/api/admin/blob-upload`); accepted types JPEG,
  PNG, WebP; max 5 MB each; URLs are saved on the image row. Storefront renders through
  `next/image` (remote pattern for the Blob host). Removing an image row also deletes the blob.
- **Rationale**: Function request bodies are limited to ~4.5 MB, so uploads must bypass
  functions. Blob is Marketplace-native and needs one token env var.
- **Alternatives**: Storing files in Postgres (bloat, slow); Cloudinary/S3 (extra vendor and
  credentials).

## 5b. Product images placeholder and missing images

- **Decision**: A neutral `VialGlyph`-style placeholder (existing `components/vial-glyph.tsx`)
  is shown when a product has no image or an image fails to load.

## 6. Localized content

- **Decision**: Paired columns `name_en`/`name_ar`, `description_en`/`description_ar`, etc.
  Only English is required; Arabic is nullable. A helper `pick(row, field, locale)` returns the
  locale value or falls back to the other language. Slugs are language-neutral (Latin).
- **Rationale**: Two fixed locales; simple queries and admin forms; DB-level constraint that
  at least one language exists. Easy to validate and index.
- **Alternatives**: JSONB per field or a translations table (flexible for more languages but
  more complex; the spec says additional languages are a future need).

## 7. Money and currency

- **Decision**: Integer agorot (`price_minor`), one currency (ILS, shown as ₪) fixed in code
  configuration, not a setting. Formatting via `Intl.NumberFormat` with the active locale;
  the numeral value itself is wrapped in `LtrValue` in Arabic.
- **Rationale**: No floating point errors; single currency per spec.
- **Alternatives**: numeric/decimal type (fine, but integer is simpler in JS); multi-currency
  (out of scope).

## 8. Cart and server-authoritative pricing

- **Decision**: Keep the module-level `useSyncExternalStore` cart pattern, but store only
  `{ productId, quantity }` in `localStorage` (key `peptides:cart`). The cart and checkout
  pages call a server function `priceCart(items)` that returns current name, image, unit
  price, availability and totals; `placeOrder` calls the same function inside its transaction
  and ignores anything else from the browser.
- **Rationale**: Satisfies "never trust browser prices", handles price changes and
  unpublished products, and reuses the existing tested store shape (including the cached
  server snapshot rule from `CLAUDE.md`).
- **Alternatives**: Server-side cart in DB (needs anonymous session, more moving parts);
  storing prices in the cart (stale and untrusted).
- **Note**: "persist during the browsing session" is met by `localStorage`, which also
  survives reloads and language switches (FR-017, FR-041).

## 9. Order placement, numbering, idempotency

- **Decision**: `placeOrder` runs in one DB transaction: validate input, load products by ID,
  reject unpublished/unpriced/inactive-brand items, compute totals from `store_settings`,
  insert order + items. The order number comes from a Postgres sequence formatted like
  `PC-100234`. The checkout form sends a client-generated UUID `idempotencyKey` stored in a
  unique column so a double-submit returns the existing order. The confirmation URL contains a
  random `accessToken` so order details are not enumerable by order number.
- **Rationale**: FR-021, FR-022, FR-025. Sequence numbers are collision-free.
- **Alternatives**: Random order numbers (collision handling, not human-friendly);
  order-number-only confirmation URL (guessable, leaks customer PII).

## 10. Email notification

- **Decision**: Keep Resend and the existing dev fallback (log to console when
  `RESEND_API_KEY` is unset in development). The recipient is the store email from settings,
  falling back to `ORDER_NOTIFICATION_EMAIL`. Email is sent after the order commits; result is
  stored on the order (`notification_status`: `pending|sent|failed`, short error code). The
  admin order page shows failures with a "Resend email" action.
- **Rationale**: FR-026, SC-007: the order must not be lost if email fails, and the admin
  needs visibility.
- **Alternatives**: Queue/outbox worker (constitution IV forbids unless required); sending
  before commit (loses the order semantics).

## 11. Rate limiting

- **Decision**: Replace the in-memory limiter for orders and admin sign-in with a
  database-backed fixed-window counter (`rate_limits` table: key, window start, count),
  because in-memory state resets per serverless instance. The existing in-memory limiter file
  is removed with the quote flow. Defaults: 5 orders per IP per 10 minutes; 5 failed admin
  sign-ins per email/IP then 15-minute lock; all env-overridable.
- **Rationale**: Constitution VI. Reliable across instances with no new service.
- **Alternatives**: Vercel Firewall rate limiting (good addition, configured outside the
  repo, can be layered later); Upstash Redis (extra vendor).

## 12. CSRF and headers

- **Decision**: Keep the existing Server Action origin allow-list (`ALLOWED_ORIGINS`) and the
  recent CSRF hardening; admin cookie is SameSite=Lax; admin mutations are Server Actions only.
  Keep existing security headers (HSTS etc. from other branches) untouched by this feature.

## 13. Legal and informational pages as editable content

- **Decision**: A `pages` table (slug, title and body per language, updated time) seeded from
  the current `lib/legal-content.ts` text and placeholders for Terms, Privacy, Shipping &
  Returns, Product Disclaimer, About. Bodies are Markdown rendered with `react-markdown`
  (raw HTML disabled). Admin edits with a plain textarea and preview.
- **Rationale**: FR-010, FR-037 with minimal dependencies. Placeholder text carries a visible
  "pending client approval" note in admin, never presented as final legal advice.
- **Alternatives**: External CMS (constitution IV); rich-text editor (heavy for MVP).

## 14. Unpriced product behavior and WhatsApp

- **Decision**: `store_settings.unpriced_behavior` is `ask_price` or `hide_price`. A single
  `PriceDisplay` + `ProductAction` component pair reads it; both variants replace Add to Cart
  with a WhatsApp link built by `lib/whatsapp.ts`
  (`https://wa.me/<digits>?text=<encoded localized message with product name>`). When no
  WhatsApp number is set, the buttons are not rendered.
- **Rationale**: FR-011 to FR-013, FR-038; behavior is data, not code.

## 15. SEO

- **Decision**: `generateMetadata` on product, brand, category and legal pages (title,
  description, Open Graph, canonical, `alternates.languages`), `app/sitemap.ts` from DB
  (published products, active brands/categories, both locales), `robots.ts` disallowing
  `/admin`, and JSON-LD `Product` on product pages without price when unpriced. Product URL:
  `/[locale]/products/[brandSlug]/[productSlug]`. Slugs are unique per brand for products and
  globally for brands and categories; on rename, the old slug is not kept (acceptable at
  launch; noted as future redirect table).
- **Rationale**: Section 28 of the brief and the spec's FR-006.

## 16. Compliance adaptations of the brief

- **Decision**: Drop "what it does" and "who it is suitable for" product fields; keep
  description, research-area categories, handling/usage information (laboratory handling
  only), warnings, vial size, purity/COA. The initial category list is supplied by the client
  and framed as research areas; the seed uses neutral placeholders to be replaced.
- **Rationale**: Constitution I forbids therapeutic and human-use claims. Admin form shows a
  hint reminding editors of this rule.
- **Vial sizes**: One `vial_size` text per product; a peptide offered in several sizes is
  entered as separate products at launch. Variants are a listed future feature.

## 17. Retiring the previous flows

- **Decision**: Remove quote form/summary, phone verification, sign-in pages, Twilio
  variables, `lib/otp.ts`, phone-session cookie handling, quote storage, and their tests as
  part of implementation; keep `data-request`, `feedback`, `contact`, cookie-consent, and
  disclaimer components. Update `CLAUDE.md`, `PRODUCT.md`, and `.env.local.example` in the
  same change. Static `lib/products.ts` content becomes seed data.
- **Rationale**: Spec assumption; avoids two competing order flows. Specs 001 and 002 remain
  as historical records.

## 18. Caching and performance

- **Decision**: Storefront pages are Server Components using indexed queries and pagination
  (24 products per page, cursor/offset by `id`), served dynamically at launch. Add Next.js
  caching or ISR only if SC-005 measurements require it, following the version-matched docs in
  `node_modules/next/dist/docs/`. Images use `next/image` with explicit sizes and lazy
  loading below the fold.
- **Rationale**: 10 launch products on Neon are fast enough; avoiding premature caching
  removes invalidation bugs when admins edit data.
- **Alternatives**: Cache Components/PPR from day one (more complexity; revisit with data).

## 19. Environment variables

New: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_SESSION_SECRET` (required in
production), `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (used only by `create-admin`).
Kept: `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`, `ALLOWED_ORIGINS`, rate-limit overrides.
Removed: `TWILIO_*`, `PHONE_TOKEN_SECRET`, `OTP_*`. Secrets are never prefixed
`NEXT_PUBLIC_`.

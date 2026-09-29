# Pep Club — multi-brand peptide store

A responsive, bilingual (English + Arabic/RTL) storefront for research
peptides across multiple brands. Customers browse by brand and research
area, add priced products to a cart, and place a real **cash-on-delivery**
order — no account, no online payment anywhere. Store owners manage
brands, products, prices, categories, orders, settings, and legal pages
from a password-protected admin dashboard, with no code changes required.

See `.specify/memory/constitution.md` for the project's non-negotiable
principles (legal/compliance framing, cash-on-delivery only, bilingual UI,
database-driven catalog with nullable pricing, security), `PRODUCT.md` for
the brand/product context (including this product's history — it began as
a no-pricing "quote request" site), `DESIGN.md` for the visual system (the
"Vial-Label System") this UI implements, and
`specs/003-multi-brand-peptide-store/` for the full spec, plan, data model,
and task breakdown this app is built from.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000 (redirects to `/en`; try `/ar` for the Arabic,
RTL version). No external services are required: with `DATABASE_URL` unset,
the app uses an embedded Postgres (PGlite), applies migrations, and seeds
one brand, ten products, research-area categories, store settings, and
legal pages automatically on first run.

To sign in to the admin dashboard locally, create an admin user first:

```bash
npm run admin:create   # prompts for email/password, or set ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD
```

Then open http://localhost:3000/admin.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | No (dev) / **Yes** (prod) | Postgres connection string (Neon, via Vercel Marketplace). Unset in dev/test, the app falls back to an embedded PGlite database; in production a missing value makes the app refuse to start (fail closed). |
| `BLOB_READ_WRITE_TOKEN` | Only for image uploads | Vercel Blob read/write token used by the admin image uploader (`app/api/admin/blob-upload/route.ts`). |
| `ADMIN_SESSION_SECRET` | **Yes** (prod) | Long random string signing the admin session cookie (`pepclub_admin`). In development an insecure built-in fallback is used. |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` | No | Used only by `npm run admin:create` to create the first admin without an interactive prompt. |
| `RESEND_API_KEY` | No (dev) / Yes (to actually send email in prod) | Resend API key used to email new-order notifications to the store. If unset, `lib/order-email.ts` logs the email to the server console instead of sending — the full checkout flow is testable locally without a real key. |
| `ORDER_NOTIFICATION_EMAIL` | Yes (to actually receive orders) | Fallback inbox for new-order emails when no store email is set in admin Settings. |
| `ORDER_LIMIT_PER_IP` | No | Override for the checkout rate limit (default 5 orders per 10 minutes per IP). |
| `LOGIN_LIMIT_PER_IP` | No | Override for the admin sign-in rate limit (default 10 attempts per 15 minutes per IP); per-account lockout (5 failures → 15 minutes) is fixed and separate. |
| `SUBMIT_LIMIT_PER_IP` | No | Override for the feedback/data-request form rate limit. |
| `ALLOWED_ORIGINS` | No | Extra hosts trusted by the Server Action CSRF origin check (comma-separated, host only). Only needed if a proxy/CDN rewrites `Host`. |

Set these as Vercel project environment variables for deployed
environments (`vercel env add`), or provision `DATABASE_URL` and
`BLOB_READ_WRITE_TOKEN` directly through the Vercel Marketplace (Neon
Postgres, Vercel Blob) — see **Deploying to Vercel** below.

## Testing

```bash
npm run test         # Vitest — pricing/order totals, schemas, i18n fallback, message parity, admin auth
npm run test:e2e     # Playwright — purchase journey, admin CRUD, unpriced behavior, EN + AR, mobile
```

`test:e2e` starts its own dev server with an in-memory PGlite database
seeded with two priced products and a test admin user, and raised rate
limits, so it needs no setup. The dev server compiles routes on first hit;
under the suite's 2 parallel workers this occasionally races two first-hit
route compiles into a transient failure — re-running the suite (or the
single failing file) resolves it and is not a product defect.

## Project structure

- `app/[locale]/` — bilingual storefront routes: home, shop, research-area
  picker (`/start`), categories, brands, product detail, cart, checkout,
  order confirmation, legal pages, about, contact.
- `app/admin/` — the (English-only) admin dashboard: login, dashboard,
  orders, products, brands, categories, pages, settings. Every route and
  every Server Action under `app/admin/actions/` calls `requireAdmin()`.
- `lib/db/schema.ts` — the full Drizzle schema (brands, categories,
  products, orders, store settings, admin users, ...); `lib/db/client.ts`
  picks Neon or embedded PGlite; `lib/db/queries/` holds the read queries.
- `lib/pricing.ts`, `lib/orders.ts` — server-only cart pricing and order
  placement; totals are always computed from the database, never trusted
  from the browser.
- `lib/cart-store.tsx` — the client-side cart (product ID + quantity only,
  in `localStorage`).
- `lib/schemas/` — Zod schemas for orders (customer-facing, translated
  through `messages/*.json`'s `errors` namespace) and for admin mutations
  (English-only, mapped through `components/admin/admin-form.tsx`).
- `messages/en.json` / `messages/ar.json` — all storefront UI strings; kept
  key-for-key in sync (enforced by `tests/unit/messages-parity.test.ts`).
- `scripts/seed.ts`, `scripts/create-admin.ts`, `scripts/migrate.ts` — CLI
  scripts backing the `db:seed`, `admin:create`, `db:migrate` npm scripts.

## Deploying to Vercel

1. Link the project (`vercel link`) and provision, through the Vercel
   Marketplace: a **Neon Postgres** database and a **Vercel Blob** store.
   Linking either integration sets `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN`
   as project environment variables automatically.
2. Set the remaining required variables from the table above
   (`ADMIN_SESSION_SECRET`, `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`)
   for Production (and Preview, if you want previews to send real email):
   `vercel env add ADMIN_SESSION_SECRET production`, etc.
3. Apply migrations against the provisioned database and create the first
   admin, either locally with `DATABASE_URL` pointed at the Neon
   connection string, or via `vercel env pull` into a local `.env.local`:
   ```bash
   vercel env pull .env.local
   npm run db:migrate
   npm run admin:create
   ```
4. Deploy (`vercel deploy --prod`, or push to the connected Git branch).
   Do **not** run `npm run db:seed` against production — it's meant for
   local/dev launch data only; populate the real catalog through the admin
   dashboard instead.

## Next.js version note

This project runs on a very new Next.js release (16.3.x). Version-matched
docs ship inside the package at `node_modules/next/dist/docs/` — check
there before assuming an API from older Next.js knowledge still applies
(e.g. the `middleware.ts` convention is now `proxy.ts`, which this project
already uses).

# Implementation Plan: Multi-Brand Peptide Store

**Branch**: `003-multi-brand-peptide-store` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-multi-brand-peptide-store/spec.md`

## Summary

Turn the existing single-brand quote-request site into a database-driven, multi-brand,
cash-on-delivery peptide store with an admin dashboard. The existing Next.js 16 App Router
app, `next-intl` EN/AR routing, Tailwind design system, Zod + react-hook-form pattern, Resend
email, and CSRF hardening are kept. New: Neon Postgres (Vercel Marketplace) accessed through
Drizzle with versioned SQL migrations, Vercel Blob for product images, and a self-contained
email + password admin sign-in (scrypt hashes, signed session cookie, DB-backed lockout).
The cart stores only product IDs and quantities in the browser; every price and total is
computed on the server, including at order placement. The quote form, phone one-time-code
sign-in, Twilio, and the static product catalog are retired. See [research.md](./research.md)
for decisions and alternatives.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 24 LTS, React 19.2, Next.js 16.3.5 (App Router)

**Primary Dependencies**: existing: next-intl, zod, react-hook-form, @hookform/resolvers,
libphonenumber-js, resend, Tailwind 4. New: drizzle-orm + drizzle-kit, @neondatabase/serverless,
@vercel/blob, react-markdown (legal pages). Dev-only: @electric-sql/pglite (local dev and tests).
Removed: Twilio-related code (none installed as a package), `lib/otp.ts`, `lib/session.ts`
phone-session usage.

**Storage**: Neon Postgres (production/preview) via Vercel Marketplace; Vercel Blob (public
store) for product and brand images and store logo; browser `localStorage` for cart
(product ID + quantity only). Money stored as integer agorot in a single currency (ILS).

**Testing**: Vitest (pricing/order calculation, schemas, localized-field fallback, unpriced
rules, message parity, admin guard) and Playwright (purchase journey EN/AR mobile, admin
CRUD, order status, unpriced behaviors, no-horizontal-overflow). Tests run against PGlite with
seeded data; no external service is needed.

**Target Platform**: Vercel (Fluid Compute, Node.js runtime); evergreen mobile and desktop
browsers.

**Project Type**: Single Next.js web application (storefront + admin in one project).

**Performance Goals**: first products visible < 2 s on a mobile connection with launch
catalog and comparable with 500 products (SC-005); indexed queries and paginated listings;
`next/image` for all catalog images.

**Constraints**: no card data or payment SDK (Constitution II); all totals server-side;
admin auth on every admin page and action; Arabic RTL first-class; no horizontal scrolling;
research-use-only copy and 18+ gate (Constitution I); Server Action body limits respected
(image uploads go directly to Blob, not through actions).

**Scale/Scope**: ~10 products at launch, architecture for hundreds; 1 currency; 1-3 admin
users; ~15 storefront routes and ~12 admin routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v2.0.0.

| Principle | Status | How the plan complies |
|---|---|---|
| I. Legal & Compliance First | PASS | Research-use disclaimer component on product, cart/review, confirmation; required 18+/research-use checkbox validated server-side and stored on the order (`acknowledged_at`); categories named as research areas; legal pages stored in DB and admin-editable, seeded with placeholders marked for client approval; no fabricated COA/batch data (fields nullable, shown only when supplied). |
| II. Cash-on-Delivery, No Online Payments | PASS | `payment_method` is a fixed enum with only `cod`; no payment SDK; server recomputes subtotal, fee, total from DB; order items snapshot name and unit price; COD message on checkout and confirmation. |
| III. Responsive, Accessible, Bilingual | PASS | Reuses `[locale]` routing, RTL layout, `LtrValue`; localized DB fields with fallback helper; messages EN/AR parity test kept; Playwright overflow checks in both locales. |
| IV. Simple, Maintainable Stack | PASS (justified) | DB, admin auth, admin dashboard and image storage are explicitly permitted. Chosen via Marketplace (Neon, Blob). Dependencies added: Drizzle (migrations + typed queries), Neon driver, Blob SDK, react-markdown. No queues, CMS, or extra services. Justification per dependency in research.md. |
| V. Database-Driven Catalog, Nullable Pricing | PASS | All catalog, settings, legal content in DB; `price_minor` nullable; unpriced products blocked from cart and checkout server-side; unpriced behavior and delivery fee read from `store_settings`; no brand special-casing (PEP Lab is a seed row). |
| VI. Security & Integrity | PASS | Admin layout + per-action `requireAdmin()` (defense in depth); Zod validation on every mutation; secrets only in env vars; generic error messages; DB-backed rate limiting on checkout and admin sign-in; existing Server Action origin (CSRF) check kept; admin cookie HttpOnly, Secure, SameSite=Lax. |

No violations, so Complexity Tracking is empty.

**Post-design re-check (after Phase 1)**: still PASS. The data model adds no payment fields;
`orders.notification_*` columns store only a status and a short error code, never secrets.

## Project Structure

### Documentation (this feature)

```text
specs/003-multi-brand-peptide-store/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 entities, relationships, state
├── quickstart.md        # Phase 1 run + validation guide
├── contracts/
│   ├── routes.md        # Public + admin route map and access rules
│   └── server-actions.md# Server Actions, inputs, outputs, error codes, email + WhatsApp formats
└── tasks.md             # Phase 2 (/speckit-tasks) - NOT created here
```

### Source Code (repository root)

```text
app/
├── [locale]/                     # storefront (EN/AR)
│   ├── layout.tsx                # existing: html lang/dir, providers
│   ├── page.tsx                  # home
│   ├── shop/page.tsx             # grouped-by-brand listing + filters + pagination
│   ├── categories/[slug]/page.tsx
│   ├── brands/page.tsx, brands/[slug]/page.tsx
│   ├── products/[brand]/[slug]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order/[orderNumber]/page.tsx   # confirmation (guarded by signed token)
│   ├── about/, contact/               # contact kept, about new
│   ├── legal/[slug]/page.tsx          # terms, privacy, shipping-returns, disclaimer (DB)
│   └── (existing) data-request/, feedback/
├── admin/                        # English-only, outside [locale]
│   ├── layout.tsx                # auth gate + nav
│   ├── login/page.tsx
│   ├── page.tsx                  # dashboard
│   ├── orders/, orders/[id]/
│   ├── products/, products/new/, products/[id]/
│   ├── brands/, categories/, pages/, settings/
│   └── actions/                  # "use server" mutations, each calls requireAdmin()
├── api/admin/blob-upload/route.ts # authenticated Blob client-upload token
└── sitemap.ts, robots.ts

components/
├── (kept/adapted) site-header, site-footer, locale-switcher, product-card, ltr-value,
│   disclaimer-banner, form-field
├── store/  price-display, add-to-cart, quantity-stepper, whatsapp-button, filters,
│           brand-group, category-chips, order-summary, checkout-form
└── admin/  data-table, product-form, image-manager, status-select, settings-form

lib/
├── db/     schema.ts, client.ts (Neon | PGlite), queries/ (catalog, orders, settings, pages)
├── money.ts, i18n-fields.ts (localized fallback), pricing.ts (server totals)
├── orders.ts (placeOrder core), order-email.ts (adapts email.ts), whatsapp.ts
├── admin-auth.ts (scrypt, session cookie, requireAdmin), rate-limit-db.ts
├── schemas/ (order, product, brand, category, settings, page)
└── (removed) otp.ts, phone-session usage, quote-*.ts, static products.ts

drizzle/                # generated SQL migrations (committed)
scripts/                # seed.ts (brand, categories, 10 products, settings, pages), create-admin.ts
messages/               # en.json, ar.json (kept in parity)
tests/unit/, tests/e2e/
```

**Structure Decision**: One Next.js project (no separate backend). Storefront stays under
`app/[locale]`; the admin lives at `app/admin` outside the locale segment and is excluded from
the `next-intl` proxy matcher, since the spec requires only storefront localization.
Server logic lives in `lib/` and Server Actions; there is no separate public REST API except
the authenticated Blob upload route.

## Complexity Tracking

No constitution violations to justify.

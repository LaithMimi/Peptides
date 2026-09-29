# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A responsive, bilingual (English + Arabic/RTL) Next.js multi-brand storefront
for research peptides, with real cash-on-delivery orders and an admin
dashboard. There is **no online payment gateway anywhere** — a customer
builds a cart, checks out with a cash-on-delivery order, and the business
fulfils it and collects payment on delivery. This is a hard product
constraint, not a missing feature — see `.specify/memory/constitution.md`
Principles I, II, and V before adding anything that looks like a card field,
a payment SDK, or a price that isn't computed from the database.

Every product, from every brand, is marketed strictly as "for
research/laboratory use only — not for human consumption," framed around
*research areas of interest* (never therapeutic or dosage claims). See
constitution Principle I before editing any product copy, disclaimer, or
the 18+/research-use acknowledgment gate. All catalog content (brands,
products, categories, prices, legal pages) is client-supplied or
client-approved and lives in the database — code MUST NOT special-case any
brand, product, or category.

This is a pivot from an earlier single-brand "quote request" version of the
site (specs `001-peptide-storefront`, `002-phone-signin-prefill`): the quote
form, phone one-time-code sign-in, and static product catalog have been
retired in favor of a database-driven catalog and real orders. The current
feature is `specs/003-multi-brand-peptide-store/`.

## Commands

```bash
npm run dev          # start dev server (redirects / -> /en); embedded DB auto-migrates + seeds
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit -p tsconfig.json   # type-check only (faster than build)
npm run test         # Vitest unit tests (tests/unit/)
npm run test:e2e     # Playwright e2e tests (tests/e2e/) — starts its own dev server

npm run db:generate  # generate a Drizzle migration from lib/db/schema.ts into drizzle/
npm run db:migrate   # apply drizzle/ migrations (tsx scripts/migrate.ts)
npm run db:seed      # seed brand, research-area categories, 10 products, settings, legal pages
npm run admin:create # create the first admin user (prompts, or ADMIN_SEED_EMAIL/PASSWORD)
```

Run a single Vitest file: `npx vitest run tests/unit/place-order.test.ts`.
Run a single Playwright test: `npx playwright test checkout.spec.ts`.

**No external services are required for local dev.** With `DATABASE_URL`
unset (and `NODE_ENV !== "production"`), `lib/db/client.ts` uses an embedded
Postgres (PGlite), auto-applies migrations, and auto-seeds the launch data —
see `lib/db/seed.ts`. In production, a missing `DATABASE_URL` fails closed
(the app refuses to start): never loosen that check. `lib/order-email.ts`
logs new-order notification emails to the server console when
`RESEND_API_KEY` is unset, so the full checkout flow is testable without a
real key — see `.env.local.example`. The Playwright config seeds an
in-memory PGlite database with two priced products and a test admin user,
and raises the rate limits, so `npm run test:e2e` needs no setup.

## Architecture

**Locale routing (`next-intl`)**: every storefront route lives under
`app/[locale]/...` (`en` or `ar`). `proxy.ts` (Next.js 16's replacement for
`middleware.ts` — see below) runs `next-intl`'s middleware to redirect `/`
to the default locale, validate the `[locale]` segment, and exclude `/admin`
(the admin dashboard is English-only and outside locale routing). `i18n/routing.ts`
declares the supported locales; `i18n/request.ts` loads the matching
`messages/<locale>.json` file. `app/[locale]/layout.tsx` sets
`<html lang dir>` (`dir="rtl"` for Arabic) and mounts
`NextIntlClientProvider` — client components can call `useTranslations()`
directly without prop-drilling messages. Both message files
(`messages/en.json`, `messages/ar.json`) **must stay key-for-key in sync**;
`tests/unit/messages-parity.test.ts` enforces this and also checks that
every short error code the customer-facing order schema can raise
(`lib/schemas/order.ts`) exists as an `errors.*` key in both files.

**Database (Drizzle + Postgres)**: `lib/db/schema.ts` defines every table
(`brands`, `categories`, `products`, `product_images`, `product_categories`,
`orders`, `order_items`, `store_settings`, `pages`, `admin_users`,
`rate_limits`) — see `specs/003-multi-brand-peptide-store/data-model.md` for
the full field list, constraints, and state machines. `lib/db/client.ts`
picks Neon serverless Postgres when `DATABASE_URL` is set, or embedded
PGlite otherwise (dev/test only). Money is stored as integer agorot
(smallest currency unit, ILS) — `lib/money.ts` formats it and converts
to/from major units; `price_minor` on a product is **nullable**, and an
unpriced product can never be added to a cart that checks out (server-side
rule, not just UI). `lib/i18n-fields.ts` picks the `_<locale>` value of a
localized DB field, falling back to the other language when blank.
`lib/db/queries/` holds the read queries (`catalog.ts` public browsing +
purpose-picker, `orders.ts`, `settings.ts`, `admin.ts` for admin listings
that include drafts/inactive rows) — the visibility rule for anything
customer-facing is always: product `status = 'published'` AND brand
`is_active` AND (for category filters) category `is_active`.

**Cart, pricing and orders — server is the only source of truth**:
`lib/cart-store.tsx` is a client-side `localStorage` singleton
(`useSyncExternalStore`, `CartProvider`/`useCart()`) that stores **only**
`{productId, quantity}` — never a price. `lib/pricing.ts` (`priceCart`) and
`lib/orders.ts` (`placeOrder`) always re-read the product and
`store_settings` from the database; a client-submitted price or total is
never trusted, even if the browser's `localStorage` is tampered with.
`placeOrder` runs in one transaction, rejects unpriced/unavailable lines and
stale prices (`PRICE_CHANGED`), snapshots product name/brand/vial/unit price
onto `order_items` (so an order stays accurate after a later price edit),
allocates the order number from a Postgres sequence (`PC-<n>`), and is
idempotent on `idempotencyKey` (a retried submit returns the same order
instead of creating a second one). Order status is a fixed state machine
(`new → processing → out_for_delivery → completed`, or `cancelled` from any
non-terminal state; terminal states are immutable) — see
`lib/db/queries/orders.ts` / `app/admin/actions/orders.ts`. `app/[locale]/checkout/actions.ts`
(`"use server"`) exposes `priceCartAction`, `placeOrderAction`, and
`getOrderForConfirmation`, returning only short error codes (never internal
details) — the confirmation page requires a signed `access_token` in its
query string.

**No customer accounts**: there is no customer sign-in of any kind (the
earlier phone-OTP sign-in from spec 002 is retired). `lib/checkout-draft.ts`
keeps what a customer has *typed* at checkout (name, phone, address only —
never the 18+ acknowledgment or notes) in `sessionStorage` across a reload
or language switch; nothing is remembered across browser sessions.

**Admin dashboard (`app/admin/`, outside `[locale]`)**: email + password
sign-in (`lib/admin-auth.ts`: scrypt password hashing, HMAC-signed
`pepclub_admin` session cookie, DB-backed lockout after 5 failed attempts
for 15 minutes). `app/admin/layout.tsx` is an auth gate; **every** admin
Server Action and the image-upload route additionally call `requireAdmin()`
themselves (defense in depth — never rely on the layout alone). Admin
manages brands, categories, products (with images via Vercel Blob,
`app/api/admin/blob-upload/route.ts`), orders, store settings (delivery fee,
unpriced-product behavior, WhatsApp number, supported languages), and the
editable legal/about pages (`pages` table, rendered with `react-markdown`,
raw HTML is never rendered). See
`specs/003-multi-brand-peptide-store/contracts/routes.md` for the full
route and access-rule map.

**Unpriced products & WhatsApp**: whether an unpriced product shows "Ask
About Price" (WhatsApp) or hides its price entirely is the
`store_settings.unpriced_behavior` setting, never hardcoded per brand or
product. `lib/whatsapp.ts` builds the link from the configured number; an
empty number hides every WhatsApp control site-wide.

**Error-code translation pattern (customer-facing only)**: `lib/schemas/order.ts`
uses short codes as `message` (`"required"`, `"invalidPhone"`,
`"ackRequired"`, ...), never literal text — mapped through the `errors.*`
message namespace in `components/store/checkout-form.tsx` (never rendered
raw). **Admin forms are different by design**: the admin dashboard is
English-only (outside `next-intl`), so `lib/schemas/admin.ts`'s codes are
mapped through the plain-English `ADMIN_ERRORS`/`CODE_MESSAGES` maps in
`components/admin/admin-form.tsx`, not the `errors.*` namespace — don't try
to route admin errors through next-intl.

## Brand & design system

The site is **Pep Club** ("Premium Peptides"), not a generic placeholder —
see `PRODUCT.md` for product/brand truth and `DESIGN.md` for the visual
system ("the Vial-Label System": white/off-white ground, deep navy + one
cornflower-blue accent matched directly to the logo, die-cut label-shaped
cards as the one repeating UI unit). Read `DESIGN.md` before adding or
restyling any UI — it records
concrete Do's/Don'ts (e.g., no kicker/eyebrow lines above headings, no
fabricated batch/lot data, bidi-isolate Latin values like "10 mg" inside
Arabic text via `components/ltr-value.tsx`). This project uses the
`/impeccable` design skill (`.claude` skill, loaded from
`~/.claude/skills/impeccable`); load its `reference/craft-floor.md` before
any further UI work.

## Spec Kit workflow

This project is planned with [GitHub Spec Kit](https://github.com/github/spec-kit)
(`.specify/` + `.claude/skills/speckit-*`). Before starting non-trivial new
work, read `.specify/memory/constitution.md` (project principles) and
`specs/003-multi-brand-peptide-store/` (spec.md, plan.md, data-model.md,
contracts/, tasks.md) for the current feature. For a new feature, follow
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
rather than jumping straight to code. If a change conflicts with the
constitution (e.g., someone asks to "add a card payment option" or "special-case
this one brand"), flag the conflict rather than silently implementing it —
Principles I, II, V, and VI are explicitly load-bearing product decisions,
not oversights.

## Next.js version note

This project runs on Next.js 16.3.x, which is newer than most training
data. Version-matched docs ship inside the package at
`node_modules/next/dist/docs/` — check there (or `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`
for the meta-guide) before assuming an older-Next.js API/convention still
applies. Two things already changed and are handled correctly in this repo
— don't "fix" them back:

- The middleware file convention is now `proxy.ts` (default- or named-export
  `proxy`), not `middleware.ts`.
- `next.config.ts` sets `agentRules: false` because this file exists;
  otherwise `next dev` overwrites `AGENTS.md`/`CLAUDE.md` with its own
  generated pointer on every run.

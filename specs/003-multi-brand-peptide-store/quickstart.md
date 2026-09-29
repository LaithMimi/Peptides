# Quickstart: Validating the Multi-Brand Peptide Store

Run and validation guide. Entities are in [data-model.md](./data-model.md); actions and routes
in [contracts/](./contracts/).

## Prerequisites

- Node.js 24 LTS and `npm install`.
- No external accounts are needed locally: with `DATABASE_URL` unset (and not production) the
  app uses an embedded Postgres, applies migrations and seeds the launch data automatically.
- Optional for real services: copy `.env.local.example` to `.env.local` and set
  `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`,
  `ADMIN_SESSION_SECRET`.

## Setup commands

```bash
npm run db:migrate     # apply drizzle/ migrations
npm run db:seed        # PEP Lab, placeholder research areas, 10 products, settings, pages
npm run admin:create   # create the first admin (email/password from prompt or ADMIN_SEED_*)
npm run dev            # http://localhost:3000 -> /en ; admin at /admin
```

## Automated checks

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint
npm run test           # unit: pricing, order totals, schemas, i18n fallback, message parity
npm run test:e2e       # Playwright: purchase journey, admin, unpriced behavior, RTL, overflow
```

## Manual validation scenarios

1. **Catalog (US1)** - open `/en/shop`: products grouped under PEP Lab with no brand click
   needed. Select a research area: only its products remain. Filter "price listed": unpriced
   products disappear.
2. **Order (US2)** - add two priced products, change a quantity, remove one, go to checkout,
   leave the acknowledgment unticked and try to confirm (blocked with a translated message),
   tick it, confirm. Expect an order number, cash-on-delivery text, the research-use
   disclaimer, and a console-logged notification email (dev). Reload the confirmation link
   without its token: expect the unavailable page.
3. **Server-side totals (SC-003)** - in the browser devtools, tamper with the cart's stored
   quantities/prices, then place an order: totals on the order equal current DB prices.
4. **Unpriced (US4)** - in admin Settings switch unpriced behavior between "Ask About Price"
   and "Hide price": product cards and pages change, Add to Cart is absent, and the WhatsApp
   link contains the configured number and the product name. Clear the WhatsApp number: the
   buttons disappear.
5. **Admin catalog (US3)** - signed out, visit `/admin/orders`: redirected to login. Sign in;
   create a brand, a research area, and a product with no price and two images; publish it
   and see it on `/en/shop`; unpublish it and confirm its direct URL shows the unavailable
   page; change its price and confirm an earlier order keeps its old snapshot.
6. **Orders and settings (US5)** - open the new order, move it through the statuses; set a
   delivery fee and place another order (fee shown, earlier order unchanged); edit a legal
   page in both languages and see it on `/en/legal/terms` and `/ar/legal/terms`.
7. **Failure handling** - unset the email key with production-like config (or force a send
   error): the order is still saved, the visitor sees success, and the admin order shows a
   failed notification with "Resend email".
8. **Bilingual and mobile (US6)** - in a 375 px viewport, walk home → shop → product → cart →
   checkout → confirmation in `/ar` (RTL) and switch to English mid-checkout: cart and typed
   fields are preserved, no horizontal scroll, controls at least 44 px.
9. **Security** - five wrong admin passwords lock sign-in for 15 minutes; submitting the
   order endpoint six times in ten minutes from one IP returns the rate-limit message.

## Expected outcomes

All commands above pass; the scenarios produce the results described; success criteria
SC-001 to SC-010 in [spec.md](./spec.md) are met.

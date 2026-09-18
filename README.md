# Pep Club — storefront

A responsive, bilingual (English + Arabic/RTL) catalog site for research
peptides. There is no payment gateway and no published pricing — visitors
build a quote request and submit it; the business follows up by email with
pricing and next steps.

See `.specify/memory/constitution.md` for the project's non-negotiable
principles (legal/compliance framing, no payment processing, bilingual UI,
no published pricing), `specs/001-peptide-storefront/` for the full spec,
plan, and task breakdown this app was built from, `PRODUCT.md` for the
brand/product context, and `DESIGN.md` for the visual system ("the
Vial-Label System") this UI implements.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000 (redirects to `/en`; try `/ar` for the Arabic,
RTL version).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | No (dev) / Yes (prod) | Resend API key used to email quote requests to the business. If unset, `lib/email.ts` logs the request to the server console instead of sending — the full flow is testable locally without a real key. |
| `ORDER_NOTIFICATION_EMAIL` | Yes (to actually receive requests) | The business inbox that receives quote-request notification emails. |

Set these as Vercel project environment variables for deployed
environments (`vercel env add`).

## Testing

```bash
npm run test        # Vitest — schema validation, quote-cart logic
npm run test:e2e     # Playwright — full quote-request flow, EN + AR
```

## Project structure

- `app/[locale]/` — locale-segmented routes (catalog, product detail,
  quote request, confirmation), using `next-intl` for EN/AR routing and
  RTL layout.
- `lib/products.ts` — the static product catalog (no price field; see
  constitution Principle V). Update this file to add/edit products.
- `lib/quote-schema.ts` — the single Zod schema validated on both the
  client and the quote-request Server Action.
- `messages/en.json` / `messages/ar.json` — all UI strings; keep keys in
  sync between the two files.
- `app/[locale]/quote/actions.ts` — the only server-side logic in the app:
  validates and emails a submitted quote request.

## Next.js version note

This project runs on a very new Next.js release (16.3.x). Version-matched
docs ship inside the package at `node_modules/next/dist/docs/` — check
there before assuming an API from older Next.js knowledge still applies
(e.g. the `middleware.ts` convention is now `proxy.ts`, which this project
already uses).

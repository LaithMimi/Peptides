# Implementation Plan: Peptide Storefront (Catalog + Quote-Request Capture)

**Branch**: `001-peptide-storefront` | **Date**: 2026-09-17 (amended) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-peptide-storefront/spec.md`

## Summary

A responsive, bilingual (English + Arabic/RTL) Next.js storefront that lists
research peptide products with vial sizes, lets a visitor build a
quote-request (client-side cart, no account, no prices anywhere), gates
submission behind an 18+/research-use acknowledgment, and on submit sends
the full request by email to the business via a Server Action — no payment
processing, no published pricing, no database, no admin dashboard.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 (Vercel default runtime)

**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS,
`next-intl` (locale routing + RTL), Zod (form/schema validation), Resend
(transactional email), React Hook Form

**Storage**: N/A — product catalog is a local static TypeScript data module
(with per-locale content) committed to the repo; no database in v1
(constitution Principle IV)

**Testing**: Vitest + React Testing Library (unit/component), Playwright
(end-to-end quote-request flow smoke test, run against both locales)

**Target Platform**: Web (responsive: mobile/tablet/desktop; LTR + RTL),
deployed on Vercel

**Project Type**: Single Next.js web application with locale-segmented
routing (`app/[locale]/...`) — no separate backend

**Performance Goals**: Catalog and product pages interactive within 2s on a
typical mobile connection; no specific throughput target (low-traffic
storefront)

**Constraints**: No payment SDK, card-data field, or price/subtotal display
anywhere (Principles II & V); no horizontal scrolling from 320px–1920px in
either LTR or RTL (Principle III); research-use disclaimer must appear on
catalog, product, and quote-request pages (Principle I); every string
localized in English and Arabic (Principle III)

**Scale/Scope**: 10 real products (TB-500, Ipamorelin, CJC-1295,
Retatrutide, BPC-157, GHK-Cu, MOTS-C, KPV, Selank, Semax), each with a
single vial size in v1; low request volume (a single email send, not a
queue/pipeline)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Legal & Compliance First)**: PASS — disclaimer component
  rendered on catalog/product/quote pages in both locales; product copy
  uses "research area of interest" framing, not therapeutic claims; 18+
  acknowledgment enforced server-side.
- **Principle II (No Payment Processing)**: PASS — no payment SDK, no card
  fields, no price ever collected/shown; quote-request Server Action only
  sends email.
- **Principle III (Responsive, Accessible, Bilingual UI)**: PASS —
  `next-intl` drives EN/AR routing and message catalogs; `dir="rtl"` applied
  at the locale layout for Arabic; Tailwind logical properties used so
  spacing/alignment flip correctly; semantic HTML and keyboard-navigable
  controls in both languages.
- **Principle IV (Simple, Maintainable Stack)**: PASS — no database, no
  auth, no admin dashboard, no queue; static per-locale data module + one
  email send.
- **Principle V (Transparent Product Info, Quote-Request Pricing)**: PASS —
  data model requires name, vial size, and research-area copy per product;
  no price field exists anywhere; the quote-request flow is presented
  explicitly as a quote request, not a disguised purchase.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-peptide-storefront/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
i18n/
├── routing.ts                   # next-intl locale list (en, ar) + routing config
└── request.ts                   # next-intl request config (loads messages per locale)

messages/
├── en.json                      # UI strings: nav, disclaimers, form labels, errors
└── ar.json                      # Same keys, Arabic translations

app/
├── layout.tsx                   # Minimal root layout (delegates to [locale] layout)
├── [locale]/
│   ├── layout.tsx                 # Sets <html lang/dir>, header/footer, locale switcher
│   ├── page.tsx                   # Catalog (home) page
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx             # Product detail + vial/quantity selection
│   └── quote/
│       ├── page.tsx                  # Quote-request review + contact form
│       ├── actions.ts                 # Server Action: validate + send quote email
│       └── confirmation/
│           └── page.tsx                # Post-submit confirmation (or failure) state
└── middleware.ts                 # next-intl middleware for locale detection/routing

components/
├── product-card.tsx
├── vial-selector.tsx
├── disclaimer-banner.tsx
├── quote-form.tsx
├── quote-summary.tsx
└── locale-switcher.tsx

lib/
├── products.ts                  # Static product + vial catalog data (per-locale content)
├── quote-schema.ts              # Zod schema shared by client + Server Action
├── email.ts                     # Resend client wrapper (send quote-request email)
└── cart-store.ts                # Client-side quote-cart state (React context + localStorage)

types/
└── catalog.ts                   # Product/Vial/QuoteRequest/LineItem types

tests/
├── unit/                        # Vitest: schema validation, cart-store logic
└── e2e/                         # Playwright: browse → select vial → submit quote (EN + AR)
```

**Structure Decision**: Single Next.js App Router project with a
`[locale]` route segment handled by `next-intl` — this is the standard,
low-complexity pattern for bilingual Next.js sites and keeps Server Actions
as the only server-side logic (matches constitution Principle IV).

## Complexity Tracking

*No constitution violations — table not needed.*

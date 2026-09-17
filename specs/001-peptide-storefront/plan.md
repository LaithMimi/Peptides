# Implementation Plan: Peptide Storefront (Catalog + Order Capture)

**Branch**: `001-peptide-storefront` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-peptide-storefront/spec.md`

## Summary

A responsive Next.js storefront that lists research peptide products with
variants, lets a visitor build an order (client-side cart, no account), gates
submission behind an 18+/research-use acknowledgment, and on submit sends
the full order by email to the business via a Server Action — no payment
processing, no database, no admin dashboard.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 (Vercel default runtime)

**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS,
Zod (form/schema validation), Resend (transactional email), React Hook Form

**Storage**: N/A — product catalog is a local static TypeScript/JSON data
module committed to the repo; no database in v1 (constitution Principle IV)

**Testing**: Vitest + React Testing Library (unit/component), Playwright
(end-to-end order flow smoke test)

**Target Platform**: Web (responsive: mobile/tablet/desktop), deployed on
Vercel

**Project Type**: Single Next.js web application (no separate backend — the
Server Action/route handler layer inside the same app is the only "backend")

**Performance Goals**: Catalog and product pages interactive within 2s on a
typical mobile connection; no specific throughput target (low-traffic
storefront)

**Constraints**: No payment SDK or card-data field anywhere (Principle II);
no horizontal scrolling from 320px–1920px viewport widths (Principle III);
research-use disclaimer must appear on catalog, product, and order pages
(Principle I)

**Scale/Scope**: Small multi-product catalog (a handful of products, each
with a few variants); low order volume (order handling is a single email
send, not a queue/pipeline)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Legal & Compliance First)**: PASS — plan includes a
  disclaimer component rendered on catalog/product/order pages and a
  mandatory acknowledgment checkbox that blocks submission (data-model &
  contracts below enforce this server-side, not just client-side).
- **Principle II (No Payment Processing)**: PASS — no payment SDK, no card
  fields; order submission is a Server Action that only sends email.
- **Principle III (Responsive & Accessible UI)**: PASS — Tailwind +
  `/impeccable` design skill drive responsive layout; semantic HTML and
  keyboard-navigable form controls required in tasks.
- **Principle IV (Simple, Maintainable Stack)**: PASS — no database, no
  auth, no admin dashboard, no queue; static data module + one email send.
- **Principle V (Transparent Product Information)**: PASS — data model
  requires name, variants, price, and optional purity/COA per product; no
  hidden-fee or dark-pattern fields exist in the order flow.

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
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                  # Root layout: header, footer, disclaimer banner
├── page.tsx                    # Catalog (home) page
├── products/
│   └── [slug]/
│       └── page.tsx             # Product detail + variant/quantity selection
├── order/
│   ├── page.tsx                  # Order review + contact/shipping form
│   ├── actions.ts                # Server Action: validate + send order email
│   └── confirmation/
│       └── page.tsx               # Post-submit confirmation (or failure) state

components/
├── product-card.tsx
├── variant-selector.tsx
├── disclaimer-banner.tsx
├── order-form.tsx
└── cart-summary.tsx

lib/
├── products.ts                  # Static product + variant catalog data
├── order-schema.ts              # Zod schema shared by client + Server Action
├── email.ts                     # Resend client wrapper (send order email)
└── cart-store.ts                # Client-side cart state (React context + localStorage)

types/
└── catalog.ts                   # Product/Variant/Order/LineItem types

tests/
├── unit/                        # Vitest: schema validation, cart-store logic
└── e2e/                         # Playwright: browse → select variant → submit order
```

**Structure Decision**: Single Next.js App Router project — no separate
frontend/backend split is needed because Server Actions inside `app/order/`
serve as the only server-side logic (email send + validation). This matches
constitution Principle IV (simplest stack satisfying the requirement).

## Complexity Tracking

*No constitution violations — table not needed.*

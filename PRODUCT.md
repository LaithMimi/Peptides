# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two distinct user types. **Customers** are biohacking/fitness enthusiasts
interested in research peptides for personal experimentation, engaging
through research-use-framed language rather than medical claims; they
browse by brand, research area, and price, add priced products to a cart,
and pay cash on delivery — no account, no online payment. **The store
owner/admin** (1-3 people) runs the catalog, prices, brands, categories,
orders, and legal content from a password-protected admin dashboard,
without ever touching code.

## Product Purpose

Pep Club is a database-driven, multi-brand storefront for research
peptides. A customer builds a cart and completes a real cash-on-delivery
order (no card payment anywhere); the admin fulfils it. Success is a
correctly-priced, deliverable order the business can act on directly — not
a quote request that requires manual back-and-forth (that was the previous
version of this product; see "History" below).

## Positioning

Premium and verified (purity-backed) against generic bulk research-chemical
vendors, now presented as a proper multi-brand marketplace rather than a
single curated line: several peptide manufacturers ("brands") can be listed
side by side, each brand's products grouped and filterable by research area.
"Club" still implies an insider, community feel rather than a faceless
warehouse storefront, even as the catalog grows.

## Operating Context

Visitor browses the catalog (English or Arabic) grouped by brand and/or
research area → opens a product → adds it to a cart (quantity only, no
price is ever trusted from the browser) → reviews the cart (server-computed
subtotal, delivery fee, total) → checks out with name, phone, delivery
address, optional notes → confirms an 18+/research-use acknowledgment →
confirms the order is paid cash on delivery → submits. No sign-in, account,
or stored payment details of any kind. The order confirmation shows the
order number and is guarded by a signed access token in its link. The store
receives the order in the admin dashboard and a notification email, and
follows up to deliver and collect payment. A product without a price yet
follows a single store-wide setting: either "Ask About Price" (opens
WhatsApp with the product name prefilled) or hides its price and shows the
same contact button instead — never a checkout option.

## Capabilities and Constraints

- No online payment processing anywhere in the product — non-negotiable.
  Orders are real and stored, paid cash on delivery; totals are always
  computed server-side from the database, never trusted from the browser.
- Product price is nullable by design; an unpriced product can never be
  checked out, only asked about via WhatsApp.
- Bilingual English + Arabic with correct RTL layout is a first-class
  requirement of every storefront page, not an add-on. The admin dashboard
  itself is English-only (an internal tool, not customer-facing).
- Every product, from every brand, is framed strictly as "for
  research/laboratory use only — not for human consumption," described via
  research areas of interest, never therapeutic or dosage claims. No
  fabricated purity/COA/batch data — only what the client actually supplies.
- An 18+ and research-use acknowledgment is required, and enforced
  server-side, before any order can be placed.
- No customer accounts, passwords, or stored payment details anywhere.
  There *is* an admin dashboard (email + password, scrypt-hashed, signed
  session cookie) — a deliberate change from the original "no accounts at
  all" constraint, scoped to the store owner only.
- Brands, products, categories, prices, store settings, and legal pages all
  live in the database and are editable from the admin dashboard without a
  code change or deploy. Code must never special-case a specific brand,
  product, or category.
- Launches with one brand (PEP Lab) and 10 products, but the data model and
  UI are built for many brands and hundreds of products without changes.
- Stack: Next.js (App Router) + next-intl on Vercel, Postgres (Neon, via
  Vercel Marketplace) through Drizzle, Vercel Blob for images — already
  established by the current codebase.

## Brand Commitments

- Store name: **Pep Club**. Tagline: **Premium Peptides**.
- Logo asset: `public/brand/pep-club-logo.png` — a molecular "P" mark (a
  chain-of-dots motif suggesting a peptide bond) in deep navy with a single
  blue accent node, paired with the wordmark "PEP CLUB" (navy + blue) and
  "PREMIUM PEPTIDES" tagline beneath.
- The launch brand "PEP Lab" is an ordinary seeded brand row, not a
  hardcoded special case — more brands are added the same way, through the
  admin dashboard.
- **Standing visual-direction preference (confirmed in the storefront's
  third redesign pass):** the client wants the conventional, familiar
  e-commerce storefront pattern executed at real craft, not an experimental
  "world." Two structured direction rolls (the Vial-Label System, then the
  Glass Case) were tried and superseded; asked directly whether to keep
  rolling novel concepts or take the category standard, the answer was the
  standard, played straight. The named craft bar is **Apple.com** (restrained,
  high-contrast typography, minimal color, confident spacing) and
  **Sephora/Glossier-style beauty retail** (clean grid, strong product
  photography, understated chrome) — future storefront work should match
  that quality bar rather than reopening a new-work visual-world roll unless
  the client explicitly asks for one again.
- No other visual, voice, or asset commitments are fixed beyond `DESIGN.md`
  (the current storefront design system).

## Client Decisions Still Needed Before Launch

Per the original brief, these are still open and must be confirmed before
go-live (tracked in `specs/003-multi-brand-peptide-store/tasks.md`):
final store name/logo sign-off, the WhatsApp number, the store notification
email, final product data/images/prices for every brand, the research-area
list and copy, which unpriced-product behavior to default to, delivery
coverage area, final legal text (Terms, Privacy, Shipping & Returns, Product
Disclaimer, About), and any remaining marketing copy. Everything seeded
today (categories, product descriptions, legal pages) is placeholder text
marked `is_placeholder` for the client to review and replace from the admin
dashboard — never fabricated as if real.

## Evidence on Hand

Real, bilingual research-area product copy for the original 10-product
single-brand catalog exists in `lib/db/seed.ts` and `messages/{en,ar}.json`,
adapted from the business's own marketing captions. There are no customer
testimonials, case studies, COAs, or product photography on hand for the
launch catalog — future work must not fabricate these. The logo file above
is the only confirmed visual asset.

## Product Principles

1. Legal/compliance framing is never sacrificed for conversion polish
   (research-use-only copy, the 18+ acknowledgment gate, editable legal
   pages).
2. No online payment ever — cash on delivery is the entire commercial
   model; totals are always server-computed, never client-supplied.
3. The catalog, its prices, and its structure live in the database and are
   owned by the admin, not by a developer editing code.
4. Bilingual parity — Arabic is a first-class experience with real RTL
   layout, not a translated afterthought; the admin tool is intentionally
   the one English-only surface.
5. Premium, verified tone — purity and precision carry the brand more than
   hype, urgency, or dark patterns, even as the catalog scales to multiple
   brands.

## Accessibility & Inclusion

Standard web accessibility expectations apply (keyboard navigation,
sufficient contrast, semantic HTML, labeled controls) per this project's
constitution; no additional product-specific requirement has been
confirmed beyond that baseline.

## History

This product was originally built (specs `001-peptide-storefront`,
`002-phone-signin-prefill`) as a single-brand catalog with **no prices and
no orders at all**: a visitor built a "quote request" and the business
followed up manually by email, gated by a phone one-time-code sign-in.
Feature `003-multi-brand-peptide-store` (this document) is a deliberate
pivot, ratified in constitution v2.0.0: real priced products, real
cash-on-delivery orders, multiple brands, and an admin dashboard, backed by
a database instead of a static file. The quote-request flow, phone sign-in,
and static catalog have been fully retired — see
`.specify/memory/constitution.md` for the versioned rationale.

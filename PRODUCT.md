# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are biohacking/fitness enthusiasts interested in research
peptides for personal experimentation, engaging through research-use-framed
language rather than medical claims. They evaluate products by research-area
fit, vial size, and purity, then submit a quote request — there is no
on-site pricing or payment.

## Product Purpose

Pep Club presents a curated catalog of research peptides and lets a visitor
build a quote request (product + vial + quantity) that the business follows
up on by email with pricing. Success is a complete, accurate quote request
the business can act on directly — not a completed transaction.

## Positioning

Premium and verified (purity-backed) against generic bulk research-chemical
vendors. A small, deliberately curated catalog with a personal, high-touch
quote process — not a sprawling warehouse storefront. "Club" implies an
insider, community feel rather than a faceless shop.

## Operating Context

Visitor browses the catalog (English or Arabic) → opens a product → selects
a vial size + quantity → adds it to a quote-cart → fills in contact details
(name, email, one shipping-address line, optional notes) → confirms an
18+/research-use acknowledgment → submits. A visitor whose phone number is
not yet verified is sent to a sign-in step on Submit (SMS one-time code) and
returned to the same form; the verified browser is remembered for 30 days
and their name, email and address are prefilled next time (stored only in
their own browser). The business receives the request by email, with the
verified phone number and everything needed to ship once a quote is
accepted, and replies directly with pricing and next steps. There is no
payment step anywhere in this flow.

## Capabilities and Constraints

- No payment processing anywhere in the product — non-negotiable.
- No prices or subtotals are ever displayed or collected — non-negotiable.
- Bilingual English + Arabic with correct RTL layout is a first-class
  requirement of every page, not an add-on.
- Every product is framed strictly as "for research/laboratory use only —
  not for human consumption," described via research areas of interest,
  never therapeutic or dosage claims.
- An 18+ and research-use acknowledgment is required, and enforced
  server-side, before any quote request can submit.
- No user accounts, passwords, inventory tracking, admin dashboard, or
  database in the current scope — the notification email is the sole record
  of a request. The only sign-in is a phone-verified, 30-day signed browser
  cookie; remembered details never leave the visitor's browser.
- Current catalog: 10 products (TB-500, Ipamorelin, CJC-1295, Retatrutide,
  BPC-157, GHK-Cu, MOTS-C, KPV, Selank, Semax), each with one vial size
  today; the data model supports multiple vials per product.
- Stack: Next.js (App Router) + next-intl, deployed on Vercel — already
  established by the existing codebase.

## Brand Commitments

- Name: **Pep Club**. Tagline: **Premium Peptides**. This replaces the
  placeholder name "Aether Peptides" used in the initial build.
- Logo asset: `public/brand/pep-club-logo.png` — a molecular "P" mark (a
  chain-of-dots motif suggesting a peptide bond) in deep navy with a single
  blue accent node, paired with the wordmark "PEP CLUB" (navy + blue) and
  "PREMIUM PEPTIDES" tagline beneath. This is the confirmed identity to
  design around.
- No other visual, voice, or asset commitments are fixed; the redesign
  otherwise has full creative latitude.

## Evidence on Hand

Real, bilingual research-area product copy already exists in
`lib/products.ts` and `messages/{en,ar}.json`, adapted from the business's
own marketing captions. There are no customer testimonials, case studies,
COAs, or product photography on hand — future work must not fabricate
these. The logo file above is the only confirmed visual asset.

## Product Principles

1. Legal/compliance framing is never sacrificed for conversion polish
   (research-use-only copy, the 18+ acknowledgment gate).
2. No price or payment ever appears anywhere — the entire commercial model
   is a quote request, not a disguised checkout.
3. Curated over exhaustive — a small, well-presented catalog beats an
   overwhelming one.
4. Bilingual parity — Arabic is a first-class experience with real RTL
   layout, not a translated afterthought.
5. Premium, verified tone — purity and precision carry the brand more than
   hype, urgency, or dark patterns.

## Accessibility & Inclusion

Standard web accessibility expectations apply (keyboard navigation,
sufficient contrast, semantic HTML, labeled controls) per this project's
constitution; no additional product-specific requirement has been
confirmed beyond that baseline.

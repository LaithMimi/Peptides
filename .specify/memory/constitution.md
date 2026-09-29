<!--
Sync Impact Report (temporary; remove before committing)
- Version change: 1.1.0 → 2.0.0 (MAJOR: principles II, IV, V redefined; new Security principle)
- Product change: single-brand quote-request catalog → multi-brand peptide store with
  cash-on-delivery orders, database, and admin dashboard. Peptides only; brands are
  different peptide manufacturers.
- Modified principles:
  - I. Legal & Compliance First → kept research-use-only + 18+ gate; added client-approved
    content, required editable legal pages, no fabricated claims
  - II. No Payment Processing — Quote-Request Capture Only → II. Cash-on-Delivery Orders,
    No Online Payments
  - III. Responsive & Accessible, Bilingual UI → unchanged
  - IV. Simple, Maintainable Stack → now permits database, admin auth, admin dashboard,
    image storage
  - V. Transparent Product Information, Quote-Request Pricing → V. Database-Driven Catalog,
    Nullable Pricing
- Added: VI. Security & Integrity
- Removed: quote-request model (no published prices, no database)
- Follow-up TODOs: amend CLAUDE.md, PRODUCT.md and specs/001-002 references to the
  quote-request model once feature 003 is specified; existing 001/002 flows (quote form,
  phone sign-in) are superseded by this amendment and need a migration decision in the spec.
-->
# Peptides Constitution
<!-- Multi-brand research-peptide storefront: catalog, cash-on-delivery orders, admin dashboard -->

## Core Principles

### I. Legal & Compliance First (NON-NEGOTIABLE)
Every product, from every brand, MUST be marketed strictly as "for research/laboratory
use only — not for human consumption," with no dosage instructions, medical or therapeutic
claims, or language implying human use anywhere in copy, imagery, or metadata. Categories
MUST be framed as research areas of interest, never as consumer health goals. The site MUST
require an 18+ and research-use acknowledgment before an order can be submitted and MUST
display the research-use disclaimer on every product page, the cart and order review step,
and the order confirmation. All product content MUST be supplied or approved by the client;
no claims, purity figures, or batch data may be fabricated. Terms & Conditions, Privacy
Policy, Shipping & Returns, and Product Disclaimer pages are REQUIRED and MUST be editable
by the admin. Product warnings and disclaimers MUST be displayed wherever provided.
Legal/compliance requirements override UX or conversion preferences whenever the two
conflict.

### II. Cash-on-Delivery Orders, No Online Payments
The application creates and stores real orders that are paid in cash on delivery. It MUST
NOT integrate a payment gateway, collect card data, or store payment credentials in the MVP,
and no third-party payment SDK may be added without a constitution amendment. Order totals
(subtotal, delivery fee, total) MUST always be calculated on the server from current product
data and settings; client-submitted totals or prices MUST never be trusted. Order items MUST
snapshot product name and unit price so historical orders stay accurate. Cash-on-delivery
MUST be stated clearly before the customer confirms an order.

### III. Responsive & Accessible, Bilingual UI
All pages MUST render correctly and remain fully usable across mobile, tablet, and desktop
breakpoints, mobile-first, with no horizontal scrolling and touch-sized tap targets. The
site MUST be available in both English and Arabic, with Arabic rendered in correct
right-to-left (RTL) layout (not just mirrored text) — a first-class requirement, not a
future add-on. Localized content fields MUST fall back to the other language when a
translation is missing. UI work MUST follow the project's design skill (`/impeccable`) and
meet baseline accessibility (semantic HTML, keyboard navigation, sufficient color contrast,
alt text) in both languages.

### IV. Simple, Maintainable Stack
Default stack is Next.js (App Router) deployed on Vercel. A database, admin authentication,
an admin dashboard, and image storage are permitted because the product requires them;
prefer Vercel Marketplace integrations (e.g., Neon Postgres, Vercel Blob) and the smallest
set of dependencies that satisfies each requirement. Queues, external CMSs, microservices,
and other infrastructure MUST NOT be added unless a requirement cannot be met without them.
Features listed as out of scope in the active spec (customer accounts, coupons, inventory,
payments, etc.) MUST NOT be built prematurely.

### V. Database-Driven Catalog, Nullable Pricing
Brands, products, categories, store settings, and legal page content MUST live in the
database and be manageable from the admin dashboard without code changes. Code MUST NOT
special-case any brand, product, or category (no `if (brand === "...")`). Product price
MUST be nullable. A product without a price MUST NOT be purchasable through checkout; a cart
containing one MUST block checkout and direct the customer to contact the store. How
unpriced products are presented (hide price vs. "Ask About Price" via WhatsApp) MUST be a
store setting, not hardcoded. Delivery fee MUST be a store setting, never a hardcoded value.
Every product listing MUST clearly state name, brand, research-use vial size(s), and
purity/COA information when available. No dark patterns (hidden fees, forced continuity,
misleading urgency) may be used.

### VI. Security & Integrity
All admin routes and actions MUST require authentication, and customers MUST have no access
to admin APIs. Every mutation (products, prices, brands, categories, settings, orders) MUST
be validated on the server regardless of client-side validation. Secrets (admin credentials,
API keys, database URLs) MUST be managed via environment variables, never committed, and
never exposed to the client. Errors shown to users MUST NOT expose stack traces or internal
details. Order submission MUST be protected against abuse (rate limiting or equivalent) and
CSRF.

## Technology & Deployment Standards

Application: Next.js (App Router), deployed on Vercel, with a managed Postgres database and
object storage for product images, provisioned via the Vercel Marketplace where possible.
Schema changes MUST be made through versioned migrations. Order notifications are delivered
via a configurable transactional email provider (no hardcoded credentials). Environment
secrets MUST be managed via Vercel environment variables. Public product and category pages
MUST have slug-based URLs, page titles, meta descriptions, and Open Graph metadata. No
payment SDKs, PCI-scoped code, or card-data fields may be added (Principle II).

## Development Workflow

Features are planned with Spec Kit (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks`
→ `/speckit-implement`) before implementation. UI/UX decisions route through the
`/impeccable` skill. A feature is not done until it is verified across database, server
logic, validation, UI states (loading/error/empty), mobile, Arabic RTL, English LTR, and
end-to-end behavior. Every change touching product copy, disclaimers, or the order flow
MUST be checked against Principle I before merge.

## Governance

This constitution supersedes ad-hoc practices for this project. Amendments require:
(1) a documented rationale for the change, (2) a version bump per semantic versioning (MAJOR
for incompatible principle removal/redefinition, MINOR for new/expanded principles, PATCH
for clarifications), and (3) an updated Sync Impact Report. All plans and PRs MUST verify
compliance with these principles, especially Principles I, II, and VI; unresolved conflicts
block merge until resolved or the constitution is amended. `CLAUDE.md` provides runtime
development guidance.

**Version**: 2.0.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-25

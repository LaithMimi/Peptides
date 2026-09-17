<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - III. Responsive & Accessible UI → now also requires bilingual EN/AR
    support with correct RTL layout for Arabic
  - V. Transparent Product Information → price requirement removed;
    replaced with "quote request" model (business quotes price after
    contact, per real product content having no listed prices)
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none
-->
# Peptides Constitution
<!-- Direct-to-consumer research peptide storefront: catalog + order capture, no payment processing -->

## Core Principles

### I. Legal & Compliance First (NON-NEGOTIABLE)
Every product MUST be marketed strictly as "for research/laboratory use only —
not for human consumption," with no dosage instructions, medical claims, or
language implying human use anywhere in copy, imagery, or metadata. The site
MUST require an 18+ age acknowledgment before checkout and MUST display the
research-use disclaimer on every product page, the cart/order review step,
and the order confirmation. Legal/compliance requirements override UX or
conversion preferences whenever the two conflict.

### II. No Payment Processing — Quote-Request Capture Only
The application MUST NOT integrate a payment gateway, collect card data, or
process any transaction. The flow culminates in a quote-request submission
(captured and delivered via email notification per current scope) that the
business follows up on, quotes, and fulfills/invoices manually outside the
app. No component may store payment credentials, and no third-party payment
SDK may be added without a constitution amendment.

### III. Responsive & Accessible, Bilingual UI
All pages MUST render correctly and remain fully usable across mobile,
tablet, and desktop breakpoints, with no horizontal scrolling and touch-sized
tap targets. The site MUST be available in both English and Arabic, with
Arabic rendered in correct right-to-left (RTL) layout (not just mirrored
text) — this is a first-class requirement, not a future add-on. UI work
MUST follow the project's design skill (`/impeccable`) for visual/interaction
decisions and meet baseline accessibility (semantic HTML, keyboard
navigation, sufficient color contrast, alt text) in both languages.

### IV. Simple, Maintainable Stack
Prefer the smallest set of dependencies that satisfies a requirement. Default
stack is Next.js (App Router) deployed on Vercel, with no database unless a
future amendment changes the order-handling model. Do not introduce
infrastructure (queues, auth systems, admin dashboards, CMSs) that the
current scope (catalog browsing + quote-request submission) does not
require.

### V. Transparent Product Information, Quote-Request Pricing
Every product listing MUST clearly state name, research-use vial size(s),
purity/COA information when available, and its research-area framing
(Principle I). Prices are not published in-app; a customer requests a quote
by submitting their desired product(s)/vial(s)/quantity, and the business
follows up with pricing directly — this MUST be presented to the customer as
a normal "request a quote" flow, not disguised as a completed purchase. No
dark patterns (hidden fees, forced continuity, misleading urgency) may be
used in the catalog or quote-request flow.

## Technology & Deployment Standards

Application: Next.js (App Router), deployed on Vercel. Order submissions are
delivered via transactional email (no database in initial scope per
Principle IV). Environment secrets (e.g., email API keys) MUST be managed via
Vercel environment variables, never committed to the repository. No payment
SDKs, PCI-scoped code, or card-data fields may be added (Principle II).

## Development Workflow

Features are planned with Spec Kit (`/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`) before implementation. UI/UX
decisions route through the `/impeccable` skill. Every change touching
product copy, disclaimers, or the order flow MUST be checked against
Principle I (Legal & Compliance First) before merge.

## Governance

This constitution supersedes ad-hoc practices for this project. Amendments
require: (1) a documented rationale for the change, (2) a version bump per
semantic versioning (MAJOR for incompatible principle removal/redefinition,
MINOR for new/expanded principles, PATCH for clarifications), and (3) an
updated Sync Impact Report at the top of this file. All plans and PRs must
verify compliance with these principles, especially Principles I and II;
unresolved conflicts block merge until resolved or the constitution is
amended.

**Version**: 1.1.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-17

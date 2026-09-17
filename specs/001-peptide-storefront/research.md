# Phase 0 Research: Peptide Storefront

No `NEEDS CLARIFICATION` markers remained in the Technical Context — the
user specified the stack directly. This document records the rationale for
each choice and the alternatives considered, for future maintainers.

## Framework: Next.js (App Router) + TypeScript, on Vercel

- **Decision**: Next.js 15 App Router, TypeScript, deployed on Vercel.
- **Rationale**: Server Actions give a built-in, type-safe way to handle
  order submission without standing up a separate API service; Vercel is
  the target deploy platform; App Router is the current recommended Next.js
  pattern for new projects.
- **Alternatives considered**: A static site (e.g., Astro) with a serverless
  function for order email — rejected because Next.js Server Actions already
  provide this with less moving pieces, and the project may later want
  React interactivity (cart state, variant selection) that Next.js handles
  natively.

## Order storage: none (email-only) in v1

- **Decision**: No database. Orders exist only as the email sent to the
  business at submission time.
- **Rationale**: Matches the user's explicit choice ("email notification")
  and constitution Principle IV (simplest stack satisfying current scope).
- **Alternatives considered**: Postgres/Neon via Vercel Marketplace for an
  orders table + admin view — explicitly deferred; the user chose
  email-only over "database + admin dashboard" or "both."

## Email delivery: Resend

- **Decision**: Resend for transactional email from the Server Action.
- **Rationale**: First-party-friendly on Vercel, simple API, generous free
  tier, official React Email templates work well for formatting order
  details.
- **Alternatives considered**: Nodemailer + SMTP (more config, credential
  management overhead); SendGrid (heavier SDK for this simple use case).

## Form/validation: Zod + React Hook Form

- **Decision**: Zod schema shared between the client form and the Server
  Action for validation; React Hook Form for form state/UX.
- **Rationale**: A single Zod schema guarantees the server re-validates
  everything the client validates (required for FR-008 and to prevent
  bypassing the acknowledgment gate by calling the action directly).
- **Alternatives considered**: Native HTML validation only — rejected
  because it can't enforce server-side re-validation of the
  18+/research-use acknowledgment (Principle I is NON-NEGOTIABLE, so
  client-only enforcement is insufficient).

## Cart state: client-side (React context + localStorage)

- **Decision**: Cart (selected line items) lives in a React context backed
  by `localStorage`, cleared on successful order submission.
- **Rationale**: No accounts/sessions in scope (Assumptions in spec.md);
  `localStorage` lets a cart survive a page reload without server state.
- **Alternatives considered**: Server-side session/cookie cart — rejected
  as unnecessary complexity given guest-only, single-session use.

## Styling/design: Tailwind CSS + `/impeccable` skill

- **Decision**: Tailwind CSS utility classes, with layout/visual decisions
  guided by the `/impeccable` design skill per constitution Principle III.
- **Rationale**: User explicitly requested `/impeccable` for design; Tailwind
  pairs naturally with Next.js and keeps styling co-located with components.
- **Alternatives considered**: CSS Modules / styled-components — rejected,
  no reason to diverge from the Next.js + Tailwind default pairing.

## Testing: Vitest + React Testing Library + Playwright

- **Decision**: Vitest/RTL for unit/component tests (schema validation,
  cart logic, disclaimer rendering); Playwright for one end-to-end smoke
  test covering browse → select variant → submit order → confirmation.
- **Rationale**: Standard, low-overhead pairing for a Next.js app of this
  size; Playwright smoke test directly validates spec.md's Success Criteria
  (SC-001, SC-002, SC-004).
- **Alternatives considered**: Jest — Vitest chosen for faster local runs
  and native ESM/TS support with less config.

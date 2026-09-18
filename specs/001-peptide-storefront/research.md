# Phase 0 Research: Peptide Storefront

No `NEEDS CLARIFICATION` markers remained in the Technical Context — the
user specified the stack directly. This document records the rationale for
each choice and the alternatives considered, for future maintainers.

## Framework: Next.js (App Router) + TypeScript, on Vercel

- **Decision**: Next.js 16 App Router, TypeScript, deployed on Vercel.
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

## Spam protection: honeypot + in-memory per-IP rate limit

- **Decision**: A hidden honeypot field in the form (submissions that fill
  it are silently discarded, returning a normal-looking success so bots get
  no signal), plus a small in-memory fixed-window per-IP limiter
  (`lib/rate-limit.ts`, e.g. 5 submissions / 10 minutes) checked at the top
  of the Server Action. The client IP comes from the `x-forwarded-for`
  header via `headers()`. Exceeding the limit returns
  `RATE_LIMITED` with a localized retry-later message.
- **Rationale**: Chosen in clarification (2026-09-18). Zero new
  dependencies or services and no user friction, consistent with
  Principle IV. The limiter is best-effort: state is per server instance
  and resets on cold start, which is acceptable for a low-volume site.
- **Alternatives considered**: CAPTCHA/Turnstile (rejected: friction, third
  party, EN/AR support); Upstash/Redis limiter (rejected: new
  infrastructure for this scope). Vercel Firewall rate-limit rules can be
  layered on at the platform level later with no code change.

## Phone verification: SMS OTP via Twilio Verify + signed stateless token

- **Decision**: Requested by the user ("use OTP to verify phone number if
  real", interpreted as: prove the number is real by texting it a code).
  Flow: the customer enters the phone (validated and normalized to E.164 by
  `libphonenumber-js`), presses "Send code", and `sendPhoneCode` asks Twilio
  Verify to text a 6-digit code (Twilio generates, stores, expires it, and
  caps attempts; `Locale` is set to `en`/`ar`). The customer enters the code;
  `verifyPhoneCode` calls Twilio's check endpoint. On `approved`, the server
  returns a stateless token: `base64url(payload).base64url(HMAC-SHA256)` with
  payload `{ p: <E.164 phone>, exp: <unix seconds, now + 30 min> }`, signed
  with `PHONE_TOKEN_SECRET` using `node:crypto`. The quote form holds the
  token and sends it with the submission; `submitQuoteRequest` verifies the
  signature (constant-time compare), expiry, and that the token's phone
  equals the submitted phone, else returns `PHONE_NOT_VERIFIED`. Editing the
  phone field clears the token client-side, and a token for another number
  fails server-side.
- **Twilio REST calls** (plain `fetch`, HTTP Basic auth with Account SID +
  Auth Token, no SDK): `POST https://verify.twilio.com/v2/Services/{Sid}/Verifications`
  with `To`, `Channel=sms`, `Locale`; `POST .../VerificationCheck` with `To`,
  `Code`, success when `status === "approved"`.
- **Fail closed**: In production, if any Twilio variable or
  `PHONE_TOKEN_SECRET` is missing, sending returns a failure and no token can
  be minted, so submission is blocked, never silently skipped. Only when
  `NODE_ENV !== "production"` AND Twilio variables are unset, `lib/otp.ts`
  logs the code to the server console and accepts the fixed code `000000`
  (mirrors the existing email dev fallback; makes e2e tests possible). Vercel
  preview deployments run with `NODE_ENV=production`, so they need the real
  variables. `PHONE_TOKEN_SECRET` may use a fixed dev value only outside
  production.
- **Abuse controls** (SMS pumping/toll fraud is the main risk of any public
  OTP send): `lib/rate-limit.ts` is generalized to take a namespace, max and
  window; limits: send 3 per 10 min per IP, 3 per hour per phone number,
  check 10 per 10 min per IP; the client enforces a 60 s resend cooldown
  (FR-007a). Twilio Verify's own per-number send/attempt limits and Fraud
  Guard (enabled in the Twilio console) apply on top. No country allow-list
  in v1 (the audience is international); revisit if fraud appears. The
  in-memory limiter is best-effort per instance, as for FR-011a.
- **Rationale**: Twilio Verify is stateless from our side (no code storage),
  supports Arabic, and fits Principle IV: no database, sessions or accounts.
  The signed token carries proof of verification to the submit action
  without storage. It proves the customer can receive texts at the number,
  which is what "real" reasonably means here.
- **Marketplace check**: `vercel integration discover --category messaging`
  (2026-09-18) lists only Resend (email). No SMS/OTP provider is available
  on the Vercel Marketplace, so Twilio is used directly, configured via
  environment variables as with Resend.
- **Alternatives considered**: Format/validity check only (does not show the
  number is reachable); Twilio Lookup line-type check (shows a number exists,
  not that the customer holds it, extra cost); self-generated codes sent via
  a Twilio messaging number (needs code storage or a bespoke scheme, more
  code and risk); Vonage Verify / MessageBird (equivalent, no advantage for
  this stack); Firebase Phone Auth (adds an accounts/auth system, violates
  Principle IV); WhatsApp or voice channels (out of scope for v1).
- **Cost/operational note**: each verification is a paid SMS; SMS delivery to
  some regions can be delayed or filtered, so the UI must show the resend
  path and clear failure messages.

## Duplicate line items: merge

- **Decision**: The cart store keys lines by `productId+vialId`; adding an
  existing pair adds quantities, capped at 10.
- **Rationale**: Chosen in clarification; keeps the email unambiguous.

## Customer confirmation email: none

- **Decision**: Only the business is emailed; the customer sees the
  on-screen confirmation page.
- **Rationale**: Chosen in clarification; avoids sending mail to arbitrary
  customer-supplied addresses (abuse vector) and a second template.

## Styling/design: Tailwind CSS + `/impeccable` skill

- **Decision**: Tailwind CSS utility classes, with layout/visual decisions
  guided by the `/impeccable` design skill per constitution Principle III.
- **Rationale**: User explicitly requested `/impeccable` for design; Tailwind
  pairs naturally with Next.js and keeps styling co-located with components.
- **Alternatives considered**: CSS Modules / styled-components — rejected,
  no reason to diverge from the Next.js + Tailwind default pairing.

## Internationalization: `next-intl`

- **Decision**: `next-intl` for locale routing (`/en`, `/ar`) and message
  catalogs, with a `proxy.ts` (Next.js 16's replacement for `middleware.ts`) handling locale detection/redirect and
  `app/[locale]/layout.tsx` setting `<html lang dir>` (`dir="rtl"` for
  Arabic).
- **Rationale**: `next-intl` is the standard App Router i18n library —
  handles routing, message loading, and pluralization with minimal config;
  avoids hand-rolling locale detection/redirect logic.
- **Alternatives considered**: Manual locale context + two static page
  trees — rejected as more code to maintain for the same result; the
  official `next-intl` App Router pattern is well-documented and small.

## RTL layout strategy

- **Decision**: Use Tailwind's logical-property utilities (`ps-`/`pe-`,
  `start-`/`end-`, `text-start`) instead of physical `pl-`/`pr-`/`text-left`
  wherever direction-sensitive, plus `dir="rtl"` on `<html>` for Arabic so
  the browser flips default block/inline flow automatically.
- **Rationale**: This is the lowest-maintenance way to get correct mirrored
  layout without duplicating styles per direction.
- **Alternatives considered**: Separate RTL stylesheet overrides — rejected
  as extra surface to keep in sync with every future style change.

## Pricing model: quote-request, no published prices

- **Decision**: No price field anywhere in the data model or UI; the flow
  is explicitly a "request a quote" submission, not a priced cart.
- **Rationale**: The real product content the business provided has no
  prices — it uses a "Contact us for more information" call to action. The
  user confirmed this over the earlier price-per-vial assumption.
- **Alternatives considered**: Price-per-vial with computed subtotal
  (original plan) — superseded once real content and the user's explicit
  choice ruled it out.

## Testing: Vitest + React Testing Library + Playwright

- **Decision**: Vitest/RTL for unit/component tests (schema validation,
  cart logic, disclaimer rendering); Playwright for one end-to-end smoke
  test covering browse → select variant → submit order → confirmation.
- **Rationale**: Standard, low-overhead pairing for a Next.js app of this
  size; Playwright smoke test directly validates spec.md's Success Criteria
  (SC-001, SC-002, SC-004).
- **Alternatives considered**: Jest — Vitest chosen for faster local runs
  and native ESM/TS support with less config.

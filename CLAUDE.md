# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A responsive, bilingual (English + Arabic/RTL) Next.js storefront for a
research-peptide catalog. There is **no payment gateway and no published
pricing anywhere** — visitors build a "quote request" (product + vial +
quantity) and submit it; the business receives it by email and follows up
manually with pricing. This is a hard product constraint, not a missing
feature — see `.specify/memory/constitution.md` Principles II and V before
adding anything that looks like a price, cart total, or checkout.

Every product is marketed strictly as "for research/laboratory use only —
not for human consumption," framed around *research areas of interest*
(never therapeutic claims). See constitution Principle I before editing any
product copy, disclaimer, or the 18+/research-use acknowledgment gate.

## Commands

```bash
npm run dev          # start dev server (redirects / -> /en)
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit -p tsconfig.json   # type-check only (faster than build)
npm run test         # Vitest unit tests (tests/unit/)
npm run test:e2e     # Playwright e2e tests (tests/e2e/) — starts its own dev server
```

Run a single Vitest file: `npx vitest run tests/unit/quote-schema.test.ts`.
Run a single Playwright test: `npx playwright test quote-flow.spec.ts`.

No database and no external services are required for local dev.
`lib/email.ts` logs quote-request emails to the server console when
`RESEND_API_KEY` is unset, so the full flow works without any API key —
see `.env.local.example`. Phone verification (SMS one-time code via Twilio
Verify, `lib/otp.ts`) has the same kind of dev fallback: with no `TWILIO_*`
variables and `NODE_ENV !== "production"` the code is logged to the console
and `000000` is accepted. In production it fails closed (no fallback), so
never loosen that check. Submission also requires a valid sign-in: after a
correct code, `verifyPhoneCode` sets the HttpOnly `pepclub_session` cookie
(signed, 30 days, `lib/session.ts`, secret `PHONE_TOKEN_SECRET`), and
`submitQuoteRequest` takes the verified phone only from that cookie — it
returns `NOT_SIGNED_IN` without one. The Playwright config blanks the
`TWILIO_*` variables so e2e always uses the dev fallback, even if
`.env.local` holds real credentials.

## Architecture

**Locale routing (`next-intl`)**: every real route lives under
`app/[locale]/...` (`en` or `ar`). `proxy.ts` (Next.js 16's replacement for
`middleware.ts` — see below) runs `next-intl`'s middleware to redirect `/`
to the default locale and validate the `[locale]` segment. `i18n/routing.ts`
declares the supported locales; `i18n/request.ts` loads the matching
`messages/<locale>.json` file. `app/[locale]/layout.tsx` sets
`<html lang dir>` (`dir="rtl"` for Arabic) and mounts
`NextIntlClientProvider` — client components can call `useTranslations()`
directly without prop-drilling messages. Both message files
(`messages/en.json`, `messages/ar.json`) **must stay key-for-key in sync**;
adding a UI string means adding it to both.

**No database — a few Server Actions**: `lib/products.ts` is the entire
product catalog as a static array (no price field — see constraint above).
The only server-side logic is in `app/[locale]/quote/` (`"use server"`):
`otp-actions.ts` sends/checks the phone one-time code (setting the session
cookie) and signs out, and `actions.ts` handles the submission. `actions.ts` re-validates the submission against
`lib/quote-schema.ts` (the same Zod schema the client form uses via
`@hookform/resolvers/zod`), re-resolves every line item's product/vial
against `lib/products.ts` server-side (never trusts client-submitted
labels), and calls `lib/email.ts` to notify the business. Nothing is
persisted; a submitted quote request only ever exists as that outbound
email.

**Sign-in and remembered details (spec `002-phone-signin-prefill`)**:
"signed in" only means this browser verified a phone number in the last 30
days — no accounts, passwords or stored users. Submitting while signed out
saves the typed values as a draft (`sessionStorage`, via
`lib/quote-storage.ts`) and navigates to `/[locale]/signin`, which returns to
`/quote`. After a successful submit the name, email and address are
remembered per browser (`localStorage`, keyed to the phone) and prefilled
only while a valid session for that same phone exists. The 18+/research-use
acknowledgment and notes are never remembered. `app/[locale]/quote/page.tsx`
and `signin/page.tsx` read the cookie, so those two routes are dynamic.

**Client-side cart**: `lib/cart-store.tsx` is a
singleton module-level store (not per-component React state) exposed via
`useSyncExternalStore`, backed by `localStorage`, wrapped by
`CartProvider`/`useCart()`. It's a module singleton so multiple components
(header badge, quote summary, product page) stay in sync without prop
drilling. `getServerSnapshot` must keep returning the same cached empty-
array reference — a fresh `[]` on every call triggers React's
"getServerSnapshot should be cached" infinite-loop warning. Tests must call
`__resetCartStoreForTests()` in `beforeEach`, since the store is a process-
wide singleton, not scoped per test.

**Error-code translation pattern**: both the client Zod schema
(`lib/quote-schema.ts`) and the server action's `fieldErrors` use short
codes as `message` (`"required"`, `"invalidEmail"`, `"ackRequired"`, ...),
never literal English text — the schema has no locale awareness. Every
place a form error is rendered (see `translateFieldError` in
`components/quote-form.tsx`) must map that code through the `errors.*`
message namespace before displaying it. Don't render
`errors.<field>?.message` directly; it will leak the raw code to the UI in
both languages.

## Brand & design system

The site is **Pep Club** ("Premium Peptides"), not a generic placeholder —
see `PRODUCT.md` for product/brand truth and `DESIGN.md` for the visual
system ("the Vial-Label System": white/off-white ground, deep navy + one
cornflower-blue accent matched directly to the logo, die-cut label-shaped
cards as the one repeating UI unit). Read `DESIGN.md` before adding or
restyling any UI — it records
concrete Do's/Don'ts (e.g., no kicker/eyebrow lines above headings, no
fabricated batch/lot data, bidi-isolate Latin values like "10 mg" inside
Arabic text via `components/ltr-value.tsx`). This project uses the
`/impeccable` design skill (`.claude` skill, loaded from
`~/.claude/skills/impeccable`); load its `reference/craft-floor.md` before
any further UI work.

## Spec Kit workflow

This project is planned with [GitHub Spec Kit](https://github.com/github/spec-kit)
(`.specify/` + `.claude/skills/speckit-*`). Before starting non-trivial new
work, read `.specify/memory/constitution.md` (project principles) and
`specs/001-peptide-storefront/` (spec.md, plan.md, data-model.md,
contracts/, tasks.md) for the current feature. For a new feature, follow
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
rather than jumping straight to code. If a change conflicts with the
constitution (e.g., someone asks to "just add a price field"), flag the
conflict rather than silently implementing it — Principles I, II, and V are
explicitly load-bearing product decisions, not oversights.

## Next.js version note

This project runs on Next.js 16.3.x, which is newer than most training
data. Version-matched docs ship inside the package at
`node_modules/next/dist/docs/` — check there (or `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`
for the meta-guide) before assuming an older-Next.js API/convention still
applies. Two things already changed and are handled correctly in this repo
— don't "fix" them back:

- The middleware file convention is now `proxy.ts` (default- or named-export
  `proxy`), not `middleware.ts`.
- `next.config.ts` sets `agentRules: false` because this file exists;
  otherwise `next dev` overwrites `AGENTS.md`/`CLAUDE.md` with its own
  generated pointer on every run.

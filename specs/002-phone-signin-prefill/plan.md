# Implementation Plan: Phone Sign-In and Remembered Quote Details

**Branch**: `002-phone-signin-prefill` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-phone-signin-prefill/spec.md`

## Summary

Replace the inline, per-submission phone check on the quote form with a
sign-in step. A visitor with no valid session who presses Submit is sent to
a dedicated sign-in page (phone number + one-time code), then returned to
the quote page with their cart and typed values intact. Verification sets a
**signed, HttpOnly session cookie** (30 days, no database) that the
`submitQuoteRequest` Server Action reads as the sole proof of the verified
phone. While signed in, the quote form prefills name, email and address
from a **per-browser remembered profile** (`localStorage`) saved after each
successful submission, and shows a "signed in as" line with Sign out and
Clear my details.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 (unchanged from 001)

**Primary Dependencies**: Existing only — Next.js 16 (App Router, Server
Actions, `cookies()` from `next/headers`), React 19, `next-intl`, Zod,
React Hook Form, `libphonenumber-js`. **No new dependencies.**

**External Services**: Twilio Verify via existing `lib/otp.ts` (unchanged,
including its dev fallback: `000000` accepted when no `TWILIO_*` variables
and `NODE_ENV !== "production"`). `PHONE_TOKEN_SECRET` is reused as the
cookie-signing secret (production fails closed if unset).

**Storage**: No database. Two browser-side stores plus one cookie:
- `pepclub_session` — HttpOnly, signed cookie: verified phone + expiry
- `localStorage["pepclub.profile"]` — remembered details (name, email,
  phone, address)
- `sessionStorage["pepclub.quoteDraft"]` — in-flight form values across
  the sign-in round trip

**Testing**: Vitest (session sign/verify, profile/draft storage helpers,
schema changes), Playwright (sign-in gate, return trip, prefill, sign-out,
in both locales)

**Target Platform**: Web, Vercel (unchanged)

**Project Type**: Single Next.js web application (unchanged)

**Performance Goals**: Sign-in page and quote page meet the existing 2s
mobile budget; session check adds no network round trip beyond the page
render.

**Constraints**: No payment/price fields (II, V); acknowledgment required on
every submission (I); everything bilingual with RTL correctness (III); no
DB, no new infrastructure (IV); `getServerSnapshot` caching rule for any
new `useSyncExternalStore` store (CLAUDE.md).

**Scale/Scope**: One new route (`/[locale]/signin`), one new lib module, one
new server-action file section, edits to the quote form, `otp-actions.ts`,
`actions.ts`, `quote-schema.ts`, and both message files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Legal & Compliance First | PASS | Acknowledgment is never remembered or prefilled (FR-011) and is still validated server-side per submission. Disclaimer stays on quote page and is added to the sign-in page (FR-016). |
| II. No Payment Processing | PASS | No payment field, price or total added (FR-018). |
| III. Responsive & Accessible, Bilingual | PASS (work item) | New sign-in page and signed-in line need EN/AR strings, RTL layout, `LtrValue` for phone numbers, keyboard/focus handling. `/impeccable` craft-floor to be loaded before UI work. |
| IV. Simple, Maintainable Stack | PASS with note | "No database, no auth systems." A stateless, HMAC-signed cookie proves only "this browser verified this number"; there are no accounts, passwords, user records, or server storage, and no new dependency (it extends the HMAC signing already in `lib/phone-token.ts`). Judged not an "auth system" in the sense the principle guards against. See Complexity Tracking; no amendment needed, but the interpretation is recorded here. |
| V. Transparent Product Information | PASS | Flow remains a "request a quote"; no dark patterns. Sign-in copy must say the number is used to verify the request, not to create an account. |

**Post-design re-check**: unchanged — PASS. The design adds no storage
beyond the visitor's own browser.

## Project Structure

### Documentation (this feature)

```text
specs/002-phone-signin-prefill/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── session-actions.md     # Server Action contracts (sign-in, sign-out, session read, submit)
│   └── browser-storage.md     # profile + draft storage contracts, sign-in route contract
└── tasks.md                   # created later by /speckit-tasks
```

### Source Code (repository root)

```text
app/[locale]/
├── quote/
│   ├── page.tsx              # EDIT: read session (cookies), pass phone to QuoteForm
│   ├── actions.ts            # EDIT: require session cookie; drop client token/phone
│   └── otp-actions.ts        # EDIT: verifyPhoneCode sets session cookie; add signOut
└── signin/
    └── page.tsx              # NEW: dedicated sign-in step (disclaimer + form)

components/
├── quote-form.tsx            # EDIT: no phone field/verification; signed-in line;
│                             #       prefill; draft save/restore; redirect on submit
├── phone-verification.tsx    # EDIT: becomes the sign-in step's core (own phone input)
└── signin-form.tsx           # NEW: phone + code UI wrapper, return navigation

lib/
├── session.ts                # NEW (replaces phone-token.ts): sign/read 30-day session
├── quote-storage.ts          # NEW: profile + draft read/write/clear (try/catch-safe)
└── quote-schema.ts           # EDIT: drop customerPhone/phoneVerificationToken from input

messages/{en,ar}.json         # EDIT: signIn.* namespace + quoteForm additions
types/catalog.ts              # EDIT: QuoteRequestInput, VerifyPhoneCodeResult, new error code
tests/
├── unit/                     # session, quote-storage, quote-schema, messages-parity
└── e2e/                      # quote-flow (updated), signin-prefill.spec.ts (new)
```

**Structure Decision**: Stay within the existing single Next.js app. The
sign-in step is its own route so it can be reached by navigation (per the
request) and keeps the quote form simple; session logic lives in one lib
module shared by the two Server Action files.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| A signed session cookie (Principle IV "no auth systems") | The request needs "verified once, skip next time," and the server must be able to trust that without re-sending an SMS. | Re-verifying every quote defeats the request. A client-only "verified" flag in `localStorage` is forgeable, breaking the guarantee that no unverified number is ever accepted (001 SC-008). A user database is heavier and is exactly what Principle IV forbids. |

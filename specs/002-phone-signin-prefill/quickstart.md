# Quickstart: Validating Phone Sign-In and Remembered Details

## Prerequisites

- `npm install`, then `npm run dev`. No `TWILIO_*` variables needed: in
  development the server accepts code `000000` (see `lib/otp.ts`).
- Use a fresh browser profile/private window, or clear site data between
  scenarios.
- Test number: `+14155552671`. Both `/en` and `/ar` must be run.

## Scenarios

1. **Gate + return trip (US1)** — Add TB-500 (10 mg) to the quote, open
   `/en/quote`, fill name, email, address and notes, tick the
   acknowledgment, press Submit. *Expect*: you land on `/en/signin`; no
   email is logged. Enter the number, request a code, enter `000000`.
   *Expect*: back on `/en/quote`, cart intact, name/email/address/notes
   still filled, acknowledgment **unchecked**, signed-in line visible.
2. **Skip when signed in (US1)** — Tick the acknowledgment, Submit.
   *Expect*: goes straight to confirmation; server console shows one
   email whose phone is the verified number.
3. **Prefill (US2)** — Add another item, open the quote page. *Expect*:
   name, email and address are prefilled; notes empty; acknowledgment
   unchecked. Edit the city, submit, start another quote: the new city is
   prefilled.
4. **Different number (US3)** — Sign out, then sign in with a second valid
   number. *Expect*: form is empty (profile belonged to the first number).
5. **Sign out / clear (US3)** — Signed in with a profile: press **Clear my
   details** → fields are empty on reload but still signed in. Press
   **Sign out** → signed-in line disappears, Submit leads to `/signin`,
   cart untouched.
6. **Expiry** — In devtools delete or alter the `pepclub_session` cookie,
   press Submit. *Expect*: redirected to sign-in with typed values kept
   (covers the `NOT_SIGNED_IN` path).
7. **Wrong code** — Enter `123456`. *Expect*: translated error, not
   signed in, resend wait respected.
8. **Storage blocked** — Disable site data. *Expect*: sign-in and submit
   still work; form starts empty; no console errors.
9. **Language switch mid-way** — Start in `/en`, switch to `/ar` on the
   sign-in page. *Expect*: session and draft survive; RTL layout; phone
   number isolated (`LtrValue`).
10. **Responsive/RTL audit** — Sign-in and quote pages at 320px and
    1920px, both locales: no horizontal scroll, disclaimer visible.

## Automated checks

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint
npm run test          # session, quote-storage, quote-schema, messages parity
npm run test:e2e      # updated quote-flow + new signin-prefill spec
```

Expected: all green; `messages-parity` confirms EN/AR keys match.

## Production-only checks (Vercel preview)

- `PHONE_TOKEN_SECRET` and `TWILIO_*` set; the cookie is `Secure` and
  `HttpOnly` (devtools → Application → Cookies).
- With `PHONE_TOKEN_SECRET` unset, sign-in fails closed (no fallback).

## Results (2026-09-20, dev server, both locales)

Automated: `npx tsc --noEmit` clean; `npm run lint` clean; `npm run test`
69/69 passing (10 files); `npm run test:e2e` 24/24 passing.

Covered by `tests/e2e/signin-prefill.spec.ts` and `quote-flow.spec.ts`:
scenarios 1 (gate + return trip, acknowledgment unchecked on return),
2 (no second verification), 3 (prefill, edits remembered), 4 (different
number / signed-out visitor not prefilled), 5 (Clear my details, Sign out),
6 (removed session cookie -> sign-in with values kept), 7 (wrong code),
and the Arabic sign-in with an LTR code field. Scenario 10 is covered at
375px for `/en/signin` and `/ar/signin` in `responsive.spec.ts`.

Not yet done by hand: scenario 8 (browser with storage blocked; unit-tested
only), scenario 9 (language switch in the middle of sign-in), a 320px/1920px
visual pass, the `/impeccable` craft-floor review (T024), and the
production-only checks (T028, needs Vercel + Twilio + Resend credentials).

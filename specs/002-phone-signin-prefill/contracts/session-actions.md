# Contract: Server Actions (session)

All in `app/[locale]/quote/`. Error `message` values are already translated
server-side via the `errors` namespace (existing pattern); field error
values use short codes translated by `translateFieldError`.

## `sendPhoneCode({ phone, locale })` — unchanged

Returns `{ ok: true, phone, resendAfterSeconds }` or
`{ ok: false, error: { code: RATE_LIMITED | INVALID_PHONE | SEND_FAILED, message } }`.
Existing per-IP and per-phone rate limits apply.

## `verifyPhoneCode({ phone, code, locale })` — CHANGED

- On success: sets cookie `pepclub_session` (see data-model.md) for the
  normalized phone, returns `{ ok: true, phone }`. **No token is returned.**
- On failure: unchanged codes `INVALID_CODE | CODE_EXPIRED | RATE_LIMITED |
  VERIFY_FAILED`. No cookie is set or modified.
- If a session already exists for another number, it is replaced.

## `signOut()` — NEW

- Clears `pepclub_session`. Idempotent; always returns `{ ok: true }`.
- The client additionally deletes `pepclub.profile` (localStorage is not
  reachable from the server) and leaves the cart untouched.

## `submitQuoteRequest(input)` — CHANGED

Input drops `customerPhone` and `phoneVerificationToken`:

```text
{ lineItems, customerName, customerEmail, shippingAddress, notes?,
  ageAndResearchUseAck, website?, locale }
```

Order of checks (existing ones keep their order and behavior):

1. Rate limit (`RATE_LIMITED`) — unchanged
2. Honeypot — unchanged
3. **Session check → `{ ok: false, error: { code: "NOT_SIGNED_IN", message } }`
   if the cookie is missing, malformed, badly signed, or expired**
4. Zod validation of the input (`ackRequired` etc.) — unchanged
5. Line items re-resolved against `lib/products.ts` — unchanged
6. Email sent with `customerPhone` = the session phone

The client, on `NOT_SIGNED_IN`, saves the draft and navigates to sign-in.
Success returns `{ ok: true }` as before.

## Session helper (`lib/session.ts`) — internal

- `createSession(phone, now?) → { value, expiresAt }`
- `readSession(value, now?) → { phone } | null` (timing-safe, checks `exp`)
- `getSessionPhone() → string | null` reads the cookie from `next/headers`
- Secret: `PHONE_TOKEN_SECRET`; throws in production if unset, returns
  `null`/false on read failures rather than throwing at request time.

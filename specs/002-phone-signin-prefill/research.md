# Research: Phone Sign-In and Remembered Quote Details

All Technical Context items were resolvable from the existing codebase; no
`NEEDS CLARIFICATION` remained after `/speckit-clarify`.

## D1. How "signed in" is proven

- **Decision**: An HMAC-signed, HttpOnly cookie `pepclub_session` holding
  `{ p: <E.164 phone>, exp: <unix seconds> }`, 30-day expiry, `SameSite=Lax`,
  `Secure` in production, `Path=/` (so switching `/en` ↔ `/ar` keeps it).
  Set by the `verifyPhoneCode` Server Action after a correct code; read by
  `submitQuoteRequest` and the quote/sign-in pages via `cookies()`.
- **Rationale**: Reuses the existing HMAC scheme (`lib/phone-token.ts`,
  `PHONE_TOKEN_SECRET`, fail-closed in production). HttpOnly keeps it out of
  page scripts; the server, not the client, decides who is verified, so the
  "no unverified phone" guarantee (001 SC-008) still holds. No DB, no new
  dependency (Principle IV).
- **Alternatives considered**: (a) `localStorage` "verified" flag — forgeable;
  rejected. (b) Keep passing the token from the client, just with a 30-day
  TTL — token would live in JS-readable storage, and would still need a
  client-held phone→token map; rejected for security and complexity.
  (c) Auth library / user DB — violates Principle IV.
- **Known limitation**: no server-side revocation. Signing out clears the
  cookie in that browser only; a copied cookie stays valid until expiry.
  Accepted for a low-stakes "verified contact number" use; mitigated by
  HttpOnly + Secure and the existing OTP rate limits.

## D2. Phone number source at submit

- **Decision**: The submitted phone comes from the session, never from the
  client. The quote form has no phone input; it shows the verified number.
  `customerPhone` and `phoneVerificationToken` are removed from the client
  input; the server injects the session phone into the email payload.
- **Rationale**: Removes the whole class of "token for a different number"
  mismatches and makes FR-009 (phone editable only by re-signing in)
  structural.
- **Alternatives considered**: Keep a phone field pre-filled and read-only —
  extra surface for mismatch errors with no benefit.

## D3. Sign-in as a page, with return trip

- **Decision**: New route `app/[locale]/signin/page.tsx`. Submit (after the
  form validates) saves the draft and navigates there. On success it
  navigates to `/quote` if the cart has items, else `/` (edge case in
  spec). No `next` URL parameter; the destination is derived, so there is
  no open-redirect surface.
- **Rationale**: Matches "navigate him to sign in"; keeps the form free of
  OTP UI; locale is preserved by the existing localized `router`.
- **Alternatives considered**: Modal/inline step (not "navigate"; harder for
  Arabic focus order); arbitrary `?next=` param (open-redirect risk).

## D4. Preserving typed values across the round trip

- **Decision**: On the redirect, write current form values (name, email,
  address, notes; **not** the acknowledgment) to `sessionStorage`
  `pepclub.quoteDraft`. The quote form restores it on mount, then deletes
  it. Restored values win over remembered-profile values (FR-010).
- **Rationale**: Survives client navigation and a full reload of the
  sign-in page; scoped to the tab; disappears when the tab closes so no
  long-lived copy of typed-but-unsent data.
- **Alternatives considered**: `localStorage` draft (outlives the session,
  privacy cost); URL params (leaks details into history/logs).

## D5. Remembered details storage and prefill rule

- **Decision**: `localStorage` `pepclub.profile` = `{ phone, name, email,
  address }`, written only after a successful submission (FR-008), replacing
  the previous value. Prefill runs only when a valid session exists **and**
  `profile.phone === session.phone`; otherwise the form is empty (FR-007,
  US3 scenario 2, clarification Q2). Fills only fields not already typed.
  Sign out and Clear my details both delete it.
- **Rationale**: Per-device storage matches the spec and needs no server
  record. Binding the profile to the phone stops one person's address
  appearing after a different number signs in.
- **Alternatives considered**: Cookie-stored profile (sent on every
  request, size limits); server-side profile (needs a DB — out of scope).

## D6. Session read on the client without breaking statics

- **Decision**: `quote/page.tsx` and `signin/page.tsx` read the cookie on
  the server and pass `sessionPhone: string | null` as a prop. These two
  pages become dynamically rendered.
- **Rationale**: No client-side flash of the wrong state and no extra
  round trip; the rest of the site stays static. `next.config.ts` has no
  Cache Components enabled, so reading `cookies()` simply opts these routes
  into dynamic rendering.
- **Alternatives considered**: Client-side "am I signed in?" Server Action on
  mount — flicker between empty and prefilled states, extra request.

## D7. Expired or missing session at submit time

- **Decision**: `submitQuoteRequest` returns a new error code
  `NOT_SIGNED_IN` when the cookie is absent, invalid, or expired. The form
  handles it exactly like the client-side "not signed in" path: save draft,
  navigate to sign-in. This covers cross-tab sign-out and expiry between
  page load and Submit (spec edge cases).
- **Rationale**: Server is authoritative; client state is only a hint.

## D8. Session TTL change vs. existing token

- **Decision**: `lib/phone-token.ts` (30-minute token bound to a phone) is
  superseded by `lib/session.ts` (30-day cookie value). Same HMAC and
  timing-safe compare; TTL becomes a parameter. Tests migrate from
  `phone-token.test.ts` to `session.test.ts`.
- **Rationale**: One signing implementation; avoids two similarly named
  mechanisms.

## D9. Cookie and privacy notes

- The session cookie is strictly necessary for a feature the visitor
  triggers by verifying their number; no analytics or tracking use. Sign-in
  copy states what is stored and for how long, and links to nothing
  external. Confirm with the business whether a cookie notice is required
  for their markets (flagged for the compliance review already
  recommended for launch).

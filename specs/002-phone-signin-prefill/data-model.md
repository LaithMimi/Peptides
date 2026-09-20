# Data Model: Phone Sign-In and Remembered Quote Details

No server-side persistence is added. Three small browser-scoped records.

## Sign-in Session (cookie `pepclub_session`)

| Field | Type | Rules |
|-------|------|-------|
| `p` | string (E.164) | The one verified phone number; produced by `parsePhone`. |
| `exp` | integer (unix seconds) | `issued + 30 days`; a session with `exp <= now` is treated as absent. |
| signature | HMAC-SHA256, base64url | Over the payload, keyed by `PHONE_TOKEN_SECRET`; compared timing-safe. |

Wire format: `<base64url(JSON{p,exp})>.<signature>` (same shape as the
current phone token).

**Lifecycle**: *absent* → (correct OTP) → *active* → (expiry or Sign out) →
*absent*. Signing in with a different number replaces the cookie.

**Cookie attributes**: HttpOnly, Secure (production), SameSite=Lax,
Path=/, Max-Age 30 days.

## Remembered Details (`localStorage["pepclub.profile"]`)

| Field | Type | Rules |
|-------|------|-------|
| `version` | 1 | Lets a future shape change discard old data safely. |
| `phone` | string (E.164) | Owner of the profile; prefill only if equal to the session phone. |
| `customerName` | string | As last submitted. |
| `customerEmail` | string | As last submitted. |
| `shippingAddress` | string (single line, required) | As last submitted. Older stored multi-field addresses are folded into one line on read. |

Never stored: notes, acknowledgment, cart, verification data.

**Lifecycle**: written on `submitQuoteRequest` success (replaces previous);
deleted by Sign out or Clear my details; ignored (not deleted) when the
phone doesn't match the current session. Unparseable or wrong-`version`
data is treated as absent. All reads/writes are wrapped in try/catch and
degrade to "nothing remembered."

## Quote Draft (`sessionStorage["pepclub.quoteDraft"]`)

| Field | Type | Rules |
|-------|------|-------|
| `version` | 1 | As above. |
| `customerName`, `customerEmail`, `shippingAddress`, `notes` | as form values | Whatever the visitor typed. |

Never stored: acknowledgment (must be re-given, FR-011), phone.

**Lifecycle**: written when Submit redirects to sign-in; read once and
deleted when the quote form mounts; also deleted after a successful
submission. Restored values take precedence over the remembered profile.

## Changes to existing shapes

- `shippingAddress` is now one required string (no postal code, no separate city/region/country fields), replacing the earlier multi-field address.
- `QuoteRequestInput`: remove `customerPhone` and `phoneVerificationToken`.
- Server-side request (`quoteRequestSchema` output used by email): still
  has `customerPhone`, now injected from the session.
- `quoteContactFormSchema`: also omits `customerPhone`.
- `VerifyPhoneCodeResult` success: no longer returns a token (the cookie is
  set server-side); returns `{ ok: true, phone }`.
- `QuoteRequestResult` error codes: add `NOT_SIGNED_IN`.

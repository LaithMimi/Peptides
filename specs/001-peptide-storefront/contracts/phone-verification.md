# Contract: Phone Verification (Server Actions)

Two Server Actions in `app/[locale]/quote/otp-actions.ts`, called by
`components/phone-verification.tsx` before the quote form can be submitted
(FR-007a). The verified result is carried to `submitQuoteRequest` as a signed
token; see `submit-quote-request.md`. No field here is or contains a price.

## `sendPhoneCode(input: { phone: string; locale: "en" | "ar" }): Promise<SendPhoneCodeResult>`

Steps: rate-limit (per IP and per phone) → parse/validate the phone to E.164 →
ask Twilio Verify to text a code (channel `sms`, locale = `locale`).

```ts
type SendPhoneCodeResult =
  | { ok: true; phone: string /* normalized E.164 */; resendAfterSeconds: 60 }
  | { ok: false; error: {
      code: "INVALID_PHONE" | "RATE_LIMITED" | "SEND_FAILED";
      message: string; // localized, shown to the customer
    } };
```

| Case | `code` | Client behavior |
|---|---|---|
| Not a valid international number | `INVALID_PHONE` | Inline error on the phone field; no code sent |
| Send limit hit (IP or phone) | `RATE_LIMITED` | Retry-later message; form data kept |
| Twilio rejects the number (e.g. cannot receive SMS), errors, or is unconfigured in production | `SEND_FAILED` | Clear failure message; customer can correct the number or retry |

## `verifyPhoneCode(input: { phone: string; code: string; locale: "en" | "ar" }): Promise<VerifyPhoneCodeResult>`

Steps: rate-limit (per IP) → validate `code` is 6 digits → Twilio Verify
check → on `approved`, mint the signed token (30 min).

```ts
type VerifyPhoneCodeResult =
  | { ok: true; token: string; expiresAt: string /* ISO datetime */ }
  | { ok: false; error: {
      code: "INVALID_CODE" | "CODE_EXPIRED" | "RATE_LIMITED" | "VERIFY_FAILED";
      message: string; // localized
    } };
```

| Case | `code` | Client behavior |
|---|---|---|
| Wrong code | `INVALID_CODE` | Message; customer can retry or resend |
| Code expired or attempts exhausted at Twilio | `CODE_EXPIRED` | Prompt to request a new code |
| Check limit hit | `RATE_LIMITED` | Retry-later message |
| Twilio error/unconfigured in production | `VERIFY_FAILED` | Clear failure message; submission stays blocked |

## Token

`base64url(JSON {p, exp}) + "." + base64url(HMAC-SHA256(PHONE_TOKEN_SECRET, payload))`.
`p` is the E.164 phone, `exp` Unix seconds (now + 30 min). Verified in
`lib/phone-token.ts` with a constant-time comparison. It is a bearer proof for
one number only; it is never stored server-side.

## Environment variables

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`,
`PHONE_TOKEN_SECRET` (long random string). Never committed; set as Vercel
environment variables. In production all four are required (fail closed).
Outside production, if the three Twilio variables are unset, the code is
logged to the server console and `000000` is accepted.

## Non-goals

No SMS content other than the provider's standard verification text (no
product names, claims or marketing; Principle I). No WhatsApp/voice channel.
